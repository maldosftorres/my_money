import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { 
    CrearTarjetaDto, 
    ActualizarTarjetaDto, 
    PagarResumenDto,
    TarjetaResponse, 
    EstadisticasTarjetaResponse,
    TipoTarjeta 
} from './tarjetas.dto';

@Injectable()
export class TarjetasService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearTarjetaDto: CrearTarjetaDto): Promise<TarjetaResponse> {
        const { usuario_id, cuenta_id, nombre, tipo, limite, dia_corte, dia_vencimiento, activa, notas } = crearTarjetaDto;
        
        const result = await this.db.execute(
            `INSERT INTO tarjetas (usuario_id, cuenta_id, nombre, tipo, limite, dia_corte, dia_vencimiento, activa, notas) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, cuenta_id, nombre, tipo, limite, dia_corte, dia_vencimiento, activa !== false, notas]
        );

        return this.obtenerPorId(result.insertId);
    }

    async obtenerTodos(usuarioId: number, soloActivas?: boolean): Promise<TarjetaResponse[]> {
        let query = `
            SELECT 
                t.*,
                c.nombre as cuenta_nombre,
                COALESCE(consumos.total_mes, 0) as consumo_mes_actual,
                CASE 
                    WHEN t.limite IS NOT NULL AND t.limite > 0 
                    THEN ROUND((COALESCE(consumos.total_mes, 0) / t.limite) * 100, 2)
                    ELSE 0 
                END as porcentaje_utilizacion,
                CASE 
                    WHEN t.dia_vencimiento IS NOT NULL 
                    THEN DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d')
                    ELSE NULL 
                END as proximo_vencimiento,
                CASE 
                    WHEN t.dia_vencimiento IS NOT NULL 
                    THEN DATEDIFF(
                        DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                        CURDATE()
                    )
                    ELSE NULL 
                END as dias_hasta_vencimiento
            FROM tarjetas t
            LEFT JOIN cuentas c ON t.cuenta_id = c.id
            LEFT JOIN (
                SELECT 
                    tarjeta_id,
                    SUM(monto) as total_mes
                FROM consumos_tarjeta 
                WHERE DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
                GROUP BY tarjeta_id
            ) consumos ON t.id = consumos.tarjeta_id
            WHERE t.usuario_id = ?
        `;
        
        const params: any[] = [usuarioId];

        if (soloActivas) {
            query += ` AND t.activa = true`;
        }

        query += ` ORDER BY t.activa DESC, t.nombre ASC`;

        const rows = await this.db.query<QueryResult>(query, params);
        return rows as TarjetaResponse[];
    }

    async obtenerPorId(id: number): Promise<TarjetaResponse> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                t.*,
                c.nombre as cuenta_nombre,
                COALESCE(consumos.total_mes, 0) as consumo_mes_actual,
                CASE 
                    WHEN t.limite IS NOT NULL AND t.limite > 0 
                    THEN ROUND((COALESCE(consumos.total_mes, 0) / t.limite) * 100, 2)
                    ELSE 0 
                END as porcentaje_utilizacion,
                CASE 
                    WHEN t.dia_vencimiento IS NOT NULL 
                    THEN DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d')
                    ELSE NULL 
                END as proximo_vencimiento,
                CASE 
                    WHEN t.dia_vencimiento IS NOT NULL 
                    THEN DATEDIFF(
                        DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                        CURDATE()
                    )
                    ELSE NULL 
                END as dias_hasta_vencimiento
            FROM tarjetas t
            LEFT JOIN cuentas c ON t.cuenta_id = c.id
            LEFT JOIN (
                SELECT 
                    tarjeta_id,
                    SUM(monto) as total_mes
                FROM consumos_tarjeta 
                WHERE DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
                GROUP BY tarjeta_id
            ) consumos ON t.id = consumos.tarjeta_id
            WHERE t.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
        }

        return rows[0] as TarjetaResponse;
    }

    async actualizar(id: number, actualizarTarjetaDto: ActualizarTarjetaDto): Promise<TarjetaResponse> {
        const campos = [];
        const valores = [];

        Object.entries(actualizarTarjetaDto).forEach(([key, value]) => {
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
            `UPDATE tarjetas SET ${campos.join(', ')}, actualizado_en = NOW() WHERE id = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
        }

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        // Verificar si tiene consumos asociados
        const consumos = await this.db.query<QueryResult>(
            'SELECT COUNT(*) as total FROM consumos_tarjeta WHERE tarjeta_id = ?',
            [id]
        );

        if (consumos[0].total > 0) {
            throw new BadRequestException('No se puede eliminar la tarjeta porque tiene consumos asociados');
        }

        const result = await this.db.execute(
            'DELETE FROM tarjetas WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Tarjeta con ID ${id} no encontrada`);
        }
    }

    async pagarResumen(id: number, pagarResumenDto: PagarResumenDto): Promise<{ mensaje: string; transaccion_id?: number }> {
        const { monto, fecha_pago, concepto } = pagarResumenDto;
        
        return this.db.transaction(async (connection) => {
            // Verificar que la tarjeta existe y es de crédito
            const [tarjetas] = await connection.execute(
                'SELECT * FROM tarjetas WHERE id = ? AND tipo = "CREDITO"',
                [id]
            );

            if ((tarjetas as any[]).length === 0) {
                throw new NotFoundException('Tarjeta de crédito no encontrada');
            }

            const tarjeta = (tarjetas as any[])[0];

            // Si tiene cuenta asociada, crear movimiento de débito
            if (tarjeta.cuenta_id) {
                const [movimientoResult] = await connection.execute(
                    `INSERT INTO movimientos (usuario_id, cuenta_origen_id, tipo, monto, concepto, fecha) 
                     VALUES (?, ?, 'DEBITO', ?, ?, ?)`,
                    [tarjeta.usuario_id, tarjeta.cuenta_id, monto, concepto || `Pago tarjeta ${tarjeta.nombre}`, fecha_pago]
                );

                return {
                    mensaje: `Pago de $${monto} registrado exitosamente para la tarjeta ${tarjeta.nombre}`,
                    transaccion_id: (movimientoResult as any).insertId
                };
            }

            return {
                mensaje: `Pago de $${monto} registrado para la tarjeta ${tarjeta.nombre} (sin cuenta asociada)`
            };
        });
    }

    async obtenerEstadisticas(usuarioId: number, tarjetaId?: number, meses: number = 6): Promise<EstadisticasTarjetaResponse[]> {
        let query = `
            SELECT 
                t.id as tarjeta_id,
                t.nombre as tarjeta_nombre,
                COALESCE(stats.total_consumos, 0) as total_consumos,
                COALESCE(stats.promedio_consumo, 0) as promedio_consumo,
                t.limite,
                COALESCE(stats.utilizacion_actual, 0) as utilizacion_actual,
                CASE 
                    WHEN t.limite IS NOT NULL AND t.limite > 0 
                    THEN ROUND((COALESCE(stats.utilizacion_actual, 0) / t.limite) * 100, 2)
                    ELSE 0 
                END as porcentaje_utilizacion
            FROM tarjetas t
            LEFT JOIN (
                SELECT 
                    tarjeta_id,
                    SUM(monto) as total_consumos,
                    AVG(monto) as promedio_consumo,
                    SUM(CASE WHEN DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m') THEN monto ELSE 0 END) as utilizacion_actual
                FROM consumos_tarjeta 
                WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
                GROUP BY tarjeta_id
            ) stats ON t.id = stats.tarjeta_id
            WHERE t.usuario_id = ?
        `;

        const params = [meses, usuarioId];

        if (tarjetaId) {
            query += ` AND t.id = ?`;
            params.push(tarjetaId);
        }

        const rows = await this.db.query<QueryResult>(query, params);
        
        // Para cada tarjeta, obtener el detalle por mes
        const estadisticas = await Promise.all(
            rows.map(async (tarjeta: any) => {
                const consumosPorMes = await this.db.query<QueryResult>(
                    `SELECT 
                        DATE_FORMAT(fecha, '%Y-%m') as mes,
                        SUM(monto) as total,
                        COUNT(*) as cantidad
                    FROM consumos_tarjeta 
                    WHERE tarjeta_id = ? 
                    AND fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
                    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
                    ORDER BY mes DESC`,
                    [tarjeta.tarjeta_id, meses]
                );

                return {
                    ...tarjeta,
                    consumos_por_mes: consumosPorMes
                };
            })
        );

        return estadisticas as EstadisticasTarjetaResponse[];
    }

    async obtenerTarjetasConVencimientosProximos(usuarioId: number, dias: number = 7): Promise<TarjetaResponse[]> {
        const query = `
            SELECT 
                t.*,
                c.nombre as cuenta_nombre,
                COALESCE(consumos.total_mes, 0) as consumo_mes_actual,
                CASE 
                    WHEN t.limite IS NOT NULL AND t.limite > 0 
                    THEN ROUND((COALESCE(consumos.total_mes, 0) / t.limite) * 100, 2)
                    ELSE 0 
                END as porcentaje_utilizacion,
                DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d') as proximo_vencimiento,
                DATEDIFF(
                    DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                    CURDATE()
                ) as dias_hasta_vencimiento
            FROM tarjetas t
            LEFT JOIN cuentas c ON t.cuenta_id = c.id
            LEFT JOIN (
                SELECT 
                    tarjeta_id,
                    SUM(monto) as total_mes
                FROM consumos_tarjeta 
                WHERE DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
                GROUP BY tarjeta_id
            ) consumos ON t.id = consumos.tarjeta_id
            WHERE t.usuario_id = ? 
            AND t.activa = true 
            AND t.tipo = 'CREDITO'
            AND t.dia_vencimiento IS NOT NULL
            AND DATEDIFF(
                DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                CURDATE()
            ) <= ?
            AND DATEDIFF(
                DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(t.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                CURDATE()
            ) >= 0
            ORDER BY dias_hasta_vencimiento ASC
        `;

        const rows = await this.db.query<QueryResult>(query, [usuarioId, dias]);
        return rows as TarjetaResponse[];
    }
}