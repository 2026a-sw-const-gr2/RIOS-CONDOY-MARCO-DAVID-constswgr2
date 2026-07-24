import { Body, Controller, Get, Param, Post, Query, StreamableFile, UploadedFile } from '@nestjs/common';
import { ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

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
    if (format === 'csv') {
      const header = ['id','title','description','source','entity','action','status'];
      const rows = events.map((e: any) => [e.id ?? '', e.title ?? '', e.description ?? '', e.source ?? '', e.entity ?? '', e.action ?? '', e.status ?? '']);
      const csv = stringify({ header: true, columns: header, records: rows });
      return new StreamableFile(Buffer.from(csv), { type: 'text/csv; charset=utf-8' }, `events_${ts}.csv`);
    }
    return new StreamableFile(Buffer.from(JSON.stringify(events, null, 2)), { type: 'application/json' }, `events_${ts}.json`);
  }

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, merge: { type: 'boolean', default: false } } } })
  async importEvents(@UploadedFile() file: Express.Multer.File, @Body('merge') merge = false) {
    if (!file) throw new Error('Archivo requerido');
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!['json','csv'].includes(ext || '')) throw new Error('Formato no soportado. Usa .json o .csv');
  const uploadDir = path.join(process.cwd(), '..', 'temp_uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const tempPath = path.join(uploadDir, `import_${Date.now()}.${ext}`);
  const ws = fs.createWriteStream(tempPath);
    ws.write(file.buffer);
    await new Promise<void>((r) => { ws.end(); ws.on('finish', r); });
    const { createReadStream } = await import('fs');
    const stream = createReadStream(tempPath);
    let records: any[];
    if (ext === 'json') { records = JSON.parse(stream.read().toString('utf-8')); }
    else { records = parse(stream, { columns: true, skip_empty_lines: true }); }
    const count = await this.eventsService.importEvents(records.map((r: any) => ({ source: r.source || r.Source || 'import', entity: r.entity || r.Entity || 'Imported', action: r.action || r.Action || 'CREATE', title: r.title || r.Title || '', description: r.description || r.Description || '', payload: r.payload ? JSON.parse(r.payload) : {} })), merge);
    return { imported: count };
  }
}