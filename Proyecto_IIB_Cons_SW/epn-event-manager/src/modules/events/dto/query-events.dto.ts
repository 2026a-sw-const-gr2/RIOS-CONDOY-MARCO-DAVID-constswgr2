import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { EventAction } from '../events.service';

export class QueryEventsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsEnum(['CREATE', 'UPDATE', 'DELETE', 'QUERY'])
  action?: EventAction;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;
}
