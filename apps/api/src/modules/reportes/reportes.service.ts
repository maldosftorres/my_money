import { Injectable } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { 
    ResumenMesResponse,
    DistribucionGastosResponse,
    ResumenCuentasResponse,
    AlertasResponse,
    ComparativoMesesResponse
} from './reportes.dto';

@Injectable()
export class ReportesService {
    constructor(private readonly db: DatabaseService) {}

    async obtenerResumenMes(usuarioId: number, mes: string): Promise<ResumenMesResponse> {
        // Usar la vista v_resumen_mes si existe, sino calcular manualmente
        const resumen = await this.db.query<QueryResult>(
            `SELECT 
                ? as mes,
                COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as total_ingresos,
                COALESCE(SUM(CASE WHEN tipo = 'gasto_fijo' THEN monto ELSE 0 END), 0) as total_gastos_fijos,
                COALESCE(SUM(CASE WHEN tipo = 'gasto_adicional' THEN monto ELSE 0 END), 0) as total_gastos_adicionales
            FROM (
                SELECT 'ingreso' as tipo, monto FROM ingresos 
                WHERE usuario_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = ? AND estado = 'PAGADO'
                UNION ALL
                SELECT 'gasto_fijo' as tipo, monto FROM gastos_fijos 
                WHERE usuario_id = ? AND estado = 'PAGADO'
                UNION ALL
                SELECT 'gasto_adicional' as tipo, monto FROM gastos_adicionales 
                WHERE usuario_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = ?
            ) totales`,
            [mes, usuarioId, mes, usuarioId, usuarioId, mes]
        );

        const datos = resumen[0] || { 
            mes, 
            total_ingresos: 0, 
            total_gastos_fijos: 0, 
            total_gastos_adicionales: 0 
        };

        const totalGastos = parseFloat(datos.total_gastos_fijos || '0') + parseFloat(datos.total_gastos_adicionales || '0');
        const totalIngresos = parseFloat(datos.total_ingresos || '0');
        const saldoNeto = totalIngresos - totalGastos;
        const porcentajeAhorro = totalIngresos > 0 ? (saldoNeto / totalIngresos) * 100 : 0;

        // Generar alertas
        const alertas = await this.generarAlertas(usuarioId, mes, totalIngresos, totalGastos, porcentajeAhorro);

        return {
            mes,
            total_ingresos: totalIngresos,
            total_gastos_fijos: parseFloat(datos.total_gastos_fijos || '0'),
            total_gastos_adicionales: parseFloat(datos.total_gastos_adicionales || '0'),
            total_gastos: totalGastos,
            saldo_neto: saldoNeto,
            porcentaje_ahorro: Math.round(porcentajeAhorro * 100) / 100,
            alertas
        };
    }

    async obtenerDistribucionGastos(usuarioId: number, mes: string): Promise<DistribucionGastosResponse[]> {
        const query = `
            SELECT 
                COALESCE(cat.id, 0) as categoria_id,
                COALESCE(cat.nombre, 'Sin categoría') as categoria_nombre,
                COALESCE(SUM(CASE WHEN tipo = 'fijo' THEN monto ELSE 0 END), 0) as total_gastos_fijos,
                COALESCE(SUM(CASE WHEN tipo = 'adicional' THEN monto ELSE 0 END), 0) as total_gastos_adicionales,
                COALESCE(SUM(monto), 0) as total_general
            FROM (
                SELECT gf.categoria_id, gf.monto, 'fijo' as tipo
                FROM gastos_fijos gf 
                WHERE gf.usuario_id = ? AND gf.estado = 'PAGADO'
                UNION ALL
                SELECT ga.categoria_id, ga.monto, 'adicional' as tipo
                FROM gastos_adicionales ga 
                WHERE ga.usuario_id = ? AND DATE_FORMAT(ga.fecha, '%Y-%m') = ?
            ) gastos
            LEFT JOIN categorias_gasto cat ON gastos.categoria_id = cat.id
            GROUP BY cat.id, cat.nombre
            HAVING total_general > 0
            ORDER BY total_general DESC
        `;

        const distribucion = await this.db.query<QueryResult>(query, [usuarioId, usuarioId, mes]);
        
        // Calcular porcentajes
        const totalGeneral = distribucion.reduce((sum, item) => sum + parseFloat(item.total_general || '0'), 0);
        
        return distribucion.map(item => ({
            categoria_id: item.categoria_id,
            categoria_nombre: item.categoria_nombre,
            total_gastos_fijos: parseFloat(item.total_gastos_fijos || '0'),
            total_gastos_adicionales: parseFloat(item.total_gastos_adicionales || '0'),
            total_general: parseFloat(item.total_general || '0'),
            porcentaje: totalGeneral > 0 ? Math.round((parseFloat(item.total_general || '0') / totalGeneral) * 10000) / 100 : 0
        })) as DistribucionGastosResponse[];
    }

    async obtenerResumenCuentas(usuarioId: number, mes: string): Promise<ResumenCuentasResponse[]> {
        const cuentas = await this.db.query<QueryResult>(
            'SELECT id, nombre, tipo, saldo_inicial FROM cuentas WHERE usuario_id = ? AND activa = true',
            [usuarioId]
        );

        const resumenCuentas = await Promise.all(
            cuentas.map(async (cuenta) => {
                // Calcular movimientos del mes
                const movimientos = await this.db.query<QueryResult>(
                    `SELECT 
                        COALESCE(SUM(CASE WHEN cuenta_destino_id = ? THEN monto ELSE 0 END), 0) as total_ingresos,
                        COALESCE(SUM(CASE WHEN cuenta_origen_id = ? THEN monto ELSE 0 END), 0) as total_egresos
                    FROM movimientos 
                    WHERE (cuenta_origen_id = ? OR cuenta_destino_id = ?) 
                    AND DATE_FORMAT(fecha, '%Y-%m') = ?`,
                    [cuenta.id, cuenta.id, cuenta.id, cuenta.id, mes]
                );

                const totalIngresos = parseFloat(movimientos[0]?.total_ingresos || '0');
                const totalEgresos = parseFloat(movimientos[0]?.total_egresos || '0');
                const saldoInicial = parseFloat(cuenta.saldo_inicial || '0');
                const saldoFinal = saldoInicial + totalIngresos - totalEgresos;
                const variacion = saldoFinal - saldoInicial;
                const porcentajeVariacion = saldoInicial !== 0 ? (variacion / saldoInicial) * 100 : 0;

                return {
                    cuenta_id: cuenta.id,
                    cuenta_nombre: cuenta.nombre,
                    tipo: cuenta.tipo,
                    saldo_inicial: saldoInicial,
                    total_ingresos: totalIngresos,
                    total_egresos: totalEgresos,
                    saldo_final: saldoFinal,
                    variacion: variacion,
                    porcentaje_variacion: Math.round(porcentajeVariacion * 100) / 100
                };
            })
        );

        return resumenCuentas as ResumenCuentasResponse[];
    }

    async obtenerAlertas(usuarioId: number): Promise<AlertasResponse> {
        // Vencimientos próximos (próximos 7 días)
        const vencimientosGastosFijos = await this.db.query<QueryResult>(
            `SELECT 
                'gasto_fijo' as tipo, id, concepto, monto,
                DATEDIFF(
                    DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                    CURDATE()
                ) as dias_restantes
            FROM gastos_fijos 
            WHERE usuario_id = ? AND activa = true AND estado = 'PENDIENTE'
            AND DATEDIFF(
                DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                CURDATE()
            ) BETWEEN 0 AND 7`,
            [usuarioId]
        );

        const vencimientosTarjetas = await this.db.query<QueryResult>(
            `SELECT 
                'tarjeta' as tipo, id, nombre as concepto, 
                COALESCE(consumos.total, 0) as monto,
                DATEDIFF(
                    DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                    CURDATE()
                ) as dias_restantes
            FROM tarjetas t
            LEFT JOIN (
                SELECT tarjeta_id, SUM(monto) as total 
                FROM consumos_tarjeta 
                WHERE DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
                GROUP BY tarjeta_id
            ) consumos ON t.id = consumos.tarjeta_id
            WHERE t.usuario_id = ? AND t.activa = true AND t.tipo = 'CREDITO' 
            AND t.dia_vencimiento IS NOT NULL
            AND DATEDIFF(
                DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                CURDATE()
            ) BETWEEN 0 AND 7`,
            [usuarioId]
        );

        // Límites excedidos
        const limitesExcedidos = await this.db.query<QueryResult>(
            `SELECT 
                'tarjeta' as tipo, t.id, t.nombre, t.limite,
                COALESCE(SUM(ct.monto), 0) as utilizado,
                CASE 
                    WHEN t.limite > 0 THEN ROUND((COALESCE(SUM(ct.monto), 0) / t.limite) * 100, 2)
                    ELSE 0 
                END as porcentaje
            FROM tarjetas t
            LEFT JOIN consumos_tarjeta ct ON t.id = ct.tarjeta_id 
                AND DATE_FORMAT(ct.fecha, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
            WHERE t.usuario_id = ? AND t.activa = true AND t.limite IS NOT NULL
            GROUP BY t.id, t.nombre, t.limite
            HAVING porcentaje >= 80`,
            [usuarioId]
        );

        return {
            vencimientos_proximos: [...vencimientosGastosFijos, ...vencimientosTarjetas].map(item => ({
                tipo: item.tipo as 'gasto_fijo' | 'tarjeta',
                id: item.id,
                concepto: item.concepto,
                monto: parseFloat(item.monto || '0'),
                dias_restantes: item.dias_restantes
            })),
            limites_excedidos: limitesExcedidos.map(item => ({
                tipo: item.tipo as 'tarjeta' | 'presupuesto',
                id: item.id,
                nombre: item.nombre,
                limite: parseFloat(item.limite || '0'),
                utilizado: parseFloat(item.utilizado || '0'),
                porcentaje: parseFloat(item.porcentaje || '0')
            })),
            gastos_inusuales: [] // Implementar lógica de detección de gastos inusuales
        };
    }

    async obtenerComparativoMeses(usuarioId: number, mesActual: string): Promise<ComparativoMesesResponse> {
        const fechaActual = new Date(mesActual + '-01');
        const fechaAnterior = new Date(fechaActual);
        fechaAnterior.setMonth(fechaAnterior.getMonth() - 1);
        const mesAnterior = fechaAnterior.toISOString().slice(0, 7);

        const resumenActual = await this.obtenerResumenMes(usuarioId, mesActual);
        const resumenAnterior = await this.obtenerResumenMes(usuarioId, mesAnterior);

        const variacionIngresos = resumenAnterior.total_ingresos > 0 
            ? ((resumenActual.total_ingresos - resumenAnterior.total_ingresos) / resumenAnterior.total_ingresos) * 100 
            : 0;

        const variacionGastos = resumenAnterior.total_gastos > 0 
            ? ((resumenActual.total_gastos - resumenAnterior.total_gastos) / resumenAnterior.total_gastos) * 100 
            : 0;

        const variacionAhorro = resumenAnterior.saldo_neto !== 0 
            ? ((resumenActual.saldo_neto - resumenAnterior.saldo_neto) / Math.abs(resumenAnterior.saldo_neto)) * 100 
            : 0;

        return {
            mes_actual: mesActual,
            mes_anterior: mesAnterior,
            ingresos_actual: resumenActual.total_ingresos,
            ingresos_anterior: resumenAnterior.total_ingresos,
            variacion_ingresos: Math.round(variacionIngresos * 100) / 100,
            gastos_actual: resumenActual.total_gastos,
            gastos_anterior: resumenAnterior.total_gastos,
            variacion_gastos: Math.round(variacionGastos * 100) / 100,
            ahorro_actual: resumenActual.saldo_neto,
            ahorro_anterior: resumenAnterior.saldo_neto,
            variacion_ahorro: Math.round(variacionAhorro * 100) / 100
        };
    }

    async calcularSaldoAcumulado(usuarioId: number, mes: string): Promise<number> {
        // Buscar el saldo acumulado más reciente antes del mes dado
        const saldoAnterior = await this.db.query<QueryResult>(
            `SELECT saldo_acumulado 
             FROM movimientos 
             WHERE usuario_id = ? AND tipo = 'SALDO_ACUMULADO' 
             AND DATE_FORMAT(fecha, '%Y-%m') < ? 
             ORDER BY fecha DESC 
             LIMIT 1`,
            [usuarioId, mes]
        );

        let saldoBase = 0;
        if (saldoAnterior.length > 0) {
            saldoBase = parseFloat(saldoAnterior[0].saldo_acumulado || '0');
        }

        // Obtener el resumen del mes actual
        const resumenMes = await this.obtenerResumenMes(usuarioId, mes);
        const saldoMesActual = resumenMes.saldo_neto;

        // Calcular el saldo acumulado
        const saldoAcumulado = saldoBase + saldoMesActual;

        return saldoAcumulado;
    }

    async actualizarSaldoAcumulado(usuarioId: number, mes: string): Promise<void> {
        const saldoAcumulado = await this.calcularSaldoAcumulado(usuarioId, mes);
        const fechaMes = new Date(mes + '-01');

        // Verificar si ya existe un registro de saldo acumulado para este mes
        const existente = await this.db.query<QueryResult>(
            `SELECT id FROM movimientos 
             WHERE usuario_id = ? AND tipo = 'SALDO_ACUMULADO' 
             AND DATE_FORMAT(fecha, '%Y-%m') = ?`,
            [usuarioId, mes]
        );

        if (existente.length > 0) {
            // Actualizar el registro existente
            await this.db.query(
                `UPDATE movimientos 
                 SET saldo_acumulado = ? 
                 WHERE id = ?`,
                [saldoAcumulado, existente[0].id]
            );
        } else {
            // Crear un nuevo registro
            await this.db.query(
                `INSERT INTO movimientos (usuario_id, tipo, concepto, monto, fecha, saldo_acumulado, cuenta_origen_id) 
                 VALUES (?, 'SALDO_ACUMULADO', ?, 0, ?, ?, 
                    (SELECT id FROM cuentas WHERE usuario_id = ? AND activa = true LIMIT 1))`,
                [
                    usuarioId, 
                    `Saldo acumulado ${mes}`, 
                    fechaMes, 
                    saldoAcumulado,
                    usuarioId
                ]
            );
        }
    }

    async obtenerSaldosAcumulados(usuarioId: number, mesesAtras: number = 12): Promise<Array<{mes: string, saldo_acumulado: number}>> {
        const resultados = await this.db.query<QueryResult>(
            `SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as mes,
                saldo_acumulado
             FROM movimientos 
             WHERE usuario_id = ? AND tipo = 'SALDO_ACUMULADO'
             AND fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
             ORDER BY fecha ASC`,
            [usuarioId, mesesAtras]
        );

        return resultados.map(r => ({
            mes: r.mes,
            saldo_acumulado: parseFloat(r.saldo_acumulado || '0')
        }));
    }

    private async generarAlertas(usuarioId: number, mes: string, ingresos: number, gastos: number, porcentajeAhorro: number) {
        const alertas = [];

        // Alerta si los gastos superan los ingresos
        if (gastos > ingresos) {
            alertas.push({
                tipo: 'error' as const,
                mensaje: `Los gastos ($${gastos.toFixed(2)}) superan los ingresos ($${ingresos.toFixed(2)})`
            });
        }

        // Alerta si el porcentaje de ahorro es bajo
        if (porcentajeAhorro < 10 && porcentajeAhorro >= 0) {
            alertas.push({
                tipo: 'warning' as const,
                mensaje: `Porcentaje de ahorro muy bajo: ${porcentajeAhorro.toFixed(1)}%. Se recomienda ahorrar al menos 10%`
            });
        }

        // Alerta si el porcentaje de ahorro es bueno
        if (porcentajeAhorro >= 20) {
            alertas.push({
                tipo: 'info' as const,
                mensaje: `¡Excelente! Estás ahorrando ${porcentajeAhorro.toFixed(1)}% de tus ingresos`
            });
        }

        return alertas;
    }
}