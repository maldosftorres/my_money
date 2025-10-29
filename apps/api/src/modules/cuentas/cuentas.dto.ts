import { IsString, IsEnum, IsDecimal, IsInt, IsOptional, IsBoolean } from 'class-validator';

export enum TipoCuenta {
  EFECTIVO = 'EFECTIVO',
  BANCO = 'BANCO',
  TARJETA = 'TARJETA',
  AHORRO = 'AHORRO',
  COOPERATIVA = 'COOPERATIVA',
  OTRA = 'OTRA',
}

export class CrearCuentaDto {
  @IsInt()
  usuario_id: number;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsEnum(TipoCuenta)
  tipo?: TipoCuenta = TipoCuenta.BANCO;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  saldo_inicial?: string = '0.00';

  @IsOptional()
  @IsString()
  moneda?: string = 'Gs';
}

export class ActualizarCuentaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEnum(TipoCuenta)
  tipo?: TipoCuenta;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  saldo_inicial?: string;

  @IsOptional()
  @IsString()
  moneda?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export interface CuentaResponse {
  id: number;
  usuario_id: number;
  nombre: string;
  tipo: TipoCuenta;
  saldo_inicial: string;
  moneda: string;
  activa: boolean;
  creado_en: string;
  actualizado_en: string;
}