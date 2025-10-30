import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { 
    CrearTarjetaDto, 
    ActualizarTarjetaDto,
    GastoTarjetaDto,
    PagoTarjetaDto,
    TarjetaResponse,
    EstadisticasTarjetaResponse,
    TipoTarjeta
} from './tarjetas.dto';

@Injectable()
export class TarjetasService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearTarjetaDto: CrearTarjetaDto): Promise<TarjetaResponse> {
        const { 
            usuario_id, 
            cuenta_id, 
            nombre, 
            tipo, 
            limite, 
            dia_vencimiento, 
            moneda = 'PYG',
            numero_tarjeta,
            banco_emisor,
            activa = true 
        } = crearTarjetaDto;

        // Validar que la cuenta existe y pertenece al usuario
        const cuentaExiste = await this.db.query<QueryResult>(
            'SELECT id FROM cuentas WHERE id = ? AND usuario_id = ? AND activa = 1',
            [cuenta_id, usuario_id]
        );

        if (cuentaExiste.length === 0) {
            throw new BadRequestException('La cuenta especificada no existe o no pertenece al usuario');
        }

        // Validar límite para tarjetas de crédito
        if (tipo === TipoTarjeta.CREDITO || tipo === TipoTarjeta.VIRTUAL) {
            if (!limite || limite <= 0) {
                throw new BadRequestException('Las tarjetas de crédito y virtuales requieren un límite válido');
            }
        }

        const result = await this.db.execute(
            `INSERT INTO tarjetas (
                usuario_id, cuenta_id, nombre, tipo, limite, dia_vencimiento, 
                moneda, numero_tarjeta, banco_emisor, activa
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuario_id, cuenta_id, nombre, tipo, limite, dia_vencimiento,
                moneda, numero_tarjeta, banco_emisor, activa
            ]
        );

        return this.obtenerPorId(result.insertId);
    }

    async obtenerTodos(usuarioId: number, soloActivas?: boolean): Promise<TarjetaResponse[]> {
        let query = `
            SELECT 
                t.*,
                c.nombre as cuenta_asociada_nombre,
                c.tipo as cuenta_asociada_tipo,
                -- Calcular saldo disponible para tarjetas de crédito
                CASE 
                    WHEN t.tipo IN ('CREDITO', 'VIRTUAL') AND t.limite IS NOT NULL 
                    THEN t.limite - t.saldo_utilizado 
                    ELSE NULL 
                END AS saldo_disponible,
                -- Calcular porcentaje utilizado
                CASE 
                    WHEN t.tipo IN ('CREDITO', 'VIRTUAL') AND t.limite IS NOT NULL AND t.limite > 0
                    THEN ROUND((t.saldo_utilizado / t.limite) * 100, 2)
                    ELSE 0
                END AS porcentaje_utilizado,
                -- Próximo vencimiento
                CASE 
                    WHEN t.dia_vencimiento IS NOT NULL THEN
                        CASE 
                            WHEN DAY(CURDATE()) <= t.dia_vencimiento THEN
                                DATE_FORMAT(CONCAT(DATE_FORMAT(CURDATE(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d')
                            ELSE
                                DATE_FORMAT(CONCAT(DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d')
                        END
                    ELSE NULL
                END AS proximo_vencimiento,
                -- Estado de la tarjeta
                CASE 
                    WHEN t.tipo = 'CREDITO' AND t.limite IS NOT NULL AND t.saldo_utilizado > (t.limite * 0.9) THEN 'LIMITE_ALTO'
                    WHEN t.tipo = 'CREDITO' AND t.limite IS NOT NULL AND t.saldo_utilizado > (t.limite * 0.7) THEN 'LIMITE_MEDIO'
                    WHEN t.activa = 1 THEN 'ACTIVA'
                    ELSE 'INACTIVA'
                END AS estado_tarjeta
            FROM tarjetas t
            LEFT JOIN cuentas c ON t.cuenta_id = c.id
            WHERE t.usuario_id = ?
        `;
        
        const params: any[] = [usuarioId];

        if (soloActivas) {
            query += ` AND t.activa = 1`;
        }

        query += ` ORDER BY t.activa DESC, t.tipo ASC, t.nombre ASC`;

        const rows = await this.db.query<QueryResult>(query, params);
        return rows as TarjetaResponse[];
    }

    async obtenerPorId(id: number): Promise<TarjetaResponse> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                t.*,
                c.nombre as cuenta_asociada_nombre,
                c.tipo as cuenta_asociada_tipo,
                -- Saldo disponible
                CASE 
                    WHEN t.tipo IN ('CREDITO', 'VIRTUAL') AND t.limite IS NOT NULL 
                    THEN t.limite - t.saldo_utilizado 
                    ELSE NULL 
                END AS saldo_disponible,
                -- Porcentaje utilizado
                CASE 
                    WHEN t.tipo IN ('CREDITO', 'VIRTUAL') AND t.limite IS NOT NULL AND t.limite > 0
                    THEN ROUND((t.saldo_utilizado / t.limite) * 100, 2)
                    ELSE 0
                END AS porcentaje_utilizado,
                -- Estado
                CASE 
                    WHEN t.tipo = 'CREDITO' AND t.limite IS NOT NULL AND t.saldo_utilizado > (t.limite * 0.9) THEN 'LIMITE_ALTO'
                    WHEN t.tipo = 'CREDITO' AND t.limite IS NOT NULL AND t.saldo_utilizado > (t.limite * 0.7) THEN 'LIMITE_MEDIO'
                    WHEN t.activa = 1 THEN 'ACTIVA'
                    ELSE 'INACTIVA'
                END AS estado_tarjeta
            FROM tarjetas t
            LEFT JOIN cuentas c ON t.cuenta_id = c.id
            WHERE t.id = ?`,
            [id]
        );
        
        if (rows.length === 0) {
            throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
        }

        return rows[0] as TarjetaResponse;
    }

    async actualizar(id: number, actualizarTarjetaDto: ActualizarTarjetaDto): Promise<TarjetaResponse> {
        // Verificar que la tarjeta existe
        const tarjetaExiste = await this.db.query<QueryResult>(
            'SELECT id, tipo FROM tarjetas WHERE id = ?',
            [id]
        );

        if (tarjetaExiste.length === 0) {
            throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
        }

        const campos = [];
        const valores = [];

        // Validaciones especiales antes de actualizar
        if (actualizarTarjetaDto.tipo && (actualizarTarjetaDto.tipo === TipoTarjeta.CREDITO || actualizarTarjetaDto.tipo === TipoTarjeta.VIRTUAL)) {
            if (actualizarTarjetaDto.limite && actualizarTarjetaDto.limite <= 0) {
                throw new BadRequestException('Las tarjetas de crédito y virtuales requieren un límite válido');
            }
        }

        Object.entries(actualizarTarjetaDto).forEach(([key, value]) => {
            if (value !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        });

        if (campos.length === 0) {
            return this.obtenerPorId(id);
        }

        campos.push('actualizado_en = NOW()');
        valores.push(id);

        const result = await this.db.execute(
            `UPDATE tarjetas SET ${campos.join(', ')} WHERE id = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
        }

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        // Verificar que no tenga saldo utilizado
        const tarjeta = await this.db.query<QueryResult>(
            'SELECT saldo_utilizado FROM tarjetas WHERE id = ?',
            [id]
        );

        if (tarjeta.length === 0) {
            throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
        }

        if (parseFloat(tarjeta[0].saldo_utilizado) > 0) {
            throw new BadRequestException('No se puede eliminar una tarjeta con saldo utilizado');
        }

        const result = await this.db.execute(
            'DELETE FROM tarjetas WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
        }
    }

    // NUEVAS FUNCIONALIDADES PARA GASTOS Y PAGOS

    async registrarGasto(gastoTarjetaDto: GastoTarjetaDto): Promise<{ movimiento: any; mensaje: string }> {
        const { usuario_id, tarjeta_id, concepto, monto, fecha, categoria_id, notas } = gastoTarjetaDto;

        return this.db.transaction(async (connection) => {
            // Obtener información de la tarjeta
            const tarjeta = await this.db.queryInTransaction<QueryResult>(
                connection,
                'SELECT * FROM tarjetas WHERE id = ? AND usuario_id = ? AND activa = 1',
                [tarjeta_id, usuario_id]
            );

            if (tarjeta.length === 0) {
                throw new NotFoundException('Tarjeta no encontrada o inactiva');
            }

            const tarjetaInfo = tarjeta[0];
            const montoGasto = parseFloat(monto.toString());

            // Validar límite para tarjetas de crédito
            if (tarjetaInfo.tipo === 'CREDITO' || tarjetaInfo.tipo === 'VIRTUAL') {
                const nuevoSaldo = parseFloat(tarjetaInfo.saldo_utilizado) + montoGasto;
                
                if (tarjetaInfo.limite && nuevoSaldo > parseFloat(tarjetaInfo.limite)) {
                    const disponible = parseFloat(tarjetaInfo.limite) - parseFloat(tarjetaInfo.saldo_utilizado);
                    throw new BadRequestException(
                        `Límite de crédito excedido. Disponible: $${disponible.toFixed(2)}`
                    );
                }
            }

            // Crear el movimiento
            const resultMovimiento = await this.db.executeInTransaction(
                connection,
                `INSERT INTO movimientos (
                    usuario_id, cuenta_origen_id, tarjeta_id, tipo, monto, fecha, descripcion
                ) VALUES (?, ?, ?, 'GASTO_TARJETA', ?, ?, ?)`,
                [
                    usuario_id, 
                    tarjetaInfo.cuenta_id, 
                    tarjeta_id, 
                    monto, 
                    fecha,
                    `${concepto}${notas ? ' - ' + notas : ''}`
                ]
            );

            // Actualizar saldo utilizado de la tarjeta
            await this.db.executeInTransaction(
                connection,
                'UPDATE tarjetas SET saldo_utilizado = saldo_utilizado + ? WHERE id = ?',
                [monto, tarjeta_id]
            );

            return {
                movimiento: { id: resultMovimiento.insertId },
                mensaje: `Gasto de $${montoGasto.toFixed(2)} registrado en ${tarjetaInfo.nombre}`
            };
        });
    }

    async registrarPago(pagoTarjetaDto: PagoTarjetaDto): Promise<{ movimiento: any; mensaje: string }> {
        const { usuario_id, tarjeta_id, cuenta_origen_id, monto, fecha, concepto } = pagoTarjetaDto;

        return this.db.transaction(async (connection) => {
            // Verificar tarjeta
            const tarjeta = await this.db.queryInTransaction<QueryResult>(
                connection,
                'SELECT * FROM tarjetas WHERE id = ? AND usuario_id = ? AND activa = 1',
                [tarjeta_id, usuario_id]
            );

            if (tarjeta.length === 0) {
                throw new NotFoundException('Tarjeta no encontrada o inactiva');
            }

            // Verificar cuenta origen
            const cuenta = await this.db.queryInTransaction<QueryResult>(
                connection,
                'SELECT * FROM cuentas WHERE id = ? AND usuario_id = ? AND activa = 1',
                [cuenta_origen_id, usuario_id]
            );

            if (cuenta.length === 0) {
                throw new NotFoundException('Cuenta de origen no encontrada o inactiva');
            }

            const tarjetaInfo = tarjeta[0];
            const cuentaInfo = cuenta[0];
            const montoPago = parseFloat(monto.toString());

            // Validar que no se pague más de lo que se debe
            if (montoPago > parseFloat(tarjetaInfo.saldo_utilizado)) {
                throw new BadRequestException(
                    `No se puede pagar más de lo adeudado. Saldo actual: $${tarjetaInfo.saldo_utilizado}`
                );
            }

            // Crear el movimiento de pago
            const resultMovimiento = await this.db.executeInTransaction(
                connection,
                `INSERT INTO movimientos (
                    usuario_id, cuenta_origen_id, tarjeta_id, tipo, monto, fecha, descripcion
                ) VALUES (?, ?, ?, 'PAGO_TARJETA', ?, ?, ?)`,
                [
                    usuario_id,
                    cuenta_origen_id,
                    tarjeta_id,
                    monto,
                    fecha,
                    `${concepto || 'Pago tarjeta ' + tarjetaInfo.nombre} desde ${cuentaInfo.nombre}`
                ]
            );

            // Reducir saldo utilizado de la tarjeta
            await this.db.executeInTransaction(
                connection,
                'UPDATE tarjetas SET saldo_utilizado = GREATEST(0, saldo_utilizado - ?) WHERE id = ?',
                [monto, tarjeta_id]
            );

            return {
                movimiento: { id: resultMovimiento.insertId },
                mensaje: `Pago de $${montoPago.toFixed(2)} aplicado a ${tarjetaInfo.nombre}`
            };
        });
    }

    async obtenerEstadisticas(usuarioId: number, tarjetaId: number): Promise<EstadisticasTarjetaResponse> {
        // Estadísticas del mes actual
        const estadisticasMes = await this.db.query<QueryResult>(
            `SELECT 
                COUNT(*) as cantidad_transacciones,
                COALESCE(SUM(monto), 0) as gastos_mes_actual,
                COALESCE(AVG(monto), 0) as promedio_gasto,
                MAX(fecha) as ultimo_gasto
            FROM movimientos 
            WHERE usuario_id = ? AND tarjeta_id = ? AND tipo = 'GASTO_TARJETA'
            AND DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')`,
            [usuarioId, tarjetaId]
        );

        // Histórico de 6 meses
        const historico = await this.db.query<QueryResult>(
            `SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as mes,
                COUNT(*) as cantidad,
                SUM(monto) as total_gastos
            FROM movimientos 
            WHERE usuario_id = ? AND tarjeta_id = ? AND tipo = 'GASTO_TARJETA'
            AND fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY mes DESC`,
            [usuarioId, tarjetaId]
        );

        // Información de la tarjeta
        const tarjeta = await this.obtenerPorId(tarjetaId);

        const stats = estadisticasMes[0] || {
            cantidad_transacciones: 0,
            gastos_mes_actual: 0,
            promedio_gasto: 0,
            ultimo_gasto: null
        };

        return {
            tarjeta_id: tarjeta.id,
            tarjeta_nombre: tarjeta.nombre,
            gastos_mes_actual: parseFloat(stats.gastos_mes_actual || '0'),
            cantidad_transacciones: parseInt(stats.cantidad_transacciones || '0'),
            promedio_gasto: parseFloat(stats.promedio_gasto || '0'),
            ultimo_gasto: stats.ultimo_gasto,
            historico_6_meses: historico.map(h => ({
                mes: h.mes,
                total_gastos: parseFloat(h.total_gastos || '0'),
                cantidad: parseInt(h.cantidad || '0')
            }))
        };
    }
}