import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { CrearIngresoDto, ActualizarIngresoDto, IngresoResponse, EstadoPago } from './ingresos.dto';

@Injectable()
export class IngresosService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearIngresoDto: CrearIngresoDto): Promise<IngresoResponse> {
        const { 
            usuario_id, 
            cuenta_id, 
            concepto, 
            monto, 
            fecha, 
            estado, 
            notas,
            dia_mes,
            frecuencia_meses,
            es_recurrente,
            ingreso_padre_id
        } = crearIngresoDto;
        
        // Solo sumar el monto a la cuenta si el estado es PAGADO
        if (cuenta_id && estado === 'PAGADO') {
            const cuentas = await this.db.query<QueryResult>(
                'SELECT saldo_inicial FROM cuentas WHERE id = ? AND usuario_id = ?',
                [cuenta_id, usuario_id]
            );

            if (cuentas.length === 0) {
                throw new NotFoundException(`Cuenta con ID ${cuenta_id} no encontrada`);
            }

            // Sumar el monto a la cuenta solo si está pagado
            await this.db.execute(
                'UPDATE cuentas SET saldo_inicial = saldo_inicial + ?, actualizado_en = NOW() WHERE id = ?',
                [parseFloat(monto.toString()), cuenta_id]
            );
        }
        
        // Construir la query dinámicamente dependiendo de si tenemos ingreso_padre_id
        let query: string;
        let params: any[];
        
        if (ingreso_padre_id) {
            query = `INSERT INTO ingresos (usuario_id, cuenta_id, concepto, monto, fecha, estado, notas, dia_mes, frecuencia_meses, es_recurrente, ingreso_padre_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            params = [
                usuario_id, 
                cuenta_id || null, 
                concepto, 
                monto, 
                fecha, 
                estado || 'PENDIENTE', 
                notas || null, 
                dia_mes || null, 
                frecuencia_meses || 1, 
                es_recurrente || false,
                ingreso_padre_id
            ];
        } else {
            query = `INSERT INTO ingresos (usuario_id, cuenta_id, concepto, monto, fecha, estado, notas, dia_mes, frecuencia_meses, es_recurrente) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            params = [
                usuario_id, 
                cuenta_id || null, 
                concepto, 
                monto, 
                fecha, 
                estado || 'PENDIENTE', 
                notas || null, 
                dia_mes || null, 
                frecuencia_meses || 1, 
                es_recurrente || false
            ];
        }

        const result = await this.db.execute(query, params);

        // Crear el movimiento automático solo si está pagado y hay cuenta seleccionada
        if (cuenta_id && estado === 'PAGADO') {
            await this.db.execute(
                `INSERT INTO movimientos (usuario_id, cuenta_destino_id, tipo, monto, fecha, descripcion) 
                 VALUES (?, ?, 'INGRESO', ?, ?, ?)`,
                [usuario_id, cuenta_id, monto, fecha, `Ingreso: ${concepto}`]
            );
        }

        const ingresoCreado = await this.obtenerPorId(result.insertId);

        // Si es recurrente, generar los próximos meses
        if (es_recurrente && dia_mes && !ingreso_padre_id) {
            await this.generarIngresosRecurrentes(ingresoCreado);
        }

        return ingresoCreado;
    }

    async obtenerTodos(usuarioId: number, mes?: string, estado?: string): Promise<IngresoResponse[]> {
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

        if (estado) {
            query += ` AND i.estado = ?`;
            params.push(estado);
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

    async marcarComoPagado(id: number, fechaCobro?: string): Promise<IngresoResponse> {
        // Obtener el ingreso actual
        const ingreso = await this.obtenerPorId(id);
        
        // Si tiene cuenta, sumar el monto al saldo
        if (ingreso.cuenta_id && ingreso.estado === 'PENDIENTE') {
            await this.db.execute(
                'UPDATE cuentas SET saldo_inicial = saldo_inicial + ?, actualizado_en = NOW() WHERE id = ?',
                [parseFloat(ingreso.monto.toString()), ingreso.cuenta_id]
            );

            // Crear el movimiento automático
            await this.db.execute(
                `INSERT INTO movimientos (usuario_id, cuenta_destino_id, tipo, monto, fecha, descripcion) 
                 VALUES (?, ?, 'INGRESO', ?, ?, ?)`,
                [ingreso.usuario_id, ingreso.cuenta_id, ingreso.monto, fechaCobro || ingreso.fecha, `Ingreso: ${ingreso.concepto}`]
            );
        }

        // Actualizar el estado y fecha de cobro
        const updateData: any = { estado: EstadoPago.PAGADO };
        if (fechaCobro) {
            updateData.fecha_cobro = fechaCobro;
        }

        return this.actualizar(id, updateData);
    }

    private async generarIngresosRecurrentes(ingresoOriginal: IngresoResponse): Promise<void> {
        const { 
            usuario_id, 
            cuenta_id, 
            concepto, 
            monto, 
            dia_mes, 
            frecuencia_meses, 
            notas, 
            id 
        } = ingresoOriginal;

        // Generar ingresos para los próximos 12 meses
        const mesesAGenerar = 12;
        const fechaOriginal = new Date(ingresoOriginal.fecha);
        
        for (let i = 1; i <= mesesAGenerar; i++) {
            // Calcular el año y mes de destino
            const mesesTotales = fechaOriginal.getMonth() + (i * frecuencia_meses);
            const añoDestino = fechaOriginal.getFullYear() + Math.floor(mesesTotales / 12);
            const mesDestino = mesesTotales % 12;

            // Crear fecha con el día correcto
            const fechaProxima = new Date(añoDestino, mesDestino, dia_mes);
            
            // Si el día no existe en el mes destino, usar el último día del mes
            if (fechaProxima.getDate() !== dia_mes) {
                fechaProxima.setDate(0); // Último día del mes anterior
            }

            // Formatear fecha para MySQL
            const fechaFormatted = fechaProxima.toISOString().split('T')[0];

            await this.db.execute(
                `INSERT INTO ingresos (usuario_id, cuenta_id, concepto, monto, fecha, estado, notas, dia_mes, frecuencia_meses, es_recurrente, ingreso_padre_id) 
                 VALUES (?, ?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?, ?)`,
                [
                    usuario_id,
                    cuenta_id,
                    concepto,
                    monto,
                    fechaFormatted,
                    notas,
                    dia_mes,
                    frecuencia_meses,
                    true,
                    id  // ID del ingreso padre
                ]
            );
        }
    }

    async obtenerIngresosRecurrentes(usuarioId: number): Promise<IngresoResponse[]> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                i.*,
                c.nombre as cuenta_nombre
            FROM ingresos i
            LEFT JOIN cuentas c ON i.cuenta_id = c.id
            WHERE i.usuario_id = ? AND i.es_recurrente = 1 AND i.ingreso_padre_id IS NULL
            ORDER BY i.concepto, i.dia_mes`,
            [usuarioId]
        );
        return rows as IngresoResponse[];
    }

    /**
     * Elimina todos los ingresos recurrentes generados a partir de un ingreso padre
     */
    async eliminarIngresosRecurrentes(ingresoId: number): Promise<{ eliminados: number }> {
        // Primero verificar si es un ingreso padre (es_recurrente = true)
        const ingresoPadre = await this.db.query<QueryResult>(
            'SELECT id, es_recurrente FROM ingresos WHERE id = ?',
            [ingresoId]
        );

        if (ingresoPadre.length === 0) {
            throw new NotFoundException(`Ingreso con ID ${ingresoId} no encontrado`);
        }

        let ingresoPadreId = ingresoId;

        // Si no es el padre, buscar el padre
        if (!ingresoPadre[0].es_recurrente) {
            const padre = await this.db.query<QueryResult>(
                'SELECT ingreso_padre_id FROM ingresos WHERE id = ?',
                [ingresoId]
            );
            
            if (padre.length > 0 && padre[0].ingreso_padre_id) {
                ingresoPadreId = padre[0].ingreso_padre_id;
            } else {
                throw new Error('Este ingreso no forma parte de una serie recurrente');
            }
        }

        // Eliminar todos los ingresos hijos (solo los PENDIENTES para no afectar historial)
        const result = await this.db.execute(
            'DELETE FROM ingresos WHERE ingreso_padre_id = ? AND estado = "PENDIENTE"',
            [ingresoPadreId]
        );

        // También eliminar el ingreso padre si está pendiente
        const resultPadre = await this.db.execute(
            'DELETE FROM ingresos WHERE id = ? AND estado = "PENDIENTE"',
            [ingresoPadreId]
        );

        return { eliminados: result.affectedRows + resultPadre.affectedRows };
    }
}