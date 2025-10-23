import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsIn } from 'class-validator';

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
}