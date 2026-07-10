declare const describe: any;
declare const beforeEach: any;
declare const afterEach: any;
declare const it: any;
declare const expect: any;
import { SuscripcionesService } from '../suscripciones.service';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SuscripcionesService', () => {
  let service: SuscripcionesService;
  let tempFile: string;

  beforeEach(() => {
    tempFile = path.resolve(__dirname, `../../../tmp/suscripciones-test-${Date.now()}.json`);
    const configService = { get: (key: string) => (key === 'DB_PATH' ? tempFile : undefined) } as unknown as ConfigService;
    service = new SuscripcionesService(configService);
  });

  afterEach(async () => {
    try {
      await fs.unlink(tempFile);
    } catch {
      // ignore
    }
  });

  it('crea una suscripción válida', async () => {
    const dto: CreateSuscripcionDto = { nombre: 'Plan Basic', precio: 9.99 };
    const created = await service.create(dto);
    expect(created).toHaveProperty('id');
    expect(created.nombre).toBe(dto.nombre);
    expect(created.precio).toBe(dto.precio);
    const content = await fs.readFile(tempFile, 'utf-8');
    const arr = JSON.parse(content);
    expect(arr).toHaveLength(1);
  });

  it('rechaza precio negativo', async () => {
    const dto: CreateSuscripcionDto = { nombre: 'Plan Bad', precio: -5 };
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('retorna 404 al leer id inexistente', async () => {
    await expect(service.findOne('no-existe')).rejects.toThrow(NotFoundException);
  });

  it('actualiza una suscripción existente', async () => {
    const dto: CreateSuscripcionDto = { nombre: 'Plan A', precio: 5 };
    const created = await service.create(dto);
    const update: UpdateSuscripcionDto = { precio: 7.5 };
    const updated = await service.update(created.id, update);
    expect(updated.precio).toBe(7.5);
  });

  it('rechaza actualización con precio inválido', async () => {
    const dto: CreateSuscripcionDto = { nombre: 'Plan B', precio: 10 };
    const created = await service.create(dto);
    const update: UpdateSuscripcionDto = { precio: 0 } as any;
    await expect(service.update(created.id, update)).rejects.toThrow(BadRequestException);
  });

  it('elimina una suscripción existente', async () => {
    const dto: CreateSuscripcionDto = { nombre: 'Plan C', precio: 3 };
    const created = await service.create(dto);
    await service.remove(created.id);
    await expect(service.findOne(created.id)).rejects.toThrow(NotFoundException);
  });
});
