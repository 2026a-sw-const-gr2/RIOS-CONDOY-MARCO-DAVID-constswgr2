import { EventsService } from '../../src/modules/events/events.service';
import { CreateEventEntity } from '../../src/database/entities/create-event.entity';
import { DeleteEventEntity } from '../../src/database/entities/delete-event.entity';
import { QueryEventEntity } from '../../src/database/entities/query-event.entity';
import { UpdateEventEntity } from '../../src/database/entities/update-event.entity';
import { Repository } from 'typeorm';

function fakeRepo<T>(rows: T[] = []) {
  return {
    rows,
    create: (data: any) => ({ ...data }),
    save: async (row: any) => row,
    find: async () => rows,
    findBy: async (query: Record<string, any>) =>
      rows.filter((row) =>
        Object.entries(query).every(([k, v]) => row[k] === v),
      ),
    count: async () => rows.length,
  };
}

describe('B3 #14 — excluir CANCELLED de stats', () => {
  let service: EventsService;

  const makeSvc = (
    create: Array<Partial<CreateEventEntity>>,
    update: Array<Partial<UpdateEventEntity>>,
    del: Array<Partial<DeleteEventEntity>>,
    query: Array<Partial<QueryEventEntity>>,
  ) => {
    service = new EventsService(
      fakeRepo(create) as unknown as Repository<CreateEventEntity>,
      fakeRepo(update) as unknown as Repository<UpdateEventEntity>,
      fakeRepo(del) as unknown as Repository<DeleteEventEntity>,
      fakeRepo(query) as unknown as Repository<QueryEventEntity>,
    );
  };

  it('total incluye todos si ninguno está CANCELLED', async () => {
    makeSvc(
      [{ status: 'DRAFT', title: 'a' }],
      [{ status: 'PUBLISHED', title: 'b' }],
      [],
      [],
    );
    const stats: any = await service.getStats();
    expect(stats.total).toBe(2);
  });

  it('total excluye filas CANCELLED', async () => {
    makeSvc(
      [
        { status: 'DRAFT', title: 'a' },
        { status: 'CANCELLED', title: 'x' },
      ],
      [{ status: 'CANCELLED', title: 'y' }],
      [{ status: 'PUBLISHED', title: 'z' }],
      [],
    );
    const stats: any = await service.getStats();
    expect(stats.total).toBe(2);
    expect(stats.create).toBe(1);
  });

  it('total es 0 si todas las filas son CANCELLED', async () => {
    makeSvc(
      [{ status: 'CANCELLED', title: 'x' }],
      [{ status: 'CANCELLED' }],
      [],
      [],
    );
    expect(((await service.getStats()) as any).total).toBe(0);
  });

  it('FINISHED y PUBLISHED siguen contando', async () => {
    makeSvc(
      [{ status: 'FINISHED', title: 'a' }],
      [{ status: 'PUBLISHED', title: 'b' }],
      [],
      [],
    );
    expect(((await service.getStats()) as any).total).toBe(2);
  });
});
