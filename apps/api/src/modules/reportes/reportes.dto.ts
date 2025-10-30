export interface ResumenMesResponse {
  mes: string;
  total_ingresos: number;
  total_gastos_fijos: number;
  total_gastos_adicionales: number;
  total_gastos_tarjetas: number;
  total_pagos_tarjetas: number;
  total_gastos: number;
  saldo_neto: number;
  porcentaje_ahorro: number;
  alertas: {
    tipo: 'info' | 'warning' | 'error';
    mensaje: string;
  }[];
}

export interface DistribucionGastosResponse {
  categoria_id: number;
  categoria_nombre: string;
  total_gastos_fijos: number;
  total_gastos_adicionales: number;
  total_general: number;
  porcentaje: number;
  tendencia?: 'subiendo' | 'bajando' | 'estable';
}

export interface ResumenCuentasResponse {
  cuenta_id: number;
  cuenta_nombre: string;
  tipo: string;
  saldo_inicial: number;
  total_ingresos: number;
  total_egresos: number;
  saldo_final: number;
  variacion: number;
  porcentaje_variacion: number;
}

export interface AlertasResponse {
  vencimientos_proximos: {
    tipo: 'gasto_fijo' | 'tarjeta';
    id: number;
    concepto: string;
    monto: number;
    dias_restantes: number;
  }[];
  limites_excedidos: {
    tipo: 'tarjeta' | 'presupuesto';
    id: number;
    nombre: string;
    limite: number;
    utilizado: number;
    porcentaje: number;
  }[];
  gastos_inusuales: {
    categoria: string;
    monto_actual: number;
    promedio_anterior: number;
    diferencia_porcentual: number;
  }[];
}

export interface ComparativoMesesResponse {
  mes_actual: string;
  mes_anterior: string;
  ingresos_actual: number;
  ingresos_anterior: number;
  variacion_ingresos: number;
  gastos_actual: number;
  gastos_anterior: number;
  variacion_gastos: number;
  ahorro_actual: number;
  ahorro_anterior: number;
  variacion_ahorro: number;
}

export interface SaldoAcumuladoResponse {
  mes: string;
  saldo_acumulado: number;
}

export interface ResumenConSaldoAcumuladoResponse extends ResumenMesResponse {
  saldo_acumulado: number;
}