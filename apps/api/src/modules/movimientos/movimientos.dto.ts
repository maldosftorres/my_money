import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsIn } from 'class-validator';

export enum TipoMovimiento {
  TRANSFERENCIA = 'TRANSFERENCIA',
  DEPOSITO = 'DEPOSITO',
  RETIRO = 'RETIRO',
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
}

export class CrearMovimientoDto {
  @IsInt()
  usuario_id: number;

  @IsOptional()
  @IsInt()
  cuenta_origen_id?: number;

  @IsOptional()
  @IsInt()
  cuenta_destino_id?: number;

  @IsIn(['TRANSFERENCIA', 'DEPOSITO', 'RETIRO', 'DEBITO', 'CREDITO'])
  tipo: TipoMovimiento;

  @IsDecimal({ decimal_digits: '2' })
  monto: string;

  @IsString()
  concepto: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class TransferirDto {
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
  @IsString()
  notas?: string;
}

export class ActualizarMovimientoDto {
  @IsOptional()
  @IsInt()
  cuenta_origen_id?: number;

  @IsOptional()
  @IsInt()
  cuenta_destino_id?: number;

  @IsOptional()
  @IsIn(['TRANSFERENCIA', 'DEPOSITO', 'RETIRO', 'DEBITO', 'CREDITO'])
  tipo?: TipoMovimiento;

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
  @IsString()
  notas?: string;
}

export interface MovimientoResponse {
  id: number;
  usuario_id: number;
  cuenta_origen_id: number | null;
  cuenta_destino_id: number | null;
  tipo: TipoMovimiento;
  monto: string;
  concepto: string;
  fecha: string;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  cuenta_origen_nombre?: string;
  cuenta_destino_nombre?: string;
}

export interface HistorialCuentaResponse {
  cuenta_id: number;
  cuenta_nombre: string;
  saldo_inicial: number;
  movimientos: MovimientoResponse[];
  saldo_final: number;
}