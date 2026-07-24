import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Suscripcion } from './entities/suscripcion.entity';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class SuscripcionesService {
  private readonly logger = new Logger(SuscripcionesService.name);
  private dbPath: string;

  constructor(private readonly configService: ConfigService) {
    const configured = this.configService.get<string>('DB_PATH') || './db/suscripciones.json';
    this.dbPath = path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
  }

  private async readDb(): Promise<Suscripcion[]> {
    try {
      const content = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(content) as Suscripcion[];
} catch (err) {
  if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
    return [];
  }
  this.logger.error({ action: 'READ_DB_FAILED', error: err instanceof Error ? err.message : String(err) });
  throw err;
}
  }

  private async writeDb(data: Suscripcion[]) {
    try {
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      this.logger.error({ action: 'WRITE_DB_FAILED', error: (err as Error).message });
      throw err;
    }
  }

  async create(dto: CreateSuscripcionDto): Promise<Suscripcion> {
    if (dto.precio <= 0) throw new BadRequestException('Precio inválido');
    const all = await this.readDb();
    const id = randomUUID();
    const nueva: Suscripcion = { id, nombre: dto.nombre, precio: dto.precio, fechaInicio: dto.fechaInicio };
    all.push(nueva);
    await this.writeDb(all);
    this.logger.log({ action: 'CREATE_SUSCRIPCION', id });
    return nueva;
  }

  async findOne(id: string): Promise<Suscripcion> {
    const all = await this.readDb();
    const item = all.find((s) => s.id === id);
    if (!item) throw new NotFoundException('Suscripción no encontrada');
    return item;
  }

  async update(id: string, dto: UpdateSuscripcionDto): Promise<Suscripcion> {
    const all = await this.readDb();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) throw new NotFoundException('Suscripción no encontrada');
    const updated = { ...all[idx], ...dto };
    if (updated.precio !== undefined && updated.precio <= 0) throw new BadRequestException('Precio inválido');
    all[idx] = updated as Suscripcion;
    await this.writeDb(all);
    this.logger.log({ action: 'UPDATE_SUSCRIPCION', id });
    return all[idx];
  }

  async remove(id: string): Promise<void> {
    const all = await this.readDb();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) throw new NotFoundException('Suscripción no encontrada');
    all.splice(idx, 1);
    await this.writeDb(all);
    this.logger.log({ action: 'DELETE_SUSCRIPCION', id });
  }
}
