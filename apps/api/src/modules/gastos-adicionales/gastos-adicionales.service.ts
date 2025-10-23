import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { 
    CrearGastoAdicionalDto, 
    ActualizarGastoAdicionalDto, 
    GastoAdicionalResponse, 
    DistribucionGastosResponse 
} from './gastos-adicionales.dto';

@Injectable()
export class GastosAdicionalesService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearGastoAdicionalDto: CrearGastoAdicionalDto): Promise<GastoAdicionalResponse> {
        const { usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, notas } = crearGastoAdicionalDto;
        
        const result = await this.db.execute(
            `INSERT INTO gastos_adicionales (usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, notas) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, notas]
        );

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
             WHERE usuario_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = ?`,
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
                    WHERE usuario_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = ?
                )), 2) as porcentaje
            FROM gastos_adicionales ga
            LEFT JOIN categorias_gasto cat ON ga.categoria_id = cat.id
            WHERE ga.usuario_id = ? AND DATE_FORMAT(ga.fecha, '%Y-%m') = ?
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
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY mes DESC
        `;

        const rows = await this.db.query<QueryResult>(query, [usuarioId, categoriaId, meses]);
        return rows;
    }
}