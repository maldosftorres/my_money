import { IsString, IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CrearTarjetaDto {
  @IsInt()
  usuario_id: number;

  @IsOptional()
  @IsInt()
  cuenta_id?: number;

  @IsString()
  nombre: string;

  @IsInt()
  @Min(1)
  @Max(31)
  dia_corte: number;

  @IsInt()
  @Min(1)
  @Max(31)
  dia_vencimiento: number;

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
  @IsInt()
  @Min(1)
  @Max(31)
  dia_corte?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dia_vencimiento?: number;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export interface TarjetaResponse {
  id: number;
  usuario_id: number;
  cuenta_id: number | null;
  nombre: string;
  dia_corte: number;
  dia_vencimiento: number;
  activa: boolean;
  creado_en: string;
  actualizado_en: string;
  cuenta_nombre?: string;
  consumo_mes_actual?: number;
  proximo_vencimiento?: string;
  dias_hasta_vencimiento?: number;
}