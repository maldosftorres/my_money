import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum EstadoGasto {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO'
}

export class CrearGastoAdicionalDto {
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

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsEnum(EstadoGasto)
  estado?: EstadoGasto;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ActualizarGastoAdicionalDto {
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
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsEnum(EstadoGasto)
  estado?: EstadoGasto;

  @IsOptional()
  @IsString()
  notas?: string;
}

export interface GastoAdicionalResponse {
  id: number;
  usuario_id: number;
  cuenta_id: number | null;
  categoria_id: number | null;
  concepto: string;
  monto: string;
  fecha: string;
  estado: EstadoGasto;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  cuenta_nombre?: string;
  categoria_nombre?: string;
}

export interface DistribucionGastosResponse {
  categoria_id: number;
  categoria_nombre: string;
  total: number;
  porcentaje: number;
  color?: string;
}