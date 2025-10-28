import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { 
    CrearTransferenciaDto, 
    ActualizarTransferenciaDto, 
    TransferenciaResponse, 
    ResumenTransferenciasResponse,
    EstadoTransferencia
} from './transferencias.dto';

@Injectable()
export class TransferenciasService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearTransferenciaDto: CrearTransferenciaDto): Promise<TransferenciaResponse> {
        const { 
            usuario_id, 
            cuenta_origen_id, 
            cuenta_destino_id, 
            monto, 
            concepto, 
            fecha, 
            estado = EstadoTransferencia.PENDIENTE, 
            notas 
        } = crearTransferenciaDto;

        // Validar que las cuentas son diferentes
        if (cuenta_origen_id === cuenta_destino_id) {
            throw new BadRequestException('Las cuentas de origen y destino deben ser diferentes');
        }

        // Verificar que ambas cuentas existen y pertenecen al usuario
        const cuentas = await this.db.query<QueryResult>(
            'SELECT id, nombre, saldo_inicial FROM cuentas WHERE id IN (?, ?) AND usuario_id = ?',
            [cuenta_origen_id, cuenta_destino_id, usuario_id]
        );

        if (cuentas.length !== 2) {
            throw new NotFoundException('Una o ambas cuentas no fueron encontradas');
        }

        const cuentaOrigen = cuentas.find(c => c.id === cuenta_origen_id);
        const cuentaDestino = cuentas.find(c => c.id === cuenta_destino_id);

        if (!cuentaOrigen || !cuentaDestino) {
            throw new NotFoundException('Error al identificar las cuentas');
        }

        const montoTransferencia = parseFloat(monto.toString());

        // Solo validar saldo y realizar transferencia si el estado es COMPLETADA
        if (estado === EstadoTransferencia.COMPLETADA) {
            const saldoOrigen = parseFloat(cuentaOrigen.saldo_inicial);

            if (saldoOrigen < montoTransferencia) {
                throw new BadRequestException(
                    `Saldo insuficiente en la cuenta origen. Saldo disponible: ${saldoOrigen}, Monto requerido: ${montoTransferencia}`
                );
            }

            // Realizar la transferencia
            await this.db.execute(
                'UPDATE cuentas SET saldo_inicial = saldo_inicial - ?, actualizado_en = NOW() WHERE id = ?',
                [montoTransferencia, cuenta_origen_id]
            );

            await this.db.execute(
                'UPDATE cuentas SET saldo_inicial = saldo_inicial + ?, actualizado_en = NOW() WHERE id = ?',
                [montoTransferencia, cuenta_destino_id]
            );

            // Crear movimientos para ambas cuentas
            await this.db.execute(
                `INSERT INTO movimientos (usuario_id, cuenta_origen_id, tipo, monto, fecha, descripcion) 
                 VALUES (?, ?, 'TRANSFERENCIA_SALIDA', ?, ?, ?)`,
                [usuario_id, cuenta_origen_id, montoTransferencia, fecha, `Transferencia a ${cuentaDestino.nombre}: ${concepto}`]
            );

            await this.db.execute(
                `INSERT INTO movimientos (usuario_id, cuenta_destino_id, tipo, monto, fecha, descripcion) 
                 VALUES (?, ?, 'TRANSFERENCIA_ENTRADA', ?, ?, ?)`,
                [usuario_id, cuenta_destino_id, montoTransferencia, fecha, `Transferencia desde ${cuentaOrigen.nombre}: ${concepto}`]
            );
        }

        const result = await this.db.execute(
            `INSERT INTO transferencias (usuario_id, cuenta_origen_id, cuenta_destino_id, monto, concepto, fecha, estado, notas) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, cuenta_origen_id, cuenta_destino_id, monto, concepto, fecha, estado, notas]
        );

        return this.obtenerPorId(result.insertId);
    }

    async obtenerTodas(usuarioId: number, mes?: string, cuentaId?: number): Promise<TransferenciaResponse[]> {
        let query = `
            SELECT 
                t.*,
                co.nombre as cuenta_origen_nombre,
                cd.nombre as cuenta_destino_nombre
            FROM transferencias t
            LEFT JOIN cuentas co ON t.cuenta_origen_id = co.id
            LEFT JOIN cuentas cd ON t.cuenta_destino_id = cd.id
            WHERE t.usuario_id = ?
        `;
        const params: any[] = [usuarioId];

        if (mes) {
            query += ` AND DATE_FORMAT(t.fecha, '%Y-%m') = ?`;
            params.push(mes);
        }

        if (cuentaId) {
            query += ` AND (t.cuenta_origen_id = ? OR t.cuenta_destino_id = ?)`;
            params.push(cuentaId, cuentaId);
        }

        query += ` ORDER BY t.fecha DESC, t.creado_en DESC`;

        const rows = await this.db.query<QueryResult>(query, params);
        return rows as TransferenciaResponse[];
    }

    async obtenerPorId(id: number): Promise<TransferenciaResponse> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                t.*,
                co.nombre as cuenta_origen_nombre,
                cd.nombre as cuenta_destino_nombre
            FROM transferencias t
            LEFT JOIN cuentas co ON t.cuenta_origen_id = co.id
            LEFT JOIN cuentas cd ON t.cuenta_destino_id = cd.id
            WHERE t.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            throw new NotFoundException(`Transferencia con ID ${id} no encontrada`);
        }

        return rows[0] as TransferenciaResponse;
    }

    async actualizar(id: number, actualizarTransferenciaDto: ActualizarTransferenciaDto): Promise<TransferenciaResponse> {
        // Obtener la transferencia actual
        const transferenciaActual = await this.obtenerPorId(id);
        
        const campos = [];
        const valores = [];

        Object.entries(actualizarTransferenciaDto).forEach(([key, value]) => {
            if (value !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        });

        if (campos.length === 0) {
            return this.obtenerPorId(id);
        }

        // Verificar si se está cambiando el estado a COMPLETADA
        const nuevoEstado = actualizarTransferenciaDto.estado;
        const cambiaACompletada = nuevoEstado === EstadoTransferencia.COMPLETADA && transferenciaActual.estado === EstadoTransferencia.PENDIENTE;

        if (cambiaACompletada) {
            // Validar saldo suficiente
            const cuentas = await this.db.query<QueryResult>(
                'SELECT saldo_inicial FROM cuentas WHERE id = ? AND usuario_id = ?',
                [transferenciaActual.cuenta_origen_id, transferenciaActual.usuario_id]
            );

            if (cuentas.length > 0) {
                const saldoActual = parseFloat(cuentas[0].saldo_inicial);
                const montoTransferencia = parseFloat(transferenciaActual.monto.toString());

                if (saldoActual < montoTransferencia) {
                    throw new BadRequestException(
                        `Saldo insuficiente en la cuenta origen. Saldo disponible: ${saldoActual}, Monto requerido: ${montoTransferencia}`
                    );
                }

                // Realizar la transferencia
                await this.db.execute(
                    'UPDATE cuentas SET saldo_inicial = saldo_inicial - ?, actualizado_en = NOW() WHERE id = ?',
                    [montoTransferencia, transferenciaActual.cuenta_origen_id]
                );

                await this.db.execute(
                    'UPDATE cuentas SET saldo_inicial = saldo_inicial + ?, actualizado_en = NOW() WHERE id = ?',
                    [montoTransferencia, transferenciaActual.cuenta_destino_id]
                );

                // Crear movimientos
                await this.db.execute(
                    `INSERT INTO movimientos (usuario_id, cuenta_origen_id, tipo, monto, fecha, descripcion) 
                     VALUES (?, ?, 'TRANSFERENCIA_SALIDA', ?, ?, ?)`,
                    [transferenciaActual.usuario_id, transferenciaActual.cuenta_origen_id, montoTransferencia, transferenciaActual.fecha, `Transferencia a ${transferenciaActual.cuenta_destino_nombre}: ${transferenciaActual.concepto}`]
                );

                await this.db.execute(
                    `INSERT INTO movimientos (usuario_id, cuenta_destino_id, tipo, monto, fecha, descripcion) 
                     VALUES (?, ?, 'TRANSFERENCIA_ENTRADA', ?, ?, ?)`,
                    [transferenciaActual.usuario_id, transferenciaActual.cuenta_destino_id, montoTransferencia, transferenciaActual.fecha, `Transferencia desde ${transferenciaActual.cuenta_origen_nombre}: ${transferenciaActual.concepto}`]
                );
            }
        }

        valores.push(id);

        const result = await this.db.execute(
            `UPDATE transferencias SET ${campos.join(', ')}, actualizado_en = NOW() WHERE id = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Transferencia con ID ${id} no encontrada`);
        }

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        const result = await this.db.execute(
            'DELETE FROM transferencias WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Transferencia con ID ${id} no encontrada`);
        }
    }

    async completarTransferencia(id: number): Promise<TransferenciaResponse> {
        return this.actualizar(id, { estado: EstadoTransferencia.COMPLETADA });
    }

    async marcarComoPendiente(id: number): Promise<TransferenciaResponse> {
        // Para cambiar de COMPLETADA a PENDIENTE, necesitamos revertir la operación
        const transferenciaActual = await this.obtenerPorId(id);
        
        if (transferenciaActual.estado === EstadoTransferencia.COMPLETADA) {
            const montoTransferencia = parseFloat(transferenciaActual.monto.toString());
            
            // Revertir la transferencia
            await this.db.execute(
                'UPDATE cuentas SET saldo_inicial = saldo_inicial + ?, actualizado_en = NOW() WHERE id = ?',
                [montoTransferencia, transferenciaActual.cuenta_origen_id]
            );

            await this.db.execute(
                'UPDATE cuentas SET saldo_inicial = saldo_inicial - ?, actualizado_en = NOW() WHERE id = ?',
                [montoTransferencia, transferenciaActual.cuenta_destino_id]
            );

            // Eliminar los movimientos asociados
            await this.db.execute(
                `DELETE FROM movimientos 
                 WHERE usuario_id = ? AND fecha = ? AND monto = ? 
                 AND ((cuenta_origen_id = ? AND tipo = 'TRANSFERENCIA_SALIDA') OR 
                      (cuenta_destino_id = ? AND tipo = 'TRANSFERENCIA_ENTRADA'))`,
                [transferenciaActual.usuario_id, transferenciaActual.fecha, montoTransferencia, 
                 transferenciaActual.cuenta_origen_id, transferenciaActual.cuenta_destino_id]
            );
        }

        return this.actualizar(id, { estado: EstadoTransferencia.PENDIENTE });
    }

    async obtenerResumen(usuarioId: number, mes?: string): Promise<ResumenTransferenciasResponse> {
        let query = `
            SELECT 
                COUNT(*) as total_transferencias,
                COALESCE(SUM(CASE WHEN estado = 'COMPLETADA' THEN monto ELSE 0 END), 0) as monto_total,
                COUNT(CASE WHEN estado = 'PENDIENTE' THEN 1 END) as transferencias_pendientes,
                COUNT(CASE WHEN estado = 'COMPLETADA' THEN 1 END) as transferencias_completadas
            FROM transferencias 
            WHERE usuario_id = ?
        `;
        const params: any[] = [usuarioId];

        if (mes) {
            query += ` AND DATE_FORMAT(fecha, '%Y-%m') = ?`;
            params.push(mes);
        }

        const rows = await this.db.query<QueryResult>(query, params);
        return rows[0] as ResumenTransferenciasResponse;
    }
}