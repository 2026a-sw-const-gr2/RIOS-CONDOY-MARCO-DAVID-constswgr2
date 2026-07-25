/// <reference types="multer" />
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import type { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

type EventRow = {
  id: string;
  title: string;
  description: string;
  source: string;
  entity: string;
  action: string;
  status: string;
};

type ImportedRecord = {
  source?: string;
  Source?: string;
  entity?: string;
  Entity?: string;
  action?: string;
  Action?: string;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  payload?: unknown;
};

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  registerEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.registerEvent(dto);
  }

  @Get()
  findAll(@Query() query: QueryEventsDto) {
    return this.eventsService.findAllPaginated(query);
  }

  @Get('search')
  findByText(@Query('q') q: string) {
    return this.eventsService.findByText(q);
  }

  @Get('source/:source')
  findBySource(@Param('source') source: string) {
    return this.eventsService.findBySource(source);
  }

  @Get('entity/:entity')
  findByEntity(@Param('entity') entity: string) {
    return this.eventsService.findByEntity(entity);
  }

  @Get('export/:format')
  @ApiOperation({ summary: 'Exportar eventos en JSON o CSV' })
  @ApiParam({ name: 'format', enum: ['json', 'csv'] })
  async exportEvents(
    @Param('format') format: 'json' | 'csv',
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const events = await this.eventsService.findAllRaw();
    const ts = new Date().toISOString().slice(0, 10);
    const statusValue = (status: unknown): string =>
      typeof status === 'string' || typeof status === 'number'
        ? String(status)
        : '';
    const rows: EventRow[] = events.map((e) => {
      const rawStatus = (e as unknown as { status?: unknown }).status;
      return {
        id: String(e.id ?? ''),
        title: String(e.title ?? ''),
        description: String(e.description ?? ''),
        source: String(e.source ?? ''),
        entity: String(e.entity ?? ''),
        action: String(e.action ?? ''),
        status: statusValue(rawStatus ?? ''),
      };
    });

    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === 'csv') {
      const header = [
        'id',
        'title',
        'description',
        'source',
        'entity',
        'action',
        'status',
      ] as const;
      content = stringify(rows, {
        header: true,
        columns: header as unknown as string[],
      });
      mimeType = 'text/csv; charset=utf-8';
      filename = `events_${ts}.csv`;
    } else {
      content = JSON.stringify(rows, null, 2);
      mimeType = 'application/json';
      filename = `events_${ts}.json`;
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return new StreamableFile(Buffer.from(content), { type: mimeType });
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        merge: { type: 'boolean', default: false },
      },
    },
  })
  @ApiOperation({ summary: 'Importar eventos desde archivo JSON o CSV' })
  async importEvents(
    @UploadedFile() file: Express.Multer.File,
    @Body('merge') _merge = false,
  ): Promise<{ imported: number }> {
    if (!file) {
      throw new Error('Archivo requerido');
    }

    const originalname: string = String(file.originalname ?? '');
    const rawBuffer: Buffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from((file.buffer as ArrayBuffer) ?? new ArrayBuffer(0));

    const ext: string = (originalname.toLowerCase().split('.').pop() ?? '').trim();
    if (ext !== 'json' && ext !== 'csv') {
      throw new Error('Formato no soportado. Usa .json o .csv');
    }

    const uploadDir = path.join(process.cwd(), '..', 'temp_uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const tempPath = path.join(uploadDir, `import_${Date.now()}.${ext}`);
    await new Promise<void>((resolve, reject) => {
      const ws = fs.createWriteStream(tempPath);
      ws.on('error', (err: Error) => reject(err));
      ws.write(rawBuffer);
      ws.end();
      ws.on('finish', () => resolve());
      ws.on('error', (err: Error) => reject(err));
    });

    const content: string = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = fs.createReadStream(tempPath);
      stream.on('error', (err: Error) => reject(err));
      stream.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });

    let records: ImportedRecord[];
    try {
      if (ext === 'json') {
        const parsed: unknown = JSON.parse(content);
        records = Array.isArray(parsed) ? (parsed as ImportedRecord[]) : [];
      } else {
        const parsed: unknown = parse(content, {
          columns: true,
          skip_empty_lines: true,
        });
        records = Array.isArray(parsed) ? (parsed as ImportedRecord[]) : [];
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Archivo ${ext} invalido: ${msg}`);
    }

    const mapped = records.map((r) => ({
      source: r.source ?? r.Source ?? 'import',
      entity: r.entity ?? r.Entity ?? 'Imported',
      action: r.action ?? r.Action ?? 'CREATE',
      title: r.title ?? r.Title ?? '',
      description: r.description ?? r.Description ?? '',
      payload: r.payload ?? {},
    }));

    const count = await this.eventsService.importEvents(mapped);
    return { imported: count };
  }
}
