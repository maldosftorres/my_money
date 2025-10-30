import { IsString, IsInt, IsOptional, IsBoolean, Min, Max, IsEnum, Length } from 'class-validator';

export enum TipoTarjeta {
  CREDITO = 'CREDITO',
  DEBITO = 'DEBITO', 
  VIRTUAL = 'VIRTUAL',
  PREPAGA = 'PREPAGA'
}

export class CrearTarjetaDto {
  @IsInt()
  usuario_id: number;

  @IsInt()
  cuenta_id: number;

  @IsString()
  nombre: string;

  @IsEnum(TipoTarjeta)
  tipo: TipoTarjeta;

  @IsOptional()
  @IsInt()
  @Min(0)
  limite?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dia_vencimiento?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  moneda?: string = 'PYG';

  @IsOptional()
  @IsString()
  @Length(4, 20)
  numero_tarjeta?: string;

  @IsOptional()
  @IsString()
  banco_emisor?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean = true;
}

export class ActualizarTarjetaDto {
  @IsOptional()
  @IsInt()
  cuenta_id?: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEnum(TipoTarjeta)
  tipo?: TipoTarjeta;

  @IsOptional()
  @IsInt()
  @Min(0)
  limite?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dia_vencimiento?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  moneda?: string;

  @IsOptional()
  @IsString()
  @Length(4, 20)
  numero_tarjeta?: string;

  @IsOptional()
  @IsString()
  banco_emisor?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class GastoTarjetaDto {
  @IsInt()
  usuario_id: number;

  @IsInt()
  tarjeta_id: number;

  @IsString()
  concepto: string;

  @IsInt()
  @Min(1)
  monto: number;

  @IsString()
  fecha: string; // YYYY-MM-DD

  @IsOptional()
  @IsInt()
  categoria_id?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class PagoTarjetaDto {
  @IsInt()
  usuario_id: number;

  @IsInt()
  tarjeta_id: number;

  @IsInt()
  cuenta_origen_id: number;

  @IsInt()
  @Min(1)
  monto: number;

  @IsString()
  fecha: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  concepto?: string;
}

export interface TarjetaResponse {
  id: number;
  usuario_id: number;
  cuenta_id: number;
  nombre: string;
  tipo: TipoTarjeta;
  limite: number | null;
  saldo_utilizado: number;
  saldo_disponible: number | null;
  porcentaje_utilizado: number;
  moneda: string;
  numero_tarjeta: string | null;
  banco_emisor: string | null;
  dia_vencimiento: number | null;
  activa: boolean;
  creado_en: string;
  actualizado_en: string;
  // Datos de la cuenta asociada
  cuenta_asociada_nombre?: string;
  cuenta_asociada_tipo?: string;
  // Cálculos adicionales
  proximo_vencimiento?: string;
  estado_tarjeta?: 'ACTIVA' | 'INACTIVA' | 'LIMITE_ALTO' | 'LIMITE_MEDIO';
}

export interface EstadisticasTarjetaResponse {
  tarjeta_id: number;
  tarjeta_nombre: string;
  gastos_mes_actual: number;
  cantidad_transacciones: number;
  promedio_gasto: number;
  ultimo_gasto: string;
  historico_6_meses: Array<{
    mes: string;
    total_gastos: number;
    cantidad: number;
  }>;
}