import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, QueryResult } from '../../core/database.service';
import { CrearGastoFijoDto, ActualizarGastoFijoDto, GastoFijoResponse, EstadoGastoFijo } from './gastos-fijos.dto';

@Injectable()
export class GastosFijosService {
    constructor(private readonly db: DatabaseService) {}

    async crear(crearGastoFijoDto: CrearGastoFijoDto): Promise<GastoFijoResponse> {
        const { 
            usuario_id, cuenta_id, categoria_id, concepto, monto, estado, notas, 
            dia_mes, es_recurrente, duracion_meses, frecuencia_meses,
            es_prestamo, total_cuotas, cuota_actual, descripcion_prestamo,
            es_ahorro, meses_objetivo, mes_actual, monto_ya_ahorrado
        } = crearGastoFijoDto;
        
        // Calcular la fecha basada en el día del mes proporcionado
        let fecha: string;
        if (dia_mes) {
            const hoy = new Date();
            const año = hoy.getFullYear();
            const mes = hoy.getMonth(); // 0-based
            const fechaCalculada = new Date(año, mes, dia_mes);
            
            // Si la fecha ya pasó este mes, usar el próximo mes
            if (fechaCalculada < hoy) {
                fechaCalculada.setMonth(mes + 1);
            }
            
            fecha = fechaCalculada.toISOString().split('T')[0];
        } else {
            // Si no se proporciona dia_mes, usar la fecha actual
            fecha = new Date().toISOString().split('T')[0];
        }

        // Solo descontar de la cuenta si el estado es PAGADO
        if (cuenta_id && estado === 'PAGADO') {
            const cuentas = await this.db.query<QueryResult>(
                'SELECT saldo_inicial FROM cuentas WHERE id = ? AND usuario_id = ?',
                [cuenta_id, usuario_id]
            );

            if (cuentas.length === 0) {
                throw new NotFoundException(`Cuenta con ID ${cuenta_id} no encontrada`);
            }

            // Para gastos fijos NO verificamos saldo - permitir crear aunque no haya fondos suficientes
            // El usuario puede mover dinero entre cuentas para cubrir el gasto fijo
            
            const montoGasto = parseFloat(monto.toString());
            
            // Descontar el monto de la cuenta solo si está pagado (puede quedar en negativo)
            await this.db.execute(
                'UPDATE cuentas SET saldo_inicial = saldo_inicial - ?, actualizado_en = NOW() WHERE id = ?',
                [montoGasto, cuenta_id]
            );
        }
        
        // Para préstamos, agregar número de cuota al concepto
        let conceptoFinal = concepto;
        if (es_prestamo && total_cuotas) {
            const numeroCuota = (cuota_actual || 0) + 1; // Próxima cuota a pagar
            conceptoFinal = `${concepto} - Cuota ${numeroCuota}/${total_cuotas}`;
        }
        // Para ahorros, agregar número de mes al concepto
        else if (es_ahorro && meses_objetivo) {
            const numeroMes = (mes_actual || 0) + 1; // Próximo mes a ahorrar
            conceptoFinal = `${concepto} - Mes ${numeroMes}/${meses_objetivo}`;
        }

        // Construir consulta dinámicamente para manejar valores null
        const campos = ['usuario_id', 'concepto', 'monto', 'fecha', 'estado'];
        const valores: any[] = [usuario_id, conceptoFinal, monto, fecha, estado || 'PENDIENTE'];
        
        if (cuenta_id !== undefined && cuenta_id !== null) {
            campos.push('cuenta_id');
            valores.push(cuenta_id);
        }
        
        if (categoria_id !== undefined && categoria_id !== null) {
            campos.push('categoria_id');
            valores.push(categoria_id);
        }
        
        if (notas !== undefined && notas !== null) {
            campos.push('notas');
            valores.push(notas);
        }
        
        if (dia_mes !== undefined && dia_mes !== null) {
            campos.push('dia_mes');
            valores.push(dia_mes);
        }
        
        if (frecuencia_meses !== undefined && frecuencia_meses !== null) {
            campos.push('frecuencia_meses');
            valores.push(frecuencia_meses);
        }
        
        if (es_recurrente !== undefined) {
            campos.push('es_recurrente');
            valores.push(es_recurrente);
        }
        
        if (duracion_meses !== undefined && duracion_meses !== null) {
            campos.push('duracion_meses');
            valores.push(duracion_meses);
        }

        // Campos específicos para préstamos
        if (es_prestamo !== undefined) {
            campos.push('es_prestamo');
            valores.push(es_prestamo);
        }

        if (total_cuotas !== undefined && total_cuotas !== null) {
            campos.push('total_cuotas');
            valores.push(total_cuotas);
        }

        if (cuota_actual !== undefined && cuota_actual !== null) {
            campos.push('cuota_actual');
            valores.push(cuota_actual);
        }

        if (descripcion_prestamo !== undefined && descripcion_prestamo !== null) {
            campos.push('descripcion_prestamo');
            valores.push(descripcion_prestamo);
        }

        // Campos específicos para ahorros
        if (es_ahorro !== undefined) {
            campos.push('es_ahorro');
            valores.push(es_ahorro);
        }

        if (meses_objetivo !== undefined && meses_objetivo !== null) {
            campos.push('meses_objetivo');
            valores.push(meses_objetivo);
        }

        if (mes_actual !== undefined && mes_actual !== null) {
            campos.push('mes_actual');
            valores.push(mes_actual);
        }

        if (monto_ya_ahorrado !== undefined && monto_ya_ahorrado !== null) {
            campos.push('monto_ya_ahorrado');
            valores.push(monto_ya_ahorrado);
        }

        const placeholders = valores.map(() => '?').join(', ');
        const result = await this.db.execute(
            `INSERT INTO gastos_fijos (${campos.join(', ')}) VALUES (${placeholders})`,
            valores
        );

        // Crear el movimiento automático solo si está pagado y hay cuenta seleccionada
        if (cuenta_id && estado === 'PAGADO') {
            await this.db.execute(
                `INSERT INTO movimientos (usuario_id, cuenta_origen_id, tipo, monto, fecha, descripcion) 
                 VALUES (?, ?, 'GASTO', ?, ?, ?)`,
                [usuario_id, cuenta_id, monto, fecha, `Gasto fijo: ${concepto}`]
            );
        }

        const gastoCreado = await this.obtenerPorId(result.insertId);

        // Si es un préstamo, generar solo las cuotas restantes
        if (es_prestamo && total_cuotas) {
            const cuotaInicial = cuota_actual || 0; // Por defecto 0 si no se especifica
            const cuotasRestantes = total_cuotas - cuotaInicial - 1; // -1 porque ya creamos la primera cuota restante
            
            if (cuotasRestantes > 0) {
                await this.generarCuotasPrestamo(gastoCreado, cuotasRestantes);
            }
        }
        // Si es un ahorro, generar solo los meses restantes
        else if (es_ahorro && meses_objetivo) {
            const mesInicial = mes_actual || 0; // Por defecto 0 si no se especifica
            const mesesRestantes = meses_objetivo - mesInicial - 1; // -1 porque ya creamos el primer mes restante
            
            if (mesesRestantes > 0) {
                await this.generarMesesAhorro(gastoCreado, mesesRestantes);
            }
        }
        // Si es recurrente (pero no préstamo ni ahorro), generar gastos para los meses futuros
        else if (es_recurrente && duracion_meses && duracion_meses > 1) {
            await this.generarGastosFijosRecurrentes(gastoCreado, duracion_meses - 1);
        }

        return gastoCreado;
    }

    async obtenerTodos(usuarioId: number, mes?: string, soloActivos?: boolean): Promise<GastoFijoResponse[]> {
        let query = `
            SELECT 
                gf.*,
                c.nombre as cuenta_nombre,
                cat.nombre as categoria_nombre,
                gf.fecha as proximo_pago,
                DATEDIFF(gf.fecha, CURDATE()) as dias_hasta_vencimiento
            FROM gastos_fijos gf
            LEFT JOIN cuentas c ON gf.cuenta_id = c.id
            LEFT JOIN categorias_gasto cat ON gf.categoria_id = cat.id
            WHERE gf.usuario_id = ?
        `;
        
        const params: any[] = [usuarioId];

        if (mes) {
            query += ` AND DATE_FORMAT(gf.fecha, '%Y-%m') = ?`;
            params.push(mes);
        }

        query += ` ORDER BY 
            CASE gf.estado 
                WHEN 'PENDIENTE' THEN 1
                WHEN 'PAGADO' THEN 2
            END,
            gf.fecha ASC
        `;

        const rows = await this.db.query<QueryResult>(query, params);
        
        // Mapear los resultados para compatibilidad con el frontend
        const gastosFijos = rows.map((row: any) => ({
            ...row,
            dia_mes: row.dia_mes || new Date(row.fecha).getUTCDate(), // Usar el campo o calcular
            activo: true, // Por defecto activo hasta que se agregue el campo
            frecuencia_meses: row.frecuencia_meses || 1, // Usar el campo o por defecto mensual
            es_recurrente: Boolean(row.es_recurrente),
            duracion_meses: row.duracion_meses,
            gasto_padre_id: row.gasto_padre_id,
            fecha_pago: row.fecha_pago
        }));

        return gastosFijos as GastoFijoResponse[];
    }

    async obtenerPorId(id: number): Promise<GastoFijoResponse> {
        const rows = await this.db.query<QueryResult>(
            `SELECT 
                gf.*,
                c.nombre as cuenta_nombre,
                cat.nombre as categoria_nombre,
                gf.fecha as proximo_pago,
                DATEDIFF(gf.fecha, CURDATE()) as dias_hasta_vencimiento
            FROM gastos_fijos gf
            LEFT JOIN cuentas c ON gf.cuenta_id = c.id
            LEFT JOIN categorias_gasto cat ON gf.categoria_id = cat.id
            WHERE gf.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            throw new NotFoundException(`Gasto fijo con ID ${id} no encontrado`);
        }

        // Mapear el resultado para compatibilidad con el frontend
        const row = rows[0] as any;
        const gasto = {
            ...row,
            dia_mes: row.dia_mes || new Date(row.fecha).getUTCDate(), // Usar el campo o calcular
            activo: true,
            frecuencia_meses: row.frecuencia_meses || 1,
            es_recurrente: Boolean(row.es_recurrente),
            duracion_meses: row.duracion_meses,
            gasto_padre_id: row.gasto_padre_id,
            fecha_pago: row.fecha_pago
        };

        return gasto as GastoFijoResponse;
    }

    async actualizar(id: number, actualizarGastoFijoDto: ActualizarGastoFijoDto): Promise<GastoFijoResponse> {
        // Obtener el estado actual del gasto antes de actualizar
        const gastoActual = await this.obtenerPorId(id);
        const cambioAPagado = gastoActual.estado !== 'PAGADO' && actualizarGastoFijoDto.estado === 'PAGADO';

        const campos = [];
        const valores = [];

        // Mapear solo los campos que existen en la tabla actual
        const camposPermitidos = ['cuenta_id', 'categoria_id', 'concepto', 'monto', 'estado', 'notas'];

        Object.entries(actualizarGastoFijoDto).forEach(([key, value]) => {
            if (value !== undefined && camposPermitidos.includes(key)) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        });

        // Si se envía dia_mes, calcular la nueva fecha para el próximo pago
        if (actualizarGastoFijoDto.dia_mes !== undefined) {
            const hoy = new Date();
            const año = hoy.getFullYear();
            const mes = hoy.getMonth(); // 0-based
            const nuevaFecha = new Date(año, mes, actualizarGastoFijoDto.dia_mes);
            
            // Si la fecha ya pasó este mes, usar el próximo mes
            if (nuevaFecha < hoy) {
                nuevaFecha.setMonth(mes + 1);
            }
            
            campos.push('fecha = ?');
            valores.push(nuevaFecha.toISOString().split('T')[0]);
        }

        if (campos.length === 0) {
            return this.obtenerPorId(id);
        }

        // Si se está marcando como pagado y tiene cuenta, descontar y crear movimiento
        if (cambioAPagado && gastoActual.cuenta_id) {
            // Descontar el monto de la cuenta
            const montoGasto = parseFloat(gastoActual.monto.toString());
            await this.db.execute(
                'UPDATE cuentas SET saldo_inicial = saldo_inicial - ?, actualizado_en = NOW() WHERE id = ?',
                [montoGasto, gastoActual.cuenta_id]
            );

            // Crear el movimiento
            await this.db.execute(
                `INSERT INTO movimientos (usuario_id, cuenta_origen_id, tipo, monto, fecha, descripcion) 
                 VALUES (?, ?, 'GASTO', ?, ?, ?)`,
                [gastoActual.usuario_id, gastoActual.cuenta_id, gastoActual.monto, gastoActual.fecha, `Gasto fijo: ${gastoActual.concepto}`]
            );
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
             WHERE usuario_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = ? AND estado = 'PAGADO'`,
            [usuarioId, mes]
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
                gf.fecha as proximo_pago,
                DATEDIFF(gf.fecha, CURDATE()) as dias_hasta_vencimiento
            FROM gastos_fijos gf
            LEFT JOIN cuentas c ON gf.cuenta_id = c.id
            LEFT JOIN categorias_gasto cat ON gf.categoria_id = cat.id
            WHERE gf.usuario_id = ? 
            AND gf.estado = 'PENDIENTE'
            AND DATEDIFF(gf.fecha, CURDATE()) <= ?
            AND DATEDIFF(gf.fecha, CURDATE()) >= 0
            ORDER BY dias_hasta_vencimiento ASC
        `;

        const rows = await this.db.query<QueryResult>(query, [usuarioId, diasAdelante]);
        
        // Mapear los resultados para compatibilidad con el frontend
        const gastosFijos = rows.map((row: any) => ({
            ...row,
            dia_mes: row.dia_mes || new Date(row.fecha).getUTCDate(), // Usar el campo o calcular
            activo: true,
            frecuencia_meses: row.frecuencia_meses || 1,
            es_recurrente: Boolean(row.es_recurrente),
            duracion_meses: row.duracion_meses,
            gasto_padre_id: row.gasto_padre_id,
            fecha_pago: row.fecha_pago
        }));

        return gastosFijos as GastoFijoResponse[];
    }

    async actualizarEstadosVencidos(usuarioId: number): Promise<number> {
        const result = await this.db.execute(
            `UPDATE gastos_fijos 
             SET estado = 'PENDIENTE', actualizado_en = NOW()
             WHERE usuario_id = ? 
             AND estado = 'PENDIENTE'
             AND DATEDIFF(fecha, CURDATE()) < 0`,
            [usuarioId]
        );

        return result.affectedRows;
    }

    /**
     * Genera gastos fijos recurrentes para los meses futuros
     */
    async generarGastosFijosRecurrentes(gastoPadre: GastoFijoResponse, mesesRestantes: number): Promise<void> {
        if (mesesRestantes <= 0) return;

        const fechaBase = new Date(gastoPadre.fecha);
        const gastosAGenerar = [];

        for (let i = 1; i <= mesesRestantes; i++) {
            // Calcular el año y mes de destino
            const mesesTotales = fechaBase.getMonth() + (i * (gastoPadre.frecuencia_meses || 1));
            const añoDestino = fechaBase.getFullYear() + Math.floor(mesesTotales / 12);
            const mesDestino = mesesTotales % 12;

            // Crear fecha con el día correcto
            const nuevaFecha = new Date(añoDestino, mesDestino, gastoPadre.dia_mes || fechaBase.getDate());
            
            // Si el día no existe en el mes destino, usar el último día del mes
            if (nuevaFecha.getDate() !== (gastoPadre.dia_mes || fechaBase.getDate())) {
                nuevaFecha.setDate(0); // Último día del mes anterior
            }

            gastosAGenerar.push({
                usuario_id: gastoPadre.usuario_id,
                cuenta_id: gastoPadre.cuenta_id,
                categoria_id: gastoPadre.categoria_id,
                concepto: gastoPadre.concepto,
                monto: gastoPadre.monto,
                fecha: nuevaFecha.toISOString().split('T')[0],
                dia_mes: gastoPadre.dia_mes,
                frecuencia_meses: gastoPadre.frecuencia_meses,
                es_recurrente: false, // Los gastos generados no son recurrentes por sí mismos
                duracion_meses: null,
                gasto_padre_id: gastoPadre.id,
                estado: 'PENDIENTE',
                notas: gastoPadre.notas
            });
        }

        // Insertar todos los gastos generados
        for (const gasto of gastosAGenerar) {
            const campos = ['usuario_id', 'concepto', 'monto', 'fecha', 'estado', 'es_recurrente'];
            const valores: any[] = [gasto.usuario_id, gasto.concepto, gasto.monto, gasto.fecha, gasto.estado, gasto.es_recurrente];

            if (gasto.cuenta_id !== undefined && gasto.cuenta_id !== null) {
                campos.push('cuenta_id');
                valores.push(gasto.cuenta_id);
            }

            if (gasto.categoria_id !== undefined && gasto.categoria_id !== null) {
                campos.push('categoria_id');
                valores.push(gasto.categoria_id);
            }

            if (gasto.notas !== undefined && gasto.notas !== null) {
                campos.push('notas');
                valores.push(gasto.notas);
            }

            if (gasto.dia_mes !== undefined && gasto.dia_mes !== null) {
                campos.push('dia_mes');
                valores.push(gasto.dia_mes);
            }

            if (gasto.frecuencia_meses !== undefined && gasto.frecuencia_meses !== null) {
                campos.push('frecuencia_meses');
                valores.push(gasto.frecuencia_meses);
            }

            if (gasto.gasto_padre_id !== undefined && gasto.gasto_padre_id !== null) {
                campos.push('gasto_padre_id');
                valores.push(gasto.gasto_padre_id);
            }

            const placeholders = valores.map(() => '?').join(', ');
            await this.db.execute(
                `INSERT INTO gastos_fijos (${campos.join(', ')}) VALUES (${placeholders})`,
                valores
            );
        }
    }

    /**
     * Marca un gasto fijo como pagado con fecha específica
     */
    async marcarComoPagadoConFecha(id: number, fechaCobro?: string): Promise<GastoFijoResponse> {
        const updateData: any = { estado: 'PAGADO' };
        
        if (fechaCobro) {
            // Si tenemos fecha específica, actualizarla manualmente ya que actualizar() no maneja fecha_pago
            const gastoActual = await this.obtenerPorId(id);
            const cambioAPagado = gastoActual.estado !== 'PAGADO';

            // Actualizar el campo fecha_pago directamente si se proporciona
            await this.db.execute(
                'UPDATE gastos_fijos SET fecha_pago = ?, actualizado_en = NOW() WHERE id = ?',
                [fechaCobro, id]
            );

            // Si se está marcando como pagado y tiene cuenta, descontar y crear movimiento
            if (cambioAPagado && gastoActual.cuenta_id) {
                const montoGasto = parseFloat(gastoActual.monto.toString());
                await this.db.execute(
                    'UPDATE cuentas SET saldo_inicial = saldo_inicial - ?, actualizado_en = NOW() WHERE id = ?',
                    [montoGasto, gastoActual.cuenta_id]
                );

                await this.db.execute(
                    `INSERT INTO movimientos (usuario_id, cuenta_origen_id, tipo, monto, fecha, descripcion) 
                     VALUES (?, ?, 'GASTO', ?, ?, ?)`,
                    [gastoActual.usuario_id, gastoActual.cuenta_id, gastoActual.monto, fechaCobro, `Gasto fijo: ${gastoActual.concepto}`]
                );
            }
        }

        // Usar el método actualizar para manejar el cambio de estado correctamente
        return this.actualizar(id, updateData);
    }

    /**
     * Elimina todos los gastos fijos recurrentes generados a partir de un gasto padre
     */
    async eliminarGastosRecurrentes(gastoId: number): Promise<{ eliminados: number }> {
        // Primero verificar si es un gasto padre (es_recurrente = true)
        const gastoPadre = await this.db.query<QueryResult>(
            'SELECT id, es_recurrente FROM gastos_fijos WHERE id = ?',
            [gastoId]
        );

        if (gastoPadre.length === 0) {
            throw new NotFoundException(`Gasto fijo con ID ${gastoId} no encontrado`);
        }

        let gastoPadreId = gastoId;

        // Si no es el padre, buscar el padre
        if (!gastoPadre[0].es_recurrente) {
            const padre = await this.db.query<QueryResult>(
                'SELECT gasto_padre_id FROM gastos_fijos WHERE id = ?',
                [gastoId]
            );
            
            if (padre.length > 0 && padre[0].gasto_padre_id) {
                gastoPadreId = padre[0].gasto_padre_id;
            } else {
                throw new Error('Este gasto no forma parte de una serie recurrente');
            }
        }

        // Eliminar todos los gastos hijos (solo los PENDIENTES para no afectar historial)
        const result = await this.db.execute(
            'DELETE FROM gastos_fijos WHERE gasto_padre_id = ? AND estado = "PENDIENTE"',
            [gastoPadreId]
        );

        // También eliminar el gasto padre si está pendiente
        const resultPadre = await this.db.execute(
            'DELETE FROM gastos_fijos WHERE id = ? AND estado = "PENDIENTE"',
            [gastoPadreId]
        );

        return { eliminados: result.affectedRows + resultPadre.affectedRows };
    }

    /**
     * Genera todas las cuotas de un préstamo automáticamente
     */
    private async generarCuotasPrestamo(gastoPadre: GastoFijoResponse, cuotasRestantes: number): Promise<void> {
        const frecuencia = gastoPadre.frecuencia_meses || 1; // Por defecto mensual
        const fechaBase = new Date(gastoPadre.fecha);
        
        // Limpiar el concepto base eliminando cualquier información de cuota previa
        let conceptoBase = gastoPadre.concepto;
        // Remover patrones como "- Cuota X/Y" del concepto
        conceptoBase = conceptoBase.replace(/\s*-\s*Cuota\s+\d+\/\d+.*$/, '').trim();
        
        for (let i = 1; i <= cuotasRestantes; i++) {
            // Calcular la fecha de la siguiente cuota
            const fechaCuota = new Date(fechaBase);
            fechaCuota.setMonth(fechaCuota.getMonth() + (i * frecuencia));
            
            const numeroCuota = (gastoPadre.cuota_actual || 0) + i + 1; // +1 porque empezamos desde la siguiente cuota
            
            // Crear el concepto limpio con el número de cuota
            const conceptoCuota = `${conceptoBase} - Cuota ${numeroCuota}/${gastoPadre.total_cuotas}`;
            
            // Crear la nueva cuota
            await this.db.execute(
                `INSERT INTO gastos_fijos (
                    usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, 
                    estado, notas, dia_mes, frecuencia_meses, es_recurrente, 
                    duracion_meses, gasto_padre_id, es_prestamo, total_cuotas, 
                    cuota_actual, descripcion_prestamo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    gastoPadre.usuario_id,
                    gastoPadre.cuenta_id,
                    gastoPadre.categoria_id,
                    conceptoCuota,
                    gastoPadre.monto,
                    fechaCuota.toISOString().split('T')[0],
                    'PENDIENTE', // Las cuotas futuras siempre empiezan como pendientes
                    gastoPadre.notas,
                    gastoPadre.dia_mes,
                    gastoPadre.frecuencia_meses,
                    false, // Las cuotas individuales no son recurrentes
                    null, // No tienen duración propia
                    gastoPadre.id, // ID del gasto padre (primera cuota)
                    true, // Es parte de un préstamo
                    gastoPadre.total_cuotas,
                    numeroCuota,
                    gastoPadre.descripcion_prestamo
                ]
            );
        }
    }

    /**
     * Genera todos los meses de un ahorro automáticamente
     */
    private async generarMesesAhorro(gastoPadre: GastoFijoResponse, mesesRestantes: number): Promise<void> {
        const frecuencia = gastoPadre.frecuencia_meses || 1; // Por defecto mensual
        const fechaBase = new Date(gastoPadre.fecha);
        
        // Limpiar el concepto base eliminando cualquier información de mes previa
        let conceptoBase = gastoPadre.concepto;
        // Remover patrones como "- Mes X/Y" del concepto
        conceptoBase = conceptoBase.replace(/\s*-\s*Mes\s+\d+\/\d+.*$/, '').trim();
        
        for (let i = 1; i <= mesesRestantes; i++) {
            // Calcular la fecha del siguiente mes de ahorro
            const fechaMes = new Date(fechaBase);
            fechaMes.setMonth(fechaMes.getMonth() + (i * frecuencia));
            
            const numeroMes = (gastoPadre.mes_actual || 0) + i + 1; // +1 porque empezamos desde el siguiente mes
            
            // Crear el concepto limpio con el número de mes
            const conceptoMes = `${conceptoBase} - Mes ${numeroMes}/${gastoPadre.meses_objetivo}`;
            
            // Crear el nuevo mes de ahorro
            await this.db.execute(
                `INSERT INTO gastos_fijos (
                    usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, 
                    estado, notas, dia_mes, frecuencia_meses, es_recurrente, 
                    duracion_meses, gasto_padre_id, es_ahorro, meses_objetivo, 
                    mes_actual, monto_ya_ahorrado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    gastoPadre.usuario_id,
                    gastoPadre.cuenta_id,
                    gastoPadre.categoria_id,
                    conceptoMes,
                    gastoPadre.monto,
                    fechaMes.toISOString().split('T')[0],
                    'PENDIENTE', // Los meses futuros siempre empiezan como pendientes
                    gastoPadre.notas,
                    gastoPadre.dia_mes,
                    gastoPadre.frecuencia_meses,
                    false, // Los meses individuales no son recurrentes
                    null, // No tienen duración propia
                    gastoPadre.id, // ID del gasto padre (primer mes)
                    true, // Es parte de un ahorro
                    gastoPadre.meses_objetivo,
                    numeroMes,
                    gastoPadre.monto_ya_ahorrado || '0.00'
                ]
            );
        }
    }
}