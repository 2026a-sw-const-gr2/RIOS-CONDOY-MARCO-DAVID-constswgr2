import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  registerEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.registerEvent(dto);
  }

  @Get('search')
  findByText(@Query('q') q: string) {
    return this.eventsService.findByText(q);
  }

  @Get()
  findAll(@Query() query: QueryEventsDto) {
    return this.eventsService.findAllPaginated(query);
  }

  @Get('source/:source')
  findBySource(@Param('source') source: string) {
    return this.eventsService.findBySource(source);
  }

  @Get('entity/:entity')
  findByEntity(@Param('entity') entity: string) {
    return this.eventsService.findByEntity(entity);
  }
}