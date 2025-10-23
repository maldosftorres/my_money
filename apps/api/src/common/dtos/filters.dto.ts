import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}

export class MonthFilterDto {
  @IsOptional()
  @IsDateString()
  mes?: string; // Formato: YYYY-MM-01
}