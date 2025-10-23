import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsIn, IsBoolean } from 'class-validator';

export enum TipoTarjeta {
  CREDITO = 'CREDITO',
  DEBITO = 'DEBITO',
}

export class CrearTarjetaDto {
  @IsInt()
  usuario_id: number;

  @IsOptional()
  @IsInt()
  cuenta_id?: number;

  @IsString()
  nombre: string;

  @IsIn(['CREDITO', 'DEBITO'])
  tipo: TipoTarjeta;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  limite?: string;

  @IsOptional()
  @IsInt()
  dia_corte?: number;

  @IsOptional()
  @IsInt()
  dia_vencimiento?: number;

  @IsOptional()
  @IsBoolean()
  activa?: boolean = true;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ActualizarTarjetaDto {
  @IsOptional()
  @IsInt()
  cuenta_id?: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsIn(['CREDITO', 'DEBITO'])
  tipo?: TipoTarjeta;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  limite?: string;

  @IsOptional()
  @IsInt()
  dia_corte?: number;

  @IsOptional()
  @IsInt()
  dia_vencimiento?: number;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class PagarResumenDto {
  @IsDecimal({ decimal_digits: '2' })
  monto: string;

  @IsDateString()
  fecha_pago: string;

  @IsOptional()
  @IsString()
  concepto?: string;
}

export interface TarjetaResponse {
  id: number;
  usuario_id: number;
  cuenta_id: number | null;
  nombre: string;
  tipo: TipoTarjeta;
  limite: string | null;
  dia_corte: number | null;
  dia_vencimiento: number | null;
  activa: boolean;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  cuenta_nombre?: string;
  consumo_mes_actual?: number;
  porcentaje_utilizacion?: number;
  proximo_vencimiento?: string;
  dias_hasta_vencimiento?: number;
}

export interface EstadisticasTarjetaResponse {
  tarjeta_id: number;
  tarjeta_nombre: string;
  total_consumos: number;
  promedio_consumo: number;
  limite: number | null;
  utilizacion_actual: number;
  porcentaje_utilizacion: number;
  consumos_por_mes: {
    mes: string;
    total: number;
    cantidad: number;
  }[];
}