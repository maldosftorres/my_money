import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CrearCategoriaGastoDto {
  @IsInt()
  usuario_id: number;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsBoolean()
  es_fijo?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ActualizarCategoriaGastoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  es_fijo?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export interface CategoriaGastoResponse {
  id: number;
  usuario_id: number;
  nombre: string;
  es_fijo: boolean;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}