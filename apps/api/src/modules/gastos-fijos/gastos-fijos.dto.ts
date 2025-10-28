import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsIn, IsBoolean } from 'class-validator';

export enum EstadoGastoFijo {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
}

export class CrearGastoFijoDto {
  @IsInt()
  usuario_id: number;

  @IsOptional()
  @IsInt()
  cuenta_id?: number;

  @IsOptional()
  @IsInt()
  categoria_id?: number;

  @IsString()
  concepto: string;

  @IsDecimal({ decimal_digits: '2' })
  monto: string;

  @IsOptional()
  @IsInt()
  dia_mes?: number; // Día del mes para recurrencia

  @IsOptional()
  @IsInt()
  frecuencia_meses?: number; // Cada cuántos meses se repite

  @IsOptional()
  @IsBoolean()
  es_recurrente?: boolean = false; // Si es un gasto fijo recurrente

  @IsOptional()
  @IsInt()
  duracion_meses?: number; // Cuántos meses durará este gasto fijo

  @IsOptional()
  @IsInt()
  gasto_padre_id?: number; // ID del gasto fijo padre (para gastos generados)

  @IsOptional()
  @IsDateString()
  fecha_pago?: string; // Fecha real de pago (cuando se marca como pagado)

  @IsOptional()
  @IsIn(['PENDIENTE', 'PAGADO'])
  estado?: EstadoGastoFijo = EstadoGastoFijo.PENDIENTE;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ActualizarGastoFijoDto {
  @IsOptional()
  @IsInt()
  cuenta_id?: number;

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
  @IsInt()
  dia_mes?: number;

  @IsOptional()
  @IsInt()
  frecuencia_meses?: number;

  @IsOptional()
  @IsBoolean()
  es_recurrente?: boolean;

  @IsOptional()
  @IsInt()
  duracion_meses?: number;

  @IsOptional()
  @IsInt()
  gasto_padre_id?: number;

  @IsOptional()
  @IsDateString()
  fecha_pago?: string;

  @IsOptional()
  @IsIn(['PENDIENTE', 'PAGADO'])
  estado?: EstadoGastoFijo;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  notas?: string;
}

export interface GastoFijoResponse {
  id: number;
  usuario_id: number;
  cuenta_id: number | null;
  categoria_id: number | null;
  concepto: string;
  monto: string;
  fecha: string; // Fecha actual del gasto
  dia_mes?: number; // Día del mes calculado
  frecuencia_meses?: number; // Frecuencia en meses
  es_recurrente?: boolean; // Si es recurrente
  duracion_meses?: number; // Duración en meses
  gasto_padre_id?: number; // ID del gasto padre
  fecha_pago?: string; // Fecha real de pago
  estado: EstadoGastoFijo;
  activo?: boolean; // Temporal hasta migración
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  cuenta_nombre?: string;
  categoria_nombre?: string;
  proximo_pago?: string;
  dias_hasta_vencimiento?: number;
}