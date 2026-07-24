import { Controller, Post, Body, Get, Param, Put, Delete, Logger } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcion.dto';
import { Suscripcion } from './entities/suscripcion.entity';

@Controller('suscripciones')
export class SuscripcionesController {
  private readonly logger = new Logger(SuscripcionesController.name);
  constructor(private readonly service: SuscripcionesService) {}

  @Post()
  async create(@Body() dto: CreateSuscripcionDto): Promise<Suscripcion> {
    try {
      const created = await this.service.create(dto);
      return created;
    } catch (err) {
      this.logger.error({ action: 'CREATE_SUSCRIPCION', error: (err as Error).message });
      throw err;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Suscripcion> {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      this.logger.error({ action: 'READ_SUSCRIPCION', id, error: (err as Error).message });
      throw err;
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSuscripcionDto): Promise<Suscripcion> {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      this.logger.error({ action: 'UPDATE_SUSCRIPCION', id, error: (err as Error).message });
      throw err;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    try {
      await this.service.remove(id);
      return { deleted: true };
    } catch (err) {
      this.logger.error({ action: 'DELETE_SUSCRIPCION', id, error: (err as Error).message });
      throw err;
    }
  }
}
