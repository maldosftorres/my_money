import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CrearConsumoTarjetaDto {
  @IsInt()
  tarjeta_id: number;

  @IsOptional()
  @IsInt()
  categoria_id?: number;

  @IsString()
  concepto: string;

  @IsDecimal({ decimal_digits: '2' })
  monto: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsInt()
  cuotas?: number = 1;

  @IsOptional()
  @IsBoolean()
  es_recurrente?: boolean = false;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ActualizarConsumoTarjetaDto {
  @IsOptional()
  @IsInt()
  categoria_id?: number;

  @IsOptional()
  @IsString()
  concepto?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  monto?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsInt()
  cuotas?: number;

  @IsOptional()
  @IsBoolean()
  es_recurrente?: boolean;

  @IsOptional()
  @IsString()
  notas?: string;
}

export interface ConsumoTarjetaResponse {
  id: number;
  tarjeta_id: number;
  categoria_id: number | null;
  concepto: string;
  monto: string;
  fecha: string;
  cuotas: number;
  es_recurrente: boolean;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  tarjeta_nombre?: string;
  categoria_nombre?: string;
  monto_cuota?: number;
  cuotas_restantes?: number;
}

export interface ResumenConsumosTarjetaResponse {
  tarjeta_id: number;
  tarjeta_nombre: string;
  total_mes: number;
  cantidad_consumos: number;
  promedio_consumo: number;
  limite: number | null;
  porcentaje_utilizacion: number;
  consumos: ConsumoTarjetaResponse[];
}