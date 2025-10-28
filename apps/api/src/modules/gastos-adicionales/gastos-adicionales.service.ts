import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { 
    CrearGastoAdicionalDto, 
    ActualizarGastoAdicionalDto, 
    GastoAdicionalResponse, 
    DistribucionGastosResponse,
    EstadoGasto
} from './gastos-adicionales.dto';

@Injectable()
export class GastosAdicionalesService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearGastoAdicionalDto: CrearGastoAdicionalDto): Promise<GastoAdicionalResponse> {
        const { usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, estado = EstadoGasto.PENDIENTE, notas } = crearGastoAdicionalDto;
        
        // Verificar que la cuenta existe si se especifica
        if (cuenta_id) {
            const cuentas = await this.db.query<QueryResult>(
                'SELECT saldo_inicial FROM cuentas WHERE id = ? AND usuario_id = ?',
                [cuenta_id, usuario_id]
            );

            if (cuentas.length === 0) {
                throw new NotFoundException(`Cuenta con ID ${cuenta_id} no encontrada`);
            }

            // Solo verificar saldo y descontar si el estado es PAGADO
            if (estado === EstadoGasto.PAGADO) {
                const saldoActual = parseFloat(cuentas[0].saldo_inicial);
                const montoGasto = parseFloat(monto.toString());

                if (saldoActual < montoGasto) {
                    throw new Error(`Saldo insuficiente en la cuenta. Saldo disponible: ${saldoActual}, Monto requerido: ${montoGasto}`);
                }

                // Descontar el monto de la cuenta
                await this.db.execute(
                    'UPDATE cuentas SET saldo_inicial = saldo_inicial - ?, actualizado_en = NOW() WHERE id = ?',
                    [montoGasto, cuenta_id]
                );
            }
        }
        
        const result = await this.db.execute(
            `INSERT INTO gastos_adicionales (usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, estado, notas) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, estado, notas]
        );

        // Crear el movimiento automático solo si está PAGADO y hay cuenta seleccionada
        if (cuenta_id && estado === EstadoGasto.PAGADO) {
            await this.db.execute(
                `INSERT INTO movimientos (usuario_id, cuenta_origen_id, tipo, monto, fecha, descripcion) 
                 VALUES (?, ?, 'GASTO', ?, ?, ?)`,
                [usuario_id, cuenta_id, monto, fecha, `Gasto adicional: ${concepto}`]
            );
        }

        return this.obtenerPorId(result.insertId);
    }

    async obtenerTodos(usuarioId: number, mes?: string, categoriaId?: number): Promise<GastoAdicionalResponse[]> {
        let query = `
            SELECT 
                ga.*,
                c.nombre as cuenta_nombre,
                cat.nombre as categoria_nombre
            FROM gastos_adicionales ga
            LEFT JOIN cuentas c ON ga.cuenta_id = c.id
            LEFT JOIN categorias_gasto cat ON ga.categoria_id = cat.id
            WHERE ga.usuario_id = ?
        `;
        const params: any[] = [usuarioId];

        if (mes) {
            query += ` AND DATE_FORMAT(ga.fecha, '%Y-%m') = ?`;
            params.push(mes);
        }

        if (categoriaId) {
            query += ` AND ga.categoria_id = ?`;
            params.push(categoriaId);
        }

        query += ` ORDER BY ga.fecha DESC, ga.creado_en DESC`;

        const rows = await this.db.query<QueryResult>(query, params);
        return rows as GastoAdicionalResponse[];
    }

    async obtenerPorId(id: number): Promise<GastoAdicionalResponse> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                ga.*,
                c.nombre as cuenta_nombre,
                cat.nombre as categoria_nombre
            FROM gastos_adicionales ga
            LEFT JOIN cuentas c ON ga.cuenta_id = c.id
            LEFT JOIN categorias_gasto cat ON ga.categoria_id = cat.id
            WHERE ga.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            throw new NotFoundException(`Gasto adicional con ID ${id} no encontrado`);
        }

        return rows[0] as GastoAdicionalResponse;
    }

    async actualizar(id: number, actualizarGastoAdicionalDto: ActualizarGastoAdicionalDto): Promise<GastoAdicionalResponse> {
        // Primero obtener el gasto actual
        const gastoActual = await this.obtenerPorId(id);
        
        const campos = [];
        const valores = [];

        Object.entries(actualizarGastoAdicionalDto).forEach(([key, value]) => {
            if (value !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        });

        if (campos.length === 0) {
            return this.obtenerPorId(id);
        }

        // Verificar si se está cambiando el estado a PAGADO
        const nuevoEstado = actualizarGastoAdicionalDto.estado;
        const cambiaAPagado = nuevoEstado === EstadoGasto.PAGADO && gastoActual.estado === EstadoGasto.PENDIENTE;

        if (cambiaAPagado && gastoActual.cuenta_id) {
            // Verificar saldo suficiente
            const cuentas = await this.db.query<QueryResult>(
                'SELECT saldo_inicial FROM cuentas WHERE id = ? AND usuario_id = ?',
                [gastoActual.cuenta_id, gastoActual.usuario_id]
            );

            if (cuentas.length > 0) {
                const saldoActual = parseFloat(cuentas[0].saldo_inicial);
                const montoGasto = parseFloat(gastoActual.monto.toString());

                if (saldoActual < montoGasto) {
                    throw new Error(`Saldo insuficiente en la cuenta. Saldo disponible: ${saldoActual}, Monto requerido: ${montoGasto}`);
                }

                // Descontar el monto de la cuenta
                await this.db.execute(
                    'UPDATE cuentas SET saldo_inicial = saldo_inicial - ?, actualizado_en = NOW() WHERE id = ?',
                    [montoGasto, gastoActual.cuenta_id]
                );

                // Crear el movimiento
                await this.db.execute(
                    `INSERT INTO movimientos (usuario_id, cuenta_origen_id, tipo, monto, fecha, descripcion) 
                     VALUES (?, ?, 'GASTO', ?, ?, ?)`,
                    [gastoActual.usuario_id, gastoActual.cuenta_id, montoGasto, gastoActual.fecha, `Gasto adicional: ${gastoActual.concepto}`]
                );
            }
        }

        valores.push(id);

        const result = await this.db.execute(
            `UPDATE gastos_adicionales SET ${campos.join(', ')}, actualizado_en = NOW() WHERE id = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Gasto adicional con ID ${id} no encontrado`);
        }

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        const result = await this.db.execute(
            'DELETE FROM gastos_adicionales WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Gasto adicional con ID ${id} no encontrado`);
        }
    }

    async obtenerTotalPorMes(usuarioId: number, mes: string): Promise<number> {
        const rows = await this.db.query<QueryResult>(
            `SELECT COALESCE(SUM(monto), 0) as total 
             FROM gastos_adicionales 
             WHERE usuario_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = ? AND estado = 'PAGADO'`,
            [usuarioId, mes]
        );

        return parseFloat(rows[0].total || '0');
    }

    async obtenerDistribucionPorCategoria(usuarioId: number, mes: string): Promise<DistribucionGastosResponse[]> {
        const query = `
            SELECT 
                COALESCE(ga.categoria_id, 0) as categoria_id,
                COALESCE(cat.nombre, 'Sin categoría') as categoria_nombre,
                SUM(ga.monto) as total,
                ROUND((SUM(ga.monto) * 100.0 / (
                    SELECT SUM(monto) 
                    FROM gastos_adicionales 
                    WHERE usuario_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = ? AND estado = 'PAGADO'
                )), 2) as porcentaje
            FROM gastos_adicionales ga
            LEFT JOIN categorias_gasto cat ON ga.categoria_id = cat.id
            WHERE ga.usuario_id = ? AND DATE_FORMAT(ga.fecha, '%Y-%m') = ? AND ga.estado = 'PAGADO'
            GROUP BY ga.categoria_id, cat.nombre
            ORDER BY total DESC
        `;

        const rows = await this.db.query<QueryResult>(query, [usuarioId, mes, usuarioId, mes]);
        return rows as DistribucionGastosResponse[];
    }

    async obtenerTop5Categorias(usuarioId: number, mes: string): Promise<DistribucionGastosResponse[]> {
        const distribucion = await this.obtenerDistribucionPorCategoria(usuarioId, mes);
        return distribucion.slice(0, 5);
    }

    async obtenerEstadisticasPorCategoria(usuarioId: number, categoriaId: number, meses: number = 6): Promise<any> {
        const query = `
            SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as mes,
                COUNT(*) as cantidad_gastos,
                SUM(monto) as total_mes,
                AVG(monto) as promedio_gasto,
                MIN(monto) as gasto_minimo,
                MAX(monto) as gasto_maximo
            FROM gastos_adicionales
            WHERE usuario_id = ? 
            AND categoria_id = ?
            AND fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
            AND estado = 'PAGADO'
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY mes DESC
        `;

        const rows = await this.db.query<QueryResult>(query, [usuarioId, categoriaId, meses]);
        return rows;
    }

    async marcarComoPagado(id: number): Promise<GastoAdicionalResponse> {
        return this.actualizar(id, { estado: EstadoGasto.PAGADO });
    }

    async marcarComoPendiente(id: number): Promise<GastoAdicionalResponse> {
        // Para cambiar de PAGADO a PENDIENTE, necesitamos revertir la operación
        const gastoActual = await this.obtenerPorId(id);
        
        if (gastoActual.estado === EstadoGasto.PAGADO && gastoActual.cuenta_id) {
            // Devolver el monto a la cuenta
            const montoGasto = parseFloat(gastoActual.monto.toString());
            await this.db.execute(
                'UPDATE cuentas SET saldo_inicial = saldo_inicial + ?, actualizado_en = NOW() WHERE id = ?',
                [montoGasto, gastoActual.cuenta_id]
            );

            // Eliminar el movimiento asociado (si existe)
            await this.db.execute(
                `DELETE FROM movimientos 
                 WHERE usuario_id = ? AND cuenta_origen_id = ? AND tipo = 'GASTO' 
                 AND monto = ? AND fecha = ? AND descripcion = ?`,
                [gastoActual.usuario_id, gastoActual.cuenta_id, montoGasto, gastoActual.fecha, `Gasto adicional: ${gastoActual.concepto}`]
            );
        }

        return this.actualizar(id, { estado: EstadoGasto.PENDIENTE });
    }
}