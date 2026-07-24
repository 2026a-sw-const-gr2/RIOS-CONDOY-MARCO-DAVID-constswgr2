import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
} from '@nestjs/common';
import { ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import fs from 'fs';
import path from 'path';
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
  source: string;
  entity: string;
  action: string;
  title: string;
  description: string;
  payload: unknown;
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
  async exportEvents(@Param('format') format: 'json' | 'csv'): Promise<StreamableFile> {
    const events = await this.eventsService.findAllRaw();
    const ts = new Date().toISOString().slice(0, 10);
    const rows: EventRow[] = events.map((e) => ({
      id: String(e.id ?? ''),
      title: String(e.title ?? ''),
      description: String(e.description ?? ''),
      source: String(e.source ?? ''),
      entity: String(e.entity ?? ''),
      action: String(e.action ?? ''),
      status: String((e as Record<string, unknown>).status ?? ''),
    }));

    if (format === 'csv') {
      const header = ['id', 'title', 'description', 'source', 'entity', 'action', 'status'] as const;
      const csv = stringify({ header: true, columns: header, records: rows as unknown as Record<string, unknown>[] });
      return new StreamableFile(Buffer.from(csv), { type: 'text/csv; charset=utf-8' }, `events_${ts}.csv`);
    }

    return new StreamableFile(
      Buffer.from(JSON.stringify(rows, null, 2)),
      { type: 'application/json' },
      `events_${ts}.json`,
    );
  }

  @Post('import')
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
  async importEvents(@UploadedFile() file: Express.Multer.File, @Body('merge') merge = false): Promise<{ imported: number }> {
    if (!file) {
      throw new Error('Archivo requerido');
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!['json', 'csv'].includes(ext ?? '')) {
      throw new Error('Formato no soportado. Usa .json o .csv');
    }

    const uploadDir = path.join(process.cwd(), '..', 'temp_uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const tempPath = path.join(uploadDir, `import_${Date.now()}.${ext}`);
    const ws = fs.createWriteStream(tempPath);
    ws.write(file.buffer);
    await new Promise<void>((resolve) => {
      ws.end();
      ws.on('finish', resolve);
    });

    const { createReadStream } = await import('fs');
    const stream = createReadStream(tempPath);
    let records: ImportedRecord[];
    if (ext === 'json') {
      records = JSON.parse(stream.read().toString('utf-8')) as ImportedRecord[];
    } else {
      records = parse(stream, { columns: true, skip_empty_lines: true }) as unknown as ImportedRecord[];
    }

    const count = await this.eventsService.importEvents(
      records.map((r) => ({
        source: r.source || r.Source || 'import',
        entity: r.entity || r.Entity || 'Imported',
        action: r.action || r.Action || 'CREATE',
        title: r.title || r.Title || '',
        description: r.description || r.Description || '',
        payload: r.payload ?? {},
      })),
      merge,
    );

    return { imported: count };
  }
}
