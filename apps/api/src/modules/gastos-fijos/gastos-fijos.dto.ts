import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsIn, IsBoolean } from 'class-validator';

export enum EstadoGastoFijo {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  VENCIDO = 'VENCIDO',
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

  @IsInt()
  dia_vencimiento: number;

  @IsOptional()
  @IsIn(['PENDIENTE', 'PAGADO', 'VENCIDO'])
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
  dia_vencimiento?: number;

  @IsOptional()
  @IsIn(['PENDIENTE', 'PAGADO', 'VENCIDO'])
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
  dia_vencimiento: number;
  estado: EstadoGastoFijo;
  activo: boolean;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  cuenta_nombre?: string;
  categoria_nombre?: string;
  fecha_vencimiento_actual?: string;
  dias_hasta_vencimiento?: number;
}