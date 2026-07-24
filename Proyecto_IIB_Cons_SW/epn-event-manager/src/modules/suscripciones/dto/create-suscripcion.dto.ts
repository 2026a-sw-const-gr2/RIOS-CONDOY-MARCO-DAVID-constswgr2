import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsISO8601 } from 'class-validator';

export class CreateSuscripcionDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @Min(0.01)
  precio: number;

  @IsOptional()
  @IsISO8601()
  fechaInicio?: string;
}
