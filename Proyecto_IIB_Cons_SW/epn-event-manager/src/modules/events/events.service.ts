import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { CreateEventEntity } from '../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../database/entities/query-event.entity';

export type EventAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'QUERY';
const MAX_FILTER_LENGTH = 120;

type ImportRecord = {
  source: string;
  entity: string;
  action: string;
  title: string;
  description: string;
  payload: unknown;
};

type EventTable =
  | 'create_events'
  | 'update_events'
  | 'delete_events'
  | 'query_events';

type MergedEvent = {
  id: number;
  source?: string;
  entity?: string;
  action?: string;
  title?: string;
  description?: string;
  payload?: string;
  recorded_at?: string;
  timestamp?: string;
  createdAt?: string;
  event_date?: string;
  query_term?: string;
  _table: EventTable;
};

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(CreateEventEntity)
    private readonly createRepo: Repository<CreateEventEntity>,
    @InjectRepository(UpdateEventEntity)
    private readonly updateRepo: Repository<UpdateEventEntity>,
    @InjectRepository(DeleteEventEntity)
    private readonly deleteRepo: Repository<DeleteEventEntity>,
    @InjectRepository(QueryEventEntity)
    private readonly queryRepo: Repository<QueryEventEntity>,
  ) {}

  async findAllRaw(): Promise<CreateEventEntity[]> {
    return this.createRepo.find();
  }

  async importEvents(records: ImportRecord[]): Promise<number> {
    let imported = 0;
    for (const rec of records) {
      const exists = await this.createRepo.findBy({
        title: rec.title,
        source: rec.source,
        entity: rec.entity,
      });
      if (exists.length > 0) continue;
      const entity = this.createRepo.create({
        source: rec.source,
        entity: rec.entity,
        action: rec.action,
        title: rec.title,
        description: rec.description,
        payload: this.serializePayload(rec.payload),
        recorded_at: this.nowIso(),
      });
      await this.createRepo.save(entity);
      imported++;
    }
    return imported;
  }

  async registerEvent(dto: CreateEventDto): Promise<{ ok: boolean }> {
    const action = (dto.action ?? '').toUpperCase() as EventAction;
    switch (action) {
      case 'CREATE':
        await this.handleCreate(dto);
        return { ok: true };
      case 'UPDATE':
        await this.handleUpdate(dto);
        return { ok: true };
      case 'DELETE':
        await this.handleDelete(dto);
        return { ok: true };
      case 'QUERY':
        await this.handleQuery(dto);
        return { ok: true };
      default:
        this.logger.warn(`Accion no reconocida: "${dto.action}"`);
        return { ok: false };
    }
  }

  private async handleCreate(dto: CreateEventDto): Promise<void> {
    const ev = this.createRepo.create({
      source: dto.source,
      entity: dto.entity,
      action: dto.action,
      title: dto.title,
      description: dto.description,
      payload: this.serializePayload(dto.payload),
      recorded_at: this.nowIso(),
    });
    await this.createRepo.save(ev);
    this.logger.log(`Evento CREATE registrado (source=${dto.source})`);
  }

  private async handleUpdate(dto: CreateEventDto): Promise<void> {
    const ev = this.updateRepo.create({
      source: dto.source,
      entity: dto.entity,
      action: dto.action,
      title: dto.title,
      description: dto.description,
      payload: this.serializePayload(dto.payload),
      timestamp: this.nowIso(),
    });
    await this.updateRepo.save(ev);
    this.logger.log(`Evento UPDATE registrado (source=${dto.source})`);
  }

  private async handleDelete(dto: CreateEventDto): Promise<void> {
    const ev = this.deleteRepo.create({
      source: dto.source,
      entity: dto.entity,
      action: dto.action,
      title: dto.title,
      payload: this.serializePayload(dto.payload),
      createdAt: this.nowIso(),
    });
    await this.deleteRepo.save(ev);
    this.logger.log(`Evento DELETE registrado (source=${dto.source})`);
  }

  private async handleQuery(dto: CreateEventDto): Promise<void> {
    const ev = this.queryRepo.create({
      source: dto.source,
      entity: dto.entity,
      action: dto.action,
      title: dto.title,
      description: dto.description,
      payload: this.serializePayload(dto.payload),
      event_date: this.nowIso(),
    });
    await this.queryRepo.save(ev);
    this.logger.debug(`Evento QUERY registrado (source=${dto.source})`);
  }

  async findAll(): Promise<MergedEvent[]> {
    const [creates, updates, deletes, queries] = await Promise.all([
      this.createRepo.find(),
      this.updateRepo.find(),
      this.deleteRepo.find(),
      this.queryRepo.find(),
    ]);
    const merged: MergedEvent[] = [
      ...creates.map((e) => ({ ...e, _table: 'create_events' as const })),
      ...updates.map((e) => ({ ...e, _table: 'update_events' as const })),
      ...deletes.map((e) => ({ ...e, _table: 'delete_events' as const })),
      ...queries.map((e) => ({ ...e, _table: 'query_events' as const })),
    ];
    merged.sort((a, b) => this.eventTimestamp(a) - this.eventTimestamp(b));
    return merged;
  }

  async findAllPaginated(query: QueryEventsDto): Promise<{
    data: MergedEvent[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const page = query.page;
    const limit = query.limit;
    const safeSource = query.source?.trim() || undefined;
    const action = query.action?.toUpperCase() as EventAction | undefined;
    const all = await this.findAll();
    const filtered = all.filter((e) => {
      if (action && e.action !== action) return false;
      if (safeSource && e.source !== safeSource) return false;
      return true;
    });
    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, lastPage);
    const skip = (safePage - 1) * limit;
    return {
      data: filtered.slice(skip, skip + limit),
      total,
      page: safePage,
      lastPage,
    };
  }

  async findByText(query: string): Promise<MergedEvent[]> {
    const safeQuery = this.sanitizeFilter(query, 'q');
    if (safeQuery.length < 2)
      throw new BadRequestException(
        'El parametro "q" debe tener al menos 2 caracteres',
      );
    if (safeQuery.length > 80)
      throw new BadRequestException(
        'El parametro "q" es demasiado largo (max 80 caracteres)',
      );
    const needle = safeQuery.toLowerCase();
    const all = await this.findAll();
    return all.filter((event) => {
      const title =
        typeof event.title === 'string' ? event.title.toLowerCase() : '';
      const description =
        typeof event.description === 'string'
          ? event.description.toLowerCase()
          : '';
      return title.includes(needle) || description.includes(needle);
    });
  }

  async findBySource(source: string): Promise<MergedEvent[]> {
    const safeSource = this.sanitizeFilter(source, 'source');
    const [creates, updates, deletes, queries] = await Promise.all([
      this.createRepo.findBy({ source: safeSource }),
      this.updateRepo.findBy({ source: safeSource }),
      this.deleteRepo.findBy({ source: safeSource }),
      this.queryRepo.findBy({ source: safeSource }),
    ]);
    return [
      ...creates.map((e) => ({ ...e, _table: 'create_events' as const })),
      ...updates.map((e) => ({ ...e, _table: 'update_events' as const })),
      ...deletes.map((e) => ({ ...e, _table: 'delete_events' as const })),
      ...queries.map((e) => ({ ...e, _table: 'query_events' as const })),
    ];
  }

  async findByEntity(entity: string): Promise<MergedEvent[]> {
    const safeEntity = this.sanitizeFilter(entity, 'entity');
    const [creates, updates, deletes, queries] = await Promise.all([
      this.createRepo.findBy({ entity: safeEntity }),
      this.updateRepo.findBy({ entity: safeEntity }),
      this.deleteRepo.findBy({ entity: safeEntity }),
      this.queryRepo.findBy({ entity: safeEntity }),
    ]);
    return [
      ...creates.map((e) => ({ ...e, _table: 'create_events' as const })),
      ...updates.map((e) => ({ ...e, _table: 'update_events' as const })),
      ...deletes.map((e) => ({ ...e, _table: 'delete_events' as const })),
      ...queries.map((e) => ({ ...e, _table: 'query_events' as const })),
    ];
  }

  async getStats(): Promise<{
    create: number;
    update: number;
    delete: number;
    query: number;
    total: number;
  }> {
    const [createData, updateData, deleteData, queryData] = await Promise.all([
      this.createRepo.find(),
      this.updateRepo.find(),
      this.deleteRepo.find(),
      this.queryRepo.find(),
    ]);

    const filterActive = (rows: Array<Record<string, unknown>>) =>
      rows.filter((row) => {
        const status = row.status;
        return typeof status === 'string'
          ? status.toUpperCase() !== 'CANCELLED'
          : true;
      });

    const createRows = filterActive(
      createData as Array<Record<string, unknown>>,
    );
    const updateRows = filterActive(
      updateData as Array<Record<string, unknown>>,
    );
    const deleteRows = filterActive(
      deleteData as Array<Record<string, unknown>>,
    );
    const queryRows = filterActive(queryData as Array<Record<string, unknown>>);

    return {
      create: createRows.length,
      update: updateRows.length,
      delete: deleteRows.length,
      query: queryRows.length,
      total:
        createRows.length +
        updateRows.length +
        deleteRows.length +
        queryRows.length,
    };
  }

  private sanitizeFilter(value: string, fieldName: string): string {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      this.logger.warn(`Filtro "${fieldName}" vacio recibido`);
      throw new BadRequestException(
        `El parametro "${fieldName}" no puede estar vacio`,
      );
    }
    if (trimmed.length > MAX_FILTER_LENGTH) {
      this.logger.warn(`Filtro "${fieldName}" excede longitud maxima`);
      throw new BadRequestException(
        `El parametro "${fieldName}" es demasiado largo`,
      );
    }
    return trimmed;
  }

  private serializePayload(payload: unknown): string {
    return JSON.stringify(payload ?? {});
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private eventTimestamp(record: MergedEvent): number {
    const raw =
      record.recorded_at ??
      record.timestamp ??
      record.createdAt ??
      record.event_date ??
      '';
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
