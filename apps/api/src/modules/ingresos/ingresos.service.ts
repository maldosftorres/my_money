import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { CrearIngresoDto, ActualizarIngresoDto, IngresoResponse, EstadoPago } from './ingresos.dto';

@Injectable()
export class IngresosService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearIngresoDto: CrearIngresoDto): Promise<IngresoResponse> {
        const { usuario_id, cuenta_id, concepto, monto, fecha, estado, notas } = crearIngresoDto;
        
        const result = await this.db.execute(
            `INSERT INTO ingresos (usuario_id, cuenta_id, concepto, monto, fecha, estado, notas) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id, cuenta_id, concepto, monto, fecha, estado || 'PENDIENTE', notas]
        );

        return this.obtenerPorId(result.insertId);
    }

    async obtenerTodos(usuarioId: number, mes?: string): Promise<IngresoResponse[]> {
        let query = `
            SELECT 
                i.*,
                c.nombre as cuenta_nombre
            FROM ingresos i
            LEFT JOIN cuentas c ON i.cuenta_id = c.id
            WHERE i.usuario_id = ?
        `;
        const params: any[] = [usuarioId];

        if (mes) {
            query += ` AND DATE_FORMAT(i.fecha, '%Y-%m') = ?`;
            params.push(mes);
        }

        query += ` ORDER BY i.fecha DESC, i.creado_en DESC`;

        const rows = await this.db.query<QueryResult>(query, params);
        return rows as IngresoResponse[];
    }

    async obtenerPorId(id: number): Promise<IngresoResponse> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                i.*,
                c.nombre as cuenta_nombre
            FROM ingresos i
            LEFT JOIN cuentas c ON i.cuenta_id = c.id
            WHERE i.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            throw new NotFoundException(`Ingreso con ID ${id} no encontrado`);
        }

        return rows[0] as IngresoResponse;
    }

    async actualizar(id: number, actualizarIngresoDto: ActualizarIngresoDto): Promise<IngresoResponse> {
        const campos = [];
        const valores = [];

        Object.entries(actualizarIngresoDto).forEach(([key, value]) => {
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
            `UPDATE ingresos SET ${campos.join(', ')}, actualizado_en = NOW() WHERE id = ?`,
            valores
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Ingreso con ID ${id} no encontrado`);
        }

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        const result = await this.db.execute(
            'DELETE FROM ingresos WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new NotFoundException(`Ingreso con ID ${id} no encontrado`);
        }
    }

    async obtenerTotalPorMes(usuarioId: number, mes: string): Promise<number> {
        const rows = await this.db.query<QueryResult>(
            `SELECT COALESCE(SUM(monto), 0) as total 
             FROM ingresos 
             WHERE usuario_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = ? AND estado = 'PAGADO'`,
            [usuarioId, mes]
        );

        return parseFloat(rows[0].total || '0');
    }

    async marcarComoPagado(id: number): Promise<IngresoResponse> {
        return this.actualizar(id, { estado: EstadoPago.PAGADO });
    }
}