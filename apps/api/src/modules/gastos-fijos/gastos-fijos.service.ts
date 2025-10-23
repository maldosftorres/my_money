import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { CrearGastoFijoDto, ActualizarGastoFijoDto, GastoFijoResponse, EstadoGastoFijo } from './gastos-fijos.dto';

@Injectable()
export class GastosFijosService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearGastoFijoDto: CrearGastoFijoDto): Promise<GastoFijoResponse> {
        const { usuario_id, cuenta_id, categoria_id, concepto, monto, dia_vencimiento, estado, activo, notas } = crearGastoFijoDto;
        
        const result = await this.db.execute(
            `INSERT INTO gastos_fijos (usuario_id, cuenta_id, categoria_id, concepto, monto, dia_vencimiento, estado, activo, notas) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, cuenta_id, categoria_id, concepto, monto, dia_vencimiento, estado || 'PENDIENTE', activo !== false, notas]
        );

        return this.obtenerPorId(result.insertId);
    }

    async obtenerTodos(usuarioId: number, mes?: string, soloActivos?: boolean): Promise<GastoFijoResponse[]> {
        let query = `
            SELECT 
                gf.*,
                c.nombre as cuenta_nombre,
                cat.nombre as categoria_nombre,
                DATE_FORMAT(CONCAT(?, '-', LPAD(gf.dia_vencimiento, 2, '0')), '%Y-%m-%d') as fecha_vencimiento_actual,
                DATEDIFF(
                    DATE_FORMAT(CONCAT(?, '-', LPAD(gf.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                    CURDATE()
                ) as dias_hasta_vencimiento
            FROM gastos_fijos gf
            LEFT JOIN cuentas c ON gf.cuenta_id = c.id
            LEFT JOIN categorias_gasto cat ON gf.categoria_id = cat.id
            WHERE gf.usuario_id = ?
        `;
        
        const fechaBase = mes || new Date().toISOString().slice(0, 7);
        const params: any[] = [fechaBase, fechaBase, usuarioId];

        if (soloActivos) {
            query += ` AND gf.activo = true`;
        }

        query += ` ORDER BY 
            CASE gf.estado 
                WHEN 'VENCIDO' THEN 1
                WHEN 'PENDIENTE' THEN 2
                WHEN 'PAGADO' THEN 3
            END,
            gf.dia_vencimiento ASC
        `;

        const rows = await this.db.query<QueryResult>(query, params);
        return rows as GastoFijoResponse[];
    }

    async obtenerPorId(id: number): Promise<GastoFijoResponse> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                gf.*,
                c.nombre as cuenta_nombre,
                cat.nombre as categoria_nombre,
                DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(gf.dia_vencimiento, 2, '0')), '%Y-%m-%d') as fecha_vencimiento_actual,
                DATEDIFF(
                    DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(gf.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                    CURDATE()
                ) as dias_hasta_vencimiento
            FROM gastos_fijos gf
            LEFT JOIN cuentas c ON gf.cuenta_id = c.id
            LEFT JOIN categorias_gasto cat ON gf.categoria_id = cat.id
            WHERE gf.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            throw new NotFoundException(`Gasto fijo con ID ${id} no encontrado`);
        }

        return rows[0] as GastoFijoResponse;
    }

    async actualizar(id: number, actualizarGastoFijoDto: ActualizarGastoFijoDto): Promise<GastoFijoResponse> {
        const campos = [];
        const valores = [];

        Object.entries(actualizarGastoFijoDto).forEach(([key, value]) => {
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
            `UPDATE gastos_fijos SET ${campos.join(', ')}, actualizado_en = NOW() WHERE id = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Gasto fijo con ID ${id} no encontrado`);
        }

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        const result = await this.db.execute(
            'DELETE FROM gastos_fijos WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Gasto fijo con ID ${id} no encontrado`);
        }
    }

    async obtenerTotalPorMes(usuarioId: number, mes: string): Promise<number> {
        const rows = await this.db.query<QueryResult>(
            `SELECT COALESCE(SUM(monto), 0) as total 
             FROM gastos_fijos 
             WHERE usuario_id = ? AND activo = true AND estado = 'PAGADO'`,
            [usuarioId]
        );

        return parseFloat(rows[0].total || '0');
    }

    async marcarComoPagado(id: number): Promise<GastoFijoResponse> {
        return this.actualizar(id, { estado: EstadoGastoFijo.PAGADO });
    }

    async obtenerVencimientosProximos(usuarioId: number, diasAdelante: number = 7): Promise<GastoFijoResponse[]> {
        const query = `
            SELECT 
                gf.*,
                c.nombre as cuenta_nombre,
                cat.nombre as categoria_nombre,
                DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(gf.dia_vencimiento, 2, '0')), '%Y-%m-%d') as fecha_vencimiento_actual,
                DATEDIFF(
                    DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(gf.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                    CURDATE()
                ) as dias_hasta_vencimiento
            FROM gastos_fijos gf
            LEFT JOIN cuentas c ON gf.cuenta_id = c.id
            LEFT JOIN categorias_gasto cat ON gf.categoria_id = cat.id
            WHERE gf.usuario_id = ? 
            AND gf.activo = true 
            AND gf.estado = 'PENDIENTE'
            AND DATEDIFF(
                DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(gf.dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                CURDATE()
            ) <= ?
            ORDER BY dias_hasta_vencimiento ASC
        `;

        const rows = await this.db.query<QueryResult>(query, [usuarioId, diasAdelante]);
        return rows as GastoFijoResponse[];
    }

    async actualizarEstadosVencidos(usuarioId: number): Promise<number> {
        const result = await this.db.execute(
            `UPDATE gastos_fijos 
             SET estado = 'VENCIDO', actualizado_en = NOW()
             WHERE usuario_id = ? 
             AND activo = true 
             AND estado = 'PENDIENTE'
             AND DATEDIFF(
                 DATE_FORMAT(CONCAT(DATE_FORMAT(NOW(), '%Y-%m'), '-', LPAD(dia_vencimiento, 2, '0')), '%Y-%m-%d'), 
                 CURDATE()
             ) < 0`,
            [usuarioId]
        );

        return result.affectedRows;
    }
}