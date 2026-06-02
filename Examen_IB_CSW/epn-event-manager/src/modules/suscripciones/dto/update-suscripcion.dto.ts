import { IsString, IsOptional, IsNumber, Min, IsISO8601 } from 'class-validator';

export class UpdateSuscripcionDto {
	@IsOptional()
	@IsString()
	nombre?: string;

	@IsOptional()
	@IsNumber()
	@Min(0.01)
	precio?: number;

	@IsOptional()
	@IsISO8601()
	fechaInicio?: string;
}
