import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../core/database.service';
import { 
    CrearTarjetaDto, 
    ActualizarTarjetaDto,
    TarjetaResponse
} from './tarjetas.dto';

@Injectable()
export class TarjetasService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearTarjetaDto: CrearTarjetaDto): Promise<TarjetaResponse> {
        const { usuario_id, cuenta_id, nombre, dia_corte, dia_vencimiento, activa } = crearTarjetaDto;
        
        const result = await this.db.query(
            `INSERT INTO tarjetas (usuario_id, cuenta_id, nombre, dia_corte, dia_vencimiento, activa) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [usuario_id, cuenta_id, nombre, dia_corte, dia_vencimiento, activa !== false]
        ) as any;

        return this.obtenerPorId(result.insertId);
    }

    async obtenerTodos(usuarioId: number, soloActivas?: boolean): Promise<TarjetaResponse[]> {
        let query = `
            SELECT 
                t.*,
                c.nombre as cuenta_nombre,
                COALESCE(consumos.total_mes, 0) as consumo_mes_actual,
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
                WHERE DATE_FORMAT(fecha_consumo, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
                GROUP BY tarjeta_id
            ) consumos ON t.id = consumos.tarjeta_id
            WHERE t.usuario_id = ?
        `;
        
        const params: any[] = [usuarioId];

        if (soloActivas) {
            query += ` AND t.activa = 1`;
        }

        query += ` ORDER BY t.activa DESC, t.nombre ASC`;

        const result = await this.db.query(query, params);
        return Array.isArray(result) ? result as TarjetaResponse[] : [result].filter(Boolean) as TarjetaResponse[];
    }

    async obtenerPorId(id: number): Promise<TarjetaResponse> {
        const result = await this.db.query(
            `SELECT 
                t.*,
                c.nombre as cuenta_nombre
            FROM tarjetas t
            LEFT JOIN cuentas c ON t.cuenta_id = c.id
            WHERE t.id = ?`,
            [id]
        );

        const rows = Array.isArray(result) ? result : [result].filter(Boolean);
        
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

        await this.db.query(
            `UPDATE tarjetas SET ${campos.join(', ')} WHERE id = ?`,
            valores
        );

        return this.obtenerPorId(id);
    }

    async eliminar(id: number): Promise<void> {
        await this.db.query(
            'DELETE FROM tarjetas WHERE id = ?',
            [id]
        );
    }
}