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

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(CreateEventEntity) private readonly createRepo: Repository<CreateEventEntity>,
    @InjectRepository(UpdateEventEntity) private readonly updateRepo: Repository<UpdateEventEntity>,
    @InjectRepository(DeleteEventEntity) private readonly deleteRepo: Repository<DeleteEventEntity>,
    @InjectRepository(QueryEventEntity)  private readonly queryRepo:  Repository<QueryEventEntity>,
  ) {}

  async findAllRaw(): Promise<CreateEventEntity[]> {
    return this.createRepo.find();
  }

  async importEvents(records: ImportRecord[], _merge: boolean): Promise<number> {
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
      case 'CREATE': await this.handleCreate(dto); return { ok: true };
      case 'UPDATE': await this.handleUpdate(dto); return { ok: true };
      case 'DELETE': await this.handleDelete(dto); return { ok: true };
      case 'QUERY':  await this.handleQuery(dto);  return { ok: true };
      default: this.logger.warn(`Accion no reconocida: "${dto.action}"`); return { ok: false };
    }
  }

  private async handleCreate(dto: CreateEventDto): Promise<void> {
    const ev = this.createRepo.create({
      source: dto.source, entity: dto.entity, action: dto.action,
      title: dto.title, description: dto.description,
      payload: this.serializePayload(dto.payload), recorded_at: this.nowIso(),
    });
    await this.createRepo.save(ev);
    this.logger.log(`Evento CREATE registrado (source=${dto.source})`);
  }

  private async handleUpdate(dto: CreateEventDto): Promise<void> {
    const ev = this.updateRepo.create({
      source: dto.source, entity: dto.entity, action: dto.action,
      title: dto.title, description: dto.description,
      payload: this.serializePayload(dto.payload), timestamp: this.nowIso(),
    });
    await this.updateRepo.save(ev);
    this.logger.log(`Evento UPDATE registrado (source=${dto.source})`);
  }

  private async handleDelete(dto: CreateEventDto): Promise<void> {
    const ev = this.deleteRepo.create({
      source: dto.source, entity: dto.entity, action: dto.action,
      title: dto.title,
      payload: this.serializePayload(dto.payload), createdAt: this.nowIso(),
    });
    await this.deleteRepo.save(ev);
    this.logger.log(`Evento DELETE registrado (source=${dto.source})`);
  }

  private async handleQuery(dto: CreateEventDto): Promise<void> {
    const ev = this.queryRepo.create({
      source: dto.source, entity: dto.entity, action: dto.action,
      title: dto.title, description: dto.description,
      payload: this.serializePayload(dto.payload), event_date: this.nowIso(),
    });
    await this.queryRepo.save(ev);
    this.logger.debug(`Evento QUERY registrado (source=${dto.source})`);
  }

  async findAll(): Promise<object[]> {
    const [creates, updates, deletes, queries] = await Promise.all([
      this.createRepo.find(), this.updateRepo.find(), this.deleteRepo.find(), this.queryRepo.find(),
    ]);
    const merged = [
      ...creates.map((e) => ({ ...e, _table: 'create_events' as const })),
      ...updates.map((e) => ({ ...e, _table: 'update_events' as const })),
      ...deletes.map((e) => ({ ...e, _table: 'delete_events' as const })),
      ...queries.map((e) => ({ ...e, _table: 'query_events' as const })),
    ];
    merged.sort((a, b) => this.eventTimestamp(a) - this.eventTimestamp(b));
    return merged;
  }

  async findAllPaginated(query: QueryEventsDto): Promise<{ data: object[]; total: number; page: number; lastPage: number }> {
    const page = query.page;
    const limit = query.limit;
    const safeSource = query.source?.trim() || undefined;
    const action = query.action?.toUpperCase() as EventAction | undefined;
    const all = await this.findAll();
    const filtered = all.filter((e) => {
      const rec = e as Record<string, unknown>;
      if (action && rec.action !== action) return false;
      if (safeSource && rec.source !== safeSource) return false;
      return true;
    });
    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, lastPage);
    const skip = (safePage - 1) * limit;
    return { data: filtered.slice(skip, skip + limit), total, page: safePage, lastPage };
  }

  async findByText(query: string): Promise<object[]> {
    const safeQuery = this.sanitizeFilter(query, 'q');
    if (safeQuery.length < 2) throw new BadRequestException('El parametro "q" debe tener al menos 2 caracteres');
    if (safeQuery.length > 80) throw new BadRequestException('El parametro "q" es demasiado largo (max 80 caracteres)');
    const needle = safeQuery.toLowerCase();
    const all = await this.findAll();
    return all.filter((event) => {
      const rec = event as Record<string, unknown>;
      const title = typeof rec.title === 'string' ? rec.title.toLowerCase() : '';
      const description = typeof rec.description === 'string' ? rec.description.toLowerCase() : '';
      return title.includes(needle) || description.includes(needle);
    });
  }

  async findBySource(source: string): Promise<object[]> {
    const safeSource = this.sanitizeFilter(source, 'source');
    const [creates, updates, deletes, queries] = await Promise.all([
      this.createRepo.findBy({ source: safeSource }),
      this.updateRepo.findBy({ source: safeSource }),
      this.deleteRepo.findBy({ source: safeSource }),
      this.queryRepo.findBy({ source: safeSource }),
    ]);
    return [...creates, ...updates, ...deletes, ...queries];
  }

  async findByEntity(entity: string): Promise<object[]> {
    const safeEntity = this.sanitizeFilter(entity, 'entity');
    const [creates, updates, deletes, queries] = await Promise.all([
      this.createRepo.findBy({ entity: safeEntity }),
      this.updateRepo.findBy({ entity: safeEntity }),
      this.deleteRepo.findBy({ entity: safeEntity }),
      this.queryRepo.findBy({ entity: safeEntity }),
    ]);
    return [...creates, ...updates, ...deletes, ...queries];
  }

  async getStats(): Promise<object> {
    const [createCount, updateCount, deleteCount, queryCount] = await Promise.all([
      this.createRepo.count(), this.updateRepo.count(), this.deleteRepo.count(), this.queryRepo.count(),
    ]);
    return {
      create: createCount,
      update: updateCount,
      delete: deleteCount,
      query: queryCount,
      total: createCount + updateCount + deleteCount + queryCount,
    };
  }

  private sanitizeFilter(value: string, fieldName: string): string {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      this.logger.warn(`Filtro "${fieldName}" vacio recibido`);
      throw new BadRequestException(`El parametro "${fieldName}" no puede estar vacio`);
    }
    if (trimmed.length > MAX_FILTER_LENGTH) {
      this.logger.warn(`Filtro "${fieldName}" excede longitud maxima`);
      throw new BadRequestException(`El parametro "${fieldName}" es demasiado largo`);
    }
    return trimmed;
  }

  private serializePayload(payload: unknown): string {
    return JSON.stringify(payload ?? {});
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  private eventTimestamp(record: Record<string, unknown>): number {
    const raw =
      (record.recorded_at as string) ??
      (record.timestamp as string) ??
      (record.createdAt as string) ??
      (record.event_date as string) ??
      '';
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
