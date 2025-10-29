import { IsString, IsDecimal, IsInt, IsOptional, IsDateString, IsIn, IsBoolean } from 'class-validator';

export enum EstadoGastoFijo {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
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

  @IsOptional()
  @IsInt()
  dia_mes?: number; // Día del mes para recurrencia

  @IsOptional()
  @IsInt()
  frecuencia_meses?: number; // Cada cuántos meses se repite

  @IsOptional()
  @IsBoolean()
  es_recurrente?: boolean = false; // Si es un gasto fijo recurrente

  @IsOptional()
  @IsInt()
  duracion_meses?: number; // Cuántos meses durará este gasto fijo

  @IsOptional()
  @IsInt()
  gasto_padre_id?: number; // ID del gasto fijo padre (para gastos generados)

  @IsOptional()
  @IsDateString()
  fecha_pago?: string; // Fecha real de pago (cuando se marca como pagado)

  @IsOptional()
  @IsIn(['PENDIENTE', 'PAGADO'])
  estado?: EstadoGastoFijo = EstadoGastoFijo.PENDIENTE;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;

  @IsOptional()
  @IsString()
  notas?: string;

  // Campos específicos para préstamos
  @IsOptional()
  @IsBoolean()
  es_prestamo?: boolean = false; // Indica si es un préstamo

  @IsOptional()
  @IsInt()
  total_cuotas?: number; // Número total de cuotas del préstamo

  @IsOptional()
  @IsInt()
  cuota_actual?: number; // Número de cuota actual (1, 2, 3, etc.)

  @IsOptional()
  @IsString()
  descripcion_prestamo?: string; // Descripción adicional del préstamo

  // Campos específicos para ahorros
  @IsOptional()
  @IsBoolean()
  es_ahorro?: boolean = false; // Indica si es un ahorro

  @IsOptional()
  @IsInt()
  meses_objetivo?: number; // Número total de meses objetivo para el ahorro

  @IsOptional()
  @IsInt()
  mes_actual?: number; // Mes actual del ahorro (1, 2, 3, etc.)

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  monto_ya_ahorrado?: string; // Monto acumulado ya ahorrado

  // Validación personalizada para evitar conflictos entre tipos
  constructor(data?: Partial<CrearGastoFijoDto>) {
    if (data) {
      Object.assign(this, data);
      
      // Validar que no sea recurrente y préstamo al mismo tiempo
      if (this.es_recurrente && this.es_prestamo) {
        throw new Error('Un gasto no puede ser recurrente y préstamo al mismo tiempo');
      }
      
      // Validar que no sea recurrente y ahorro al mismo tiempo
      if (this.es_recurrente && this.es_ahorro) {
        throw new Error('Un gasto no puede ser recurrente y ahorro al mismo tiempo');
      }
      
      // Validar que no sea préstamo y ahorro al mismo tiempo
      if (this.es_prestamo && this.es_ahorro) {
        throw new Error('Un gasto no puede ser préstamo y ahorro al mismo tiempo');
      }
    }
  }
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
  dia_mes?: number;

  @IsOptional()
  @IsInt()
  frecuencia_meses?: number;

  @IsOptional()
  @IsBoolean()
  es_recurrente?: boolean;

  @IsOptional()
  @IsInt()
  duracion_meses?: number;

  @IsOptional()
  @IsInt()
  gasto_padre_id?: number;

  @IsOptional()
  @IsDateString()
  fecha_pago?: string;

  @IsOptional()
  @IsIn(['PENDIENTE', 'PAGADO'])
  estado?: EstadoGastoFijo;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  notas?: string;

  // Campos específicos para préstamos
  @IsOptional()
  @IsBoolean()
  es_prestamo?: boolean;

  @IsOptional()
  @IsInt()
  total_cuotas?: number;

  @IsOptional()
  @IsInt()
  cuota_actual?: number;

  @IsOptional()
  @IsString()
  descripcion_prestamo?: string;

  // Campos específicos para ahorros
  @IsOptional()
  @IsBoolean()
  es_ahorro?: boolean;

  @IsOptional()
  @IsInt()
  meses_objetivo?: number;

  @IsOptional()
  @IsInt()
  mes_actual?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  monto_ya_ahorrado?: string;
}

export interface GastoFijoResponse {
  id: number;
  usuario_id: number;
  cuenta_id: number | null;
  categoria_id: number | null;
  concepto: string;
  monto: string;
  fecha: string; // Fecha actual del gasto
  dia_mes?: number; // Día del mes calculado
  frecuencia_meses?: number; // Frecuencia en meses
  es_recurrente?: boolean; // Si es recurrente
  duracion_meses?: number; // Duración en meses
  gasto_padre_id?: number; // ID del gasto padre
  fecha_pago?: string; // Fecha real de pago
  estado: EstadoGastoFijo;
  activo?: boolean; // Temporal hasta migración
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  cuenta_nombre?: string;
  categoria_nombre?: string;
  proximo_pago?: string;
  dias_hasta_vencimiento?: number;
  // Campos específicos para préstamos
  es_prestamo?: boolean;
  total_cuotas?: number;
  cuota_actual?: number;
  descripcion_prestamo?: string;
  // Campos específicos para ahorros
  es_ahorro?: boolean;
  meses_objetivo?: number;
  mes_actual?: number;
  monto_ya_ahorrado?: string;
}