import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum EstadoTransferencia {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA'
}

export class CrearTransferenciaDto {
  @IsInt()
  usuario_id: number;

  @IsInt()
  cuenta_origen_id: number;

  @IsInt()
  cuenta_destino_id: number;

  @IsDecimal({ decimal_digits: '2' })
  monto: string;

  @IsString()
  concepto: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsEnum(EstadoTransferencia)
  estado?: EstadoTransferencia;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ActualizarTransferenciaDto {
  @IsOptional()
  @IsInt()
  cuenta_origen_id?: number;

  @IsOptional()
  @IsInt()
  cuenta_destino_id?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  monto?: string;

  @IsOptional()
  @IsString()
  concepto?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsEnum(EstadoTransferencia)
  estado?: EstadoTransferencia;

  @IsOptional()
  @IsString()
  notas?: string;
}

export interface TransferenciaResponse {
  id: number;
  usuario_id: number;
  cuenta_origen_id: number;
  cuenta_destino_id: number;
  monto: string;
  concepto: string;
  estado: EstadoTransferencia;
  notas: string | null;
  fecha: string;
  creado_en: string;
  actualizado_en: string;
  cuenta_origen_nombre?: string;
  cuenta_destino_nombre?: string;
}

export interface ResumenTransferenciasResponse {
  total_transferencias: number;
  monto_total: number;
  transferencias_pendientes: number;
  transferencias_completadas: number;
}