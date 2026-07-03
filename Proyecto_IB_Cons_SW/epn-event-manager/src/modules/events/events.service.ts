import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventEntity } from '../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../database/entities/query-event.entity';

type EventAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'QUERY';

const MAX_FILTER_LENGTH = 120;

/**
 * EventsService
 *
 * Refactorizado para el ticket EEM-1 (God Method), EEM-3 (orden incorrecto
 * en findAll) y EEM-4 (falta de validación en filtros). Antes, registerEvent
 * concentraba la construcción y persistencia de los 4 tipos de evento en un
 * único método con una cascada de if/else. Ahora cada acción tiene su propio
 * método privado (SRP) y registerEvent solo enruta.
 */
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
        this.logger.warn(`Acción de evento no reconocida: "${dto.action}"`);
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
    this.logger.log(
      `Evento CREATE registrado (source=${dto.source}, entity=${dto.entity})`,
    );
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
    this.logger.log(
      `Evento UPDATE registrado (source=${dto.source}, entity=${dto.entity})`,
    );
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
    this.logger.log(
      `Evento DELETE registrado (source=${dto.source}, entity=${dto.entity})`,
    );
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
    this.logger.debug(
      `Evento QUERY registrado (source=${dto.source}, entity=${dto.entity})`,
    );
  }

  async findAll(): Promise<object[]> {
    const [creates, updates, deletes, queries] = await Promise.all([
      this.createRepo.find(),
      this.updateRepo.find(),
      this.deleteRepo.find(),
      this.queryRepo.find(),
    ]);

    const merged = [
      ...creates.map((e) => ({ ...e, _table: 'create_events' })),
      ...updates.map((e) => ({ ...e, _table: 'update_events' })),
      ...deletes.map((e) => ({ ...e, _table: 'delete_events' })),
      ...queries.map((e) => ({ ...e, _table: 'query_events' })),
    ];

    // Fix EEM-3: las 4 tablas usan nombres de columna de fecha distintos
    // (recorded_at / timestamp / createdAt / event_date) y antes se
    // comparaban como strings crudos con localeCompare, lo que ordena mal
    // si los formatos difieren. Ahora se normalizan a Date antes de comparar.
    merged.sort((a, b) => this.eventTimestamp(a) - this.eventTimestamp(b));

    return merged;
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
    // Fix EEM-4: antes "entity" se pasaba directo a findBy sin validar.
    // TypeORM ya parametriza la consulta (no hay inyección SQL), pero no
    // había ninguna validación de longitud/formato ni registro de intentos
    // sospechosos. Se agrega sanitizeFilter para ambos casos.
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
    const [createCount, updateCount, deleteCount, queryCount] =
      await Promise.all([
        this.createRepo.count(),
        this.updateRepo.count(),
        this.deleteRepo.count(),
        this.queryRepo.count(),
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
      this.logger.warn(`Filtro "${fieldName}" vacío o inválido recibido`);
      throw new BadRequestException(
        `El parámetro "${fieldName}" no puede estar vacío`,
      );
    }
    if (trimmed.length > MAX_FILTER_LENGTH) {
      this.logger.warn(
        `Filtro "${fieldName}" excede la longitud máxima permitida`,
      );
      throw new BadRequestException(
        `El parámetro "${fieldName}" es demasiado largo`,
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
