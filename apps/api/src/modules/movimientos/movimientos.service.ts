import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import {
    CrearMovimientoDto,
    TransferirDto,
    ActualizarMovimientoDto,
    MovimientoResponse,
    HistorialCuentaResponse,
    TipoMovimiento
} from './movimientos.dto';

@Injectable()
export class MovimientosService {
    constructor(private readonly db: DatabaseService) { }

    async crear(crearMovimientoDto: CrearMovimientoDto): Promise<MovimientoResponse> {
        const { usuario_id, cuenta_origen_id, cuenta_destino_id, tipo, monto, concepto, fecha, notas } = crearMovimientoDto;

        // Validaciones básicas
        if (tipo === 'TRANSFERENCIA' && (!cuenta_origen_id || !cuenta_destino_id)) {
            throw new BadRequestException('Las transferencias requieren cuenta de origen y destino');
        }

        if (cuenta_origen_id === cuenta_destino_id) {
            throw new BadRequestException('La cuenta de origen y destino no pueden ser la misma');
        }

        const result = await this.db.execute(
            `INSERT INTO movimientos (usuario_id, cuenta_origen_id, cuenta_destino_id, tipo, monto, concepto, fecha, notas) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, cuenta_origen_id, cuenta_destino_id, tipo, monto, concepto, fecha, notas]
        );

        return this.obtenerPorId(result.insertId);
    }

    async transferir(transferirDto: TransferirDto): Promise<{ movimiento: MovimientoResponse; mensaje: string }> {
        const { usuario_id, cuenta_origen_id, cuenta_destino_id, monto, concepto, fecha, notas } = transferirDto;

        return this.db.transaction(async (connection) => {
            // Verificar que ambas cuentas existen y pertenecen al usuario
            const cuentas = await this.db.queryInTransaction<QueryResult>(
                connection,
                'SELECT id, nombre, saldo_inicial FROM cuentas WHERE id IN (?, ?) AND usuario_id = ?',
                [cuenta_origen_id, cuenta_destino_id, usuario_id]
            );

            if (cuentas.length !== 2) {
                throw new NotFoundException('Una o ambas cuentas no encontradas');
            }

            // Calcular saldo actual de la cuenta origen
            const saldoOrigen = await this.calcularSaldoCuenta(cuenta_origen_id);
            const montoTransferir = parseFloat(monto);

            if (saldoOrigen < montoTransferir) {
                throw new BadRequestException(
                    `Saldo insuficiente. Saldo actual: $${saldoOrigen}, Intentando transferir: $${montoTransferir}`
                );
            }

            // Crear el movimiento de transferencia
            const result = await this.db.executeInTransaction(
                connection,
                `INSERT INTO movimientos (usuario_id, cuenta_origen_id, cuenta_destino_id, tipo, monto, concepto, fecha, notas) 
                 VALUES (?, ?, ?, 'TRANSFERENCIA', ?, ?, ?, ?)`,
                [usuario_id, cuenta_origen_id, cuenta_destino_id, monto, concepto, fecha, notas]
            );

            const movimiento = await this.obtenerPorId(result.insertId);

            return {
                movimiento,
                mensaje: `Transferencia de $${monto} realizada exitosamente de ${cuentas.find(c => c.id === cuenta_origen_id)?.nombre} a ${cuentas.find(c => c.id === cuenta_destino_id)?.nombre}`
            };
        });
    }

    async obtenerTodos(usuarioId: number, cuentaId?: number, tipo?: string, mes?: string, fechaInicio?: string, fechaFin?: string, busqueda?: string, montoMin?: string, montoMax?: string): Promise<MovimientoResponse[]> {
        let query = `
            SELECT 
                m.id,
                m.usuario_id,
                m.cuenta_origen_id,
                m.cuenta_destino_id,
                m.tipo,
                m.monto,
                DATE_FORMAT(m.fecha, '%Y-%m-%d') as fecha,
                m.descripcion,
                DATE_FORMAT(m.creado_en, '%Y-%m-%d %H:%i:%s') as creado_en,
                DATE_FORMAT(m.actualizado_en, '%Y-%m-%d %H:%i:%s') as actualizado_en,
                co.nombre as cuenta_origen_nombre,
                cd.nombre as cuenta_destino_nombre
            FROM movimientos m
            LEFT JOIN cuentas co ON m.cuenta_origen_id = co.id
            LEFT JOIN cuentas cd ON m.cuenta_destino_id = cd.id
            WHERE m.usuario_id = ?
        `;
        const params: any[] = [usuarioId];

        if (cuentaId) {
            query += ` AND (m.cuenta_origen_id = ? OR m.cuenta_destino_id = ?)`;
            params.push(cuentaId, cuentaId);
        }

        if (tipo) {
            query += ` AND m.tipo = ?`;
            params.push(tipo);
        }

        if (mes) {
            query += ` AND DATE_FORMAT(m.fecha, '%Y-%m') = ?`;
            params.push(mes);
        }

        if (fechaInicio) {
            query += ` AND m.fecha >= ?`;
            params.push(fechaInicio);
        }

        if (fechaFin) {
            query += ` AND m.fecha <= ?`;
            params.push(fechaFin);
        }

        if (busqueda) {
            query += ` AND m.descripcion LIKE ?`;
            params.push(`%${busqueda}%`);
        }

        if (montoMin) {
            query += ` AND m.monto >= ?`;
            params.push(parseFloat(montoMin));
        }

        if (montoMax) {
            query += ` AND m.monto <= ?`;
            params.push(parseFloat(montoMax));
        }

        query += ` ORDER BY m.fecha DESC, m.creado_en DESC`;

        const rows = await this.db.query<QueryResult>(query, params);
        return rows as MovimientoResponse[];
    }

    async obtenerPorId(id: number): Promise<MovimientoResponse> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                m.id,
                m.usuario_id,
                m.cuenta_origen_id,
                m.cuenta_destino_id,
                m.tipo,
                m.monto,
                DATE_FORMAT(m.fecha, '%Y-%m-%d') as fecha,
                m.descripcion,
                DATE_FORMAT(m.creado_en, '%Y-%m-%d %H:%i:%s') as creado_en,
                DATE_FORMAT(m.actualizado_en, '%Y-%m-%d %H:%i:%s') as actualizado_en,
                co.nombre as cuenta_origen_nombre,
                cd.nombre as cuenta_destino_nombre
            FROM movimientos m
            LEFT JOIN cuentas co ON m.cuenta_origen_id = co.id
            LEFT JOIN cuentas cd ON m.cuenta_destino_id = cd.id
            WHERE m.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
        }

        return rows[0] as MovimientoResponse;
    }

    async actualizar(id: number, actualizarMovimientoDto: ActualizarMovimientoDto): Promise<MovimientoResponse> {
        const campos = [];
        const valores = [];

        Object.entries(actualizarMovimientoDto).forEach(([key, value]) => {
            if (value !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        });

        if (campos.length === 0) {
            return this.obtenerPorId(id);
        }

        valores.push(id);

        const result = await this.db.execute(
            `UPDATE movimientos SET ${campos.join(', ')}, actualizado_en = NOW() WHERE id = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
        }

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        const result = await this.db.execute(
            'DELETE FROM movimientos WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
        }
    }

    async obtenerHistorialCuenta(cuentaId: number, mes?: string): Promise<HistorialCuentaResponse> {
        // Obtener información de la cuenta
        const cuenta = await this.db.query<QueryResult>(
            'SELECT id, nombre, saldo_inicial FROM cuentas WHERE id = ?',
            [cuentaId]
        );

        if (cuenta.length === 0) {
            throw new NotFoundException(`Cuenta con ID ${cuentaId} no encontrada`);
        }

        // Obtener movimientos
        let query = `
            SELECT 
                m.id,
                m.usuario_id,
                m.cuenta_origen_id,
                m.cuenta_destino_id,
                m.tipo,
                m.monto,
                DATE_FORMAT(m.fecha, '%Y-%m-%d') as fecha,
                m.descripcion,
                DATE_FORMAT(m.creado_en, '%Y-%m-%d %H:%i:%s') as creado_en,
                DATE_FORMAT(m.actualizado_en, '%Y-%m-%d %H:%i:%s') as actualizado_en,
                co.nombre as cuenta_origen_nombre,
                cd.nombre as cuenta_destino_nombre
            FROM movimientos m
            LEFT JOIN cuentas co ON m.cuenta_origen_id = co.id
            LEFT JOIN cuentas cd ON m.cuenta_destino_id = cd.id
            WHERE (m.cuenta_origen_id = ? OR m.cuenta_destino_id = ?)
        `;
        const params: any[] = [cuentaId, cuentaId];

        if (mes) {
            query += ` AND DATE_FORMAT(m.fecha, '%Y-%m') = ?`;
            params.push(mes);
        }

        query += ` ORDER BY m.fecha ASC, m.creado_en ASC`;

        const movimientos = await this.db.query<QueryResult>(query, params);

        // Calcular saldo final
        const saldoFinal = await this.calcularSaldoCuenta(cuentaId, mes);

        return {
            cuenta_id: cuenta[0].id,
            cuenta_nombre: cuenta[0].nombre,
            saldo_inicial: parseFloat(cuenta[0].saldo_inicial),
            movimientos: movimientos as MovimientoResponse[],
            saldo_final: saldoFinal
        };
    }

    async calcularSaldoCuenta(cuentaId: number, mes?: string): Promise<number> {
        // Obtener saldo inicial
        const cuenta = await this.db.query<QueryResult>(
            'SELECT saldo_inicial FROM cuentas WHERE id = ?',
            [cuentaId]
        );

        if (cuenta.length === 0) {
            throw new NotFoundException(`Cuenta con ID ${cuentaId} no encontrada`);
        }

        let saldo = parseFloat(cuenta[0].saldo_inicial);

        // Calcular impacto de movimientos
        let query = `
            SELECT 
                COALESCE(SUM(CASE WHEN cuenta_destino_id = ? THEN monto ELSE 0 END), 0) as ingresos,
                COALESCE(SUM(CASE WHEN cuenta_origen_id = ? THEN monto ELSE 0 END), 0) as egresos
            FROM movimientos 
            WHERE (cuenta_origen_id = ? OR cuenta_destino_id = ?)
        `;
        const params: any[] = [cuentaId, cuentaId, cuentaId, cuentaId];

        if (mes) {
            query += ` AND DATE_FORMAT(fecha, '%Y-%m') <= ?`;
            params.push(mes);
        }

        const movimientos = await this.db.query<QueryResult>(query, params);

        if (movimientos.length > 0) {
            const ingresos = parseFloat(movimientos[0].ingresos || '0');
            const egresos = parseFloat(movimientos[0].egresos || '0');
            saldo += ingresos - egresos;
        }

        return saldo;
    }

    async obtenerUltimosMovimientos(usuarioId: number, limite: number = 10): Promise<MovimientoResponse[]> {
        const query = `
            SELECT 
                m.id,
                m.usuario_id,
                m.cuenta_origen_id,
                m.cuenta_destino_id,
                m.tipo,
                m.monto,
                DATE_FORMAT(m.fecha, '%Y-%m-%d') as fecha,
                m.descripcion,
                DATE_FORMAT(m.creado_en, '%Y-%m-%d %H:%i:%s') as creado_en,
                DATE_FORMAT(m.actualizado_en, '%Y-%m-%d %H:%i:%s') as actualizado_en,
                co.nombre as cuenta_origen_nombre,
                cd.nombre as cuenta_destino_nombre
            FROM movimientos m
            LEFT JOIN cuentas co ON m.cuenta_origen_id = co.id
            LEFT JOIN cuentas cd ON m.cuenta_destino_id = cd.id
            WHERE m.usuario_id = ?
            ORDER BY m.fecha DESC, m.creado_en DESC
            LIMIT ?
        `;

        const rows = await this.db.query<QueryResult>(query, [usuarioId, limite]);
        return rows as MovimientoResponse[];
    }
}