import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { 
    CrearConsumoTarjetaDto, 
    ActualizarConsumoTarjetaDto, 
    ConsumoTarjetaResponse,
    ResumenConsumosTarjetaResponse
} from './consumos-tarjeta.dto';

@Injectable()
export class ConsumosTarjetaService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearConsumoTarjetaDto: CrearConsumoTarjetaDto): Promise<ConsumoTarjetaResponse> {
        const { tarjeta_id, categoria_id, concepto, monto, fecha, cuotas, es_recurrente, notas } = crearConsumoTarjetaDto;
        
        // Verificar que la tarjeta existe y está activa
        const tarjeta = await this.db.query<QueryResult>(
            'SELECT * FROM tarjetas WHERE id = ? AND activa = true',
            [tarjeta_id]
        );

        if (tarjeta.length === 0) {
            throw new NotFoundException('Tarjeta no encontrada o inactiva');
        }

        // Verificar límite si es tarjeta de crédito
        if (tarjeta[0].tipo === 'CREDITO' && tarjeta[0].limite) {
            const consumosMes = await this.obtenerTotalMesActual(tarjeta_id);
            const nuevoTotal = consumosMes + parseFloat(monto);
            
            if (nuevoTotal > parseFloat(tarjeta[0].limite)) {
                throw new BadRequestException(
                    `El consumo excede el límite de la tarjeta. Límite: $${tarjeta[0].limite}, Utilizado: $${consumosMes}, Intentando: $${monto}`
                );
            }
        }

        const result = await this.db.execute(
            `INSERT INTO consumos_tarjeta (tarjeta_id, categoria_id, concepto, monto, fecha, cuotas, es_recurrente, notas) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [tarjeta_id, categoria_id, concepto, monto, fecha, cuotas || 1, es_recurrente || false, notas]
        );

        return this.obtenerPorId(result.insertId);
    }

    async obtenerTodos(usuarioId: number, tarjetaId?: number, mes?: string, categoriaId?: number): Promise<ConsumoTarjetaResponse[]> {
        let query = `
            SELECT 
                ct.*,
                t.nombre as tarjeta_nombre,
                cat.nombre as categoria_nombre,
                CASE 
                    WHEN ct.cuotas > 1 THEN ROUND(ct.monto / ct.cuotas, 2)
                    ELSE ct.monto 
                END as monto_cuota,
                ct.cuotas as cuotas_restantes
            FROM consumos_tarjeta ct
            INNER JOIN tarjetas t ON ct.tarjeta_id = t.id
            LEFT JOIN categorias_gasto cat ON ct.categoria_id = cat.id
            WHERE t.usuario_id = ?
        `;
        const params: any[] = [usuarioId];

        if (tarjetaId) {
            query += ` AND ct.tarjeta_id = ?`;
            params.push(tarjetaId);
        }

        if (mes) {
            query += ` AND DATE_FORMAT(ct.fecha, '%Y-%m') = ?`;
            params.push(mes);
        }

        if (categoriaId) {
            query += ` AND ct.categoria_id = ?`;
            params.push(categoriaId);
        }

        query += ` ORDER BY ct.fecha DESC, ct.creado_en DESC`;

        const rows = await this.db.query<QueryResult>(query, params);
        return rows as ConsumoTarjetaResponse[];
    }

    async obtenerPorId(id: number): Promise<ConsumoTarjetaResponse> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                ct.*,
                t.nombre as tarjeta_nombre,
                cat.nombre as categoria_nombre,
                CASE 
                    WHEN ct.cuotas > 1 THEN ROUND(ct.monto / ct.cuotas, 2)
                    ELSE ct.monto 
                END as monto_cuota,
                ct.cuotas as cuotas_restantes
            FROM consumos_tarjeta ct
            INNER JOIN tarjetas t ON ct.tarjeta_id = t.id
            LEFT JOIN categorias_gasto cat ON ct.categoria_id = cat.id
            WHERE ct.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            throw new NotFoundException(`Consumo con ID ${id} no encontrado`);
        }

        return rows[0] as ConsumoTarjetaResponse;
    }

    async actualizar(id: number, actualizarConsumoTarjetaDto: ActualizarConsumoTarjetaDto): Promise<ConsumoTarjetaResponse> {
        const campos = [];
        const valores = [];

        Object.entries(actualizarConsumoTarjetaDto).forEach(([key, value]) => {
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
            `UPDATE consumos_tarjeta SET ${campos.join(', ')}, actualizado_en = NOW() WHERE id = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Consumo con ID ${id} no encontrado`);
        }

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        const result = await this.db.execute(
            'DELETE FROM consumos_tarjeta WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Consumo con ID ${id} no encontrado`);
        }
    }

    async obtenerResumenPorTarjeta(usuarioId: number, mes: string): Promise<ResumenConsumosTarjetaResponse[]> {
        const query = `
            SELECT 
                t.id as tarjeta_id,
                t.nombre as tarjeta_nombre,
                COALESCE(SUM(ct.monto), 0) as total_mes,
                COUNT(ct.id) as cantidad_consumos,
                COALESCE(AVG(ct.monto), 0) as promedio_consumo,
                t.limite,
                CASE 
                    WHEN t.limite IS NOT NULL AND t.limite > 0 
                    THEN ROUND((COALESCE(SUM(ct.monto), 0) / t.limite) * 100, 2)
                    ELSE 0 
                END as porcentaje_utilizacion
            FROM tarjetas t
            LEFT JOIN consumos_tarjeta ct ON t.id = ct.tarjeta_id 
                AND DATE_FORMAT(ct.fecha, '%Y-%m') = ?
            WHERE t.usuario_id = ? AND t.activa = true
            GROUP BY t.id, t.nombre, t.limite
            ORDER BY total_mes DESC
        `;

        const resumen = await this.db.query<QueryResult>(query, [mes, usuarioId]);
        
        // Para cada tarjeta, obtener el detalle de consumos
        const resumenCompleto = await Promise.all(
            resumen.map(async (tarjeta: any) => {
                const consumos = await this.obtenerTodos(usuarioId, tarjeta.tarjeta_id, mes);
                return {
                    ...tarjeta,
                    consumos
                };
            })
        );

        return resumenCompleto as ResumenConsumosTarjetaResponse[];
    }

    async obtenerTotalMesActual(tarjetaId: number): Promise<number> {
        const rows = await this.db.query<QueryResult>(
            `SELECT COALESCE(SUM(monto), 0) as total 
             FROM consumos_tarjeta 
             WHERE tarjeta_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')`,
            [tarjetaId]
        );

        return parseFloat(rows[0].total || '0');
    }

    async obtenerConsumosRecurrentes(usuarioId: number): Promise<ConsumoTarjetaResponse[]> {
        const query = `
            SELECT 
                ct.*,
                t.nombre as tarjeta_nombre,
                cat.nombre as categoria_nombre,
                CASE 
                    WHEN ct.cuotas > 1 THEN ROUND(ct.monto / ct.cuotas, 2)
                    ELSE ct.monto 
                END as monto_cuota,
                ct.cuotas as cuotas_restantes
            FROM consumos_tarjeta ct
            INNER JOIN tarjetas t ON ct.tarjeta_id = t.id
            LEFT JOIN categorias_gasto cat ON ct.categoria_id = cat.id
            WHERE t.usuario_id = ? AND ct.es_recurrente = true
            ORDER BY ct.fecha DESC
        `;

        const rows = await this.db.query<QueryResult>(query, [usuarioId]);
        return rows as ConsumoTarjetaResponse[];
    }

    async duplicarRecurrentes(usuarioId: number, mesDestino: string): Promise<{ duplicados: number; errores: string[] }> {
        const recurrentes = await this.obtenerConsumosRecurrentes(usuarioId);
        let duplicados = 0;
        const errores: string[] = [];

        for (const consumo of recurrentes) {
            try {
                // Verificar si ya existe para este mes
                const existente = await this.db.query<QueryResult>(
                    `SELECT id FROM consumos_tarjeta 
                     WHERE tarjeta_id = ? AND concepto = ? AND DATE_FORMAT(fecha, '%Y-%m') = ?`,
                    [consumo.tarjeta_id, consumo.concepto, mesDestino]
                );

                if (existente.length === 0) {
                    const fechaDestino = `${mesDestino}-01`;
                    await this.crear({
                        tarjeta_id: consumo.tarjeta_id,
                        categoria_id: consumo.categoria_id,
                        concepto: consumo.concepto,
                        monto: consumo.monto,
                        fecha: fechaDestino,
                        cuotas: consumo.cuotas,
                        es_recurrente: true,
                        notas: consumo.notas
                    });
                    duplicados++;
                }
            } catch (error) {
                errores.push(`Error duplicando ${consumo.concepto}: ${error.message}`);
            }
        }

        return { duplicados, errores };
    }
}