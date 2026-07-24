import { BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Repository } from 'typeorm';
import { CreateEventEntity } from '../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../database/entities/query-event.entity';

// Repos falsos en memoria, siguiendo el mismo estilo de mocking manual que
// ya usa SuscripcionesService.spec.ts (sin @nestjs/testing) para no añadir
// dependencias nuevas.
function fakeRepo() {
  const rows: any[] = [];
  return {
    rows,
    create: (data: any) => ({ ...data }),
    save: async (row: any) => {
      rows.push(row);
      return row;
    },
    find: async () => rows,
    findBy: async (query: Record<string, any>) =>
      rows.filter((r) => Object.entries(query).every(([k, v]) => r[k] === v)),
    count: async () => rows.length,
  };
}

describe('EventsService', () => {
  let service: EventsService;
  let createRepo: ReturnType<typeof fakeRepo>;
  let updateRepo: ReturnType<typeof fakeRepo>;
  let deleteRepo: ReturnType<typeof fakeRepo>;
  let queryRepo: ReturnType<typeof fakeRepo>;

  const baseDto = (
    overrides: Partial<CreateEventDto> = {},
  ): CreateEventDto => ({
    source: 'subscription-manager',
    entity: 'suscripcion',
    action: 'CREATE',
    title: 'Nueva suscripción',
    description: 'Spotify Premium',
    payload: { nombre: 'Spotify' },
    ...overrides,
  });

  beforeEach(() => {
    createRepo = fakeRepo();
    updateRepo = fakeRepo();
    deleteRepo = fakeRepo();
    queryRepo = fakeRepo();
    service = new EventsService(
      createRepo as unknown as Repository<CreateEventEntity>,
      updateRepo as unknown as Repository<UpdateEventEntity>,
      deleteRepo as unknown as Repository<DeleteEventEntity>,
      queryRepo as unknown as Repository<QueryEventEntity>,
    );
  });

  it('registra un evento CREATE en la tabla correspondiente', async () => {
    const result = await service.registerEvent(baseDto());
    expect(result).toEqual({ ok: true });
    expect(createRepo.rows).toHaveLength(1);
    expect(updateRepo.rows).toHaveLength(0);
  });

  it('registra un evento UPDATE en la tabla correspondiente', async () => {
    await service.registerEvent(baseDto({ action: 'UPDATE' }));
    expect(updateRepo.rows).toHaveLength(1);
  });

  it('registra un evento DELETE en la tabla correspondiente', async () => {
    await service.registerEvent(baseDto({ action: 'DELETE' }));
    expect(deleteRepo.rows).toHaveLength(1);
  });

  it('registra un evento QUERY en la tabla correspondiente', async () => {
    await service.registerEvent(baseDto({ action: 'QUERY' }));
    expect(queryRepo.rows).toHaveLength(1);
  });

  it('devuelve ok:false para una acción no reconocida, sin lanzar excepción', async () => {
    const result = await service.registerEvent(baseDto({ action: 'PATCH' }));
    expect(result).toEqual({ ok: false });
  });

  it('findAll ordena eventos de distintas tablas por fecha real, no por string', async () => {
    await service.registerEvent(
      baseDto({ action: 'CREATE', title: 'primero' }),
    );
    await new Promise((r) => setTimeout(r, 5));
    await service.registerEvent(
      baseDto({ action: 'DELETE', title: 'segundo' }),
    );
    await new Promise((r) => setTimeout(r, 5));
    await service.registerEvent(
      baseDto({ action: 'UPDATE', title: 'tercero' }),
    );

    const all = (await service.findAll()) as any[];
    const titles = all.map((e) => e.title);
    expect(titles).toEqual(['primero', 'segundo', 'tercero']);
  });

  it('findByEntity rechaza un filtro vacío (EEM-4)', async () => {
    await expect(service.findByEntity('   ')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('findByEntity retorna coincidencias para un filtro válido', async () => {
    await service.registerEvent(baseDto({ entity: 'suscripcion' }));
    await service.registerEvent(baseDto({ entity: 'evento-academico' }));
    const result = await service.findByEntity('suscripcion');
    expect(result).toHaveLength(1);
  });

  it('findBySource rechaza un filtro demasiado largo', async () => {
    const longSource = 'x'.repeat(200);
    await expect(service.findBySource(longSource)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('getStats suma correctamente los cuatro contadores', async () => {
    await service.registerEvent(baseDto({ action: 'CREATE' }));
    await service.registerEvent(baseDto({ action: 'CREATE' }));
    await service.registerEvent(baseDto({ action: 'UPDATE' }));
    const stats = (await service.getStats()) as any;
    expect(stats).toEqual({
      create: 2,
      update: 1,
      delete: 0,
      query: 0,
      total: 3,
    });
  });
});
