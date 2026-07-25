import { Injectable } from '@nestjs/common';
import { EventsService } from '../events.service';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class QueryEventHandler {
  constructor(private readonly eventsService: EventsService) {}
  async handle(dto: CreateEventDto): Promise<void> {
    return this.eventsService['handleQuery'](dto);
  }
}
