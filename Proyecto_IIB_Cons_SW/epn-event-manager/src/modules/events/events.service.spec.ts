import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
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

  it('rechaza un payload vacío en el DTO del evento', async () => {
    const dto = new CreateEventDto();
    Object.assign(dto, {
      source: 'subscription-manager',
      entity: 'suscripcion',
      action: 'CREATE',
      title: 'Suscripción vacía',
      description: 'Debe ser rechazada',
      payload: {},
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'payload')).toBe(true);
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

  describe('findAllPaginated (Feature F1)', () => {
    beforeEach(async () => {
      await service.registerEvent(
        baseDto({
          action: 'CREATE',
          source: 'subscription-manager',
        }),
      );
      await service.registerEvent(
        baseDto({
          action: 'UPDATE',
          source: 'subscription-manager',
        }),
      );
      await service.registerEvent(
        baseDto({
          action: 'CREATE',
          source: 'academic-portal',
        }),
      );
      await service.registerEvent(
        baseDto({
          action: 'DELETE',
          source: 'academic-portal',
        }),
      );
    });

    it('pagina con page=1 y limit=2 (devuelve primeros 2)', async () => {
      const query: QueryEventsDto = { page: 1, limit: 2 };
      const result = await service.findAllPaginated(query);
      expect(result.total).toBe(4);
      expect(result.page).toBe(1);
      expect(result.lastPage).toBe(2);
      expect(result.data).toHaveLength(2);
    });

    it('pagina con page=2 y limit=2 (devuelve los 2 últimos)', async () => {
      const query: QueryEventsDto = { page: 2, limit: 2 };
      const result = await service.findAllPaginated(query);
      expect(result.total).toBe(4);
      expect(result.page).toBe(2);
      expect(result.data).toHaveLength(2);
    });

    it('filtra por action=CREATE', async () => {
      const query: QueryEventsDto = { page: 1, limit: 10, action: 'CREATE' };
      const result = await service.findAllPaginated(query);
      expect(result.total).toBe(2);
      expect(
        result.data.every((e) => (e as { action: string }).action === 'CREATE'),
      ).toBe(true);
    });

    it('filtra por source=academic-portal', async () => {
      const query: QueryEventsDto = {
        page: 1,
        limit: 10,
        source: 'academic-portal',
      };
      const result = await service.findAllPaginated(query);
      expect(result.total).toBe(2);
      expect(
        result.data.every(
          (e) => (e as { source: string }).source === 'academic-portal',
        ),
      ).toBe(true);
    });

    it('combina filtros action + source', async () => {
      const query: QueryEventsDto = {
        page: 1,
        limit: 10,
        action: 'CREATE',
        source: 'academic-portal',
      };
      const result = await service.findAllPaginated(query);
      expect(result.total).toBe(1);
    });
  });

  describe('findByText (Feature F2 #10)', () => {
    beforeEach(async () => {
      await service.registerEvent(
        baseDto({
          action: 'CREATE',
          source: 'subscription-manager',
          title: 'Nueva suscripcion a Spotify',
          description: 'Plan Premium',
        }),
      );
      await service.registerEvent(
        baseDto({
          action: 'CREATE',
          source: 'academic-portal',
          title: 'Conferencia de ingenieria',
          description: 'Evento para alumnos',
        }),
      );
      await service.registerEvent(
        baseDto({
          action: 'UPDATE',
          source: 'subscription-manager',
          title: 'Cambio en suscripcion mensual',
          description: 'Cambio del plan',
        }),
      );
    });

    it('encuentra coincidencias case-insensitive en title', async () => {
      const result = await service.findByText('SPOTIFY');
      expect(result).toHaveLength(1);
      expect((result[0] as { title: string }).title).toContain('Spotify');
    });

    it('encuentra coincidencias en description', async () => {
      const result = await service.findByText('alumnos');
      expect(result).toHaveLength(1);
    });

    it('rechaza query menor a 2 caracteres', async () => {
      await expect(service.findByText('a')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('devuelve array vacio si no hay matches', async () => {
      const result = await service.findByText('inexistente-xyz');
      expect(result).toEqual([]);
    });
  });
});
