import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsIn, IsBoolean } from 'class-validator';

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
}

export class CrearIngresoDto {
  @IsInt()
  usuario_id: number;

  @IsOptional()
  @IsInt()
  cuenta_id?: number;

  @IsString()
  concepto: string;

  @IsDecimal({ decimal_digits: '2' })
  monto: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsIn(['PENDIENTE', 'PAGADO'])
  estado?: EstadoPago = EstadoPago.PENDIENTE;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsInt()
  dia_mes?: number; // Día del mes para ingresos recurrentes

  @IsOptional()
  @IsInt()
  frecuencia_meses?: number; // 1 = mensual, 3 = trimestral, etc.

  @IsOptional()
  @IsBoolean()
  es_recurrente?: boolean; // Si es un ingreso que se repite

  @IsOptional()
  @IsInt()
  ingreso_padre_id?: number; // ID del ingreso original para los generados automáticamente
}

export class ActualizarIngresoDto {
  @IsOptional()
  @IsInt()
  cuenta_id?: number;

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
  @IsIn(['PENDIENTE', 'PAGADO'])
  estado?: EstadoPago;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsInt()
  dia_mes?: number;

  @IsOptional()
  @IsInt()
  frecuencia_meses?: number;

  @IsOptional()
  @IsBoolean()
  es_recurrente?: boolean;

  @IsOptional()
  @IsDateString()
  fecha_cobro?: string; // Fecha real cuando se cobró (para marcar como pagado)
}

export interface IngresoResponse {
  id: number;
  usuario_id: number;
  cuenta_id: number | null;
  concepto: string;
  monto: string;
  fecha: string;
  estado: EstadoPago;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  cuenta_nombre?: string;
  dia_mes?: number;
  frecuencia_meses?: number;
  es_recurrente?: boolean;
  ingreso_padre_id?: number;
  fecha_cobro?: string;
}