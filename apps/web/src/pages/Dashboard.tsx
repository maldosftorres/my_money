import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Button, MetricCard, Modal } from '../components/ui';
import { notifications } from '../utils/notifications';
import {  DollarSign,  Home,  ShoppingCart,  Wallet,  TrendingUp,  TrendingDown,  Calendar,  CheckCircle,  Clock,  X } from 'lucide-react';

// Interfaces para los datos reales de la BD
interface Cuenta {
    id: number;
    usuario_id: number;
    nombre: string;
    tipo: string;
    saldo_inicial: number | string;
    moneda: string;
    activa: boolean;
    creado_en: string;
    actualizado_en: string;
}

interface Ingreso {
    id: number;
    usuario_id: number;
    cuenta_id: number | null;
    concepto: string;
    descripcion: string; // Para compatibilidad con el frontend
    monto: number | string;
    fecha: string;
    estado: 'PENDIENTE' | 'PAGADO';
    notas: string | null;
    creado_en: string;
    actualizado_en: string;
    cuenta_nombre?: string;
}

interface GastoFijo {
    id: number;
    usuario_id: number;
    cuenta_id: number | null;
    categoria_id: number | null;
    concepto: string;
    descripcion: string; // Para compatibilidad con el frontend
    monto: number | string;
    fecha: string;
    dia_mes?: number;
    estado: 'PENDIENTE' | 'PAGADO';
    activo?: boolean;
    notas: string | null;
    creado_en: string;
    actualizado_en: string;
    cuenta_nombre?: string;
    categoria_nombre?: string;
    proximo_pago?: string;
}

interface GastoAdicional {
    id: number;
    usuario_id: number;
    cuenta_id: number | null;
    categoria_id: number | null;
    concepto: string;
    descripcion: string; // Para compatibilidad con el frontend
    monto: number | string;
    fecha: string;
    estado: 'PENDIENTE' | 'PAGADO';
    notas: string | null;
    creado_en: string;
    actualizado_en: string;
    cuenta_nombre?: string;
    categoria_nombre?: string;
}

interface DatosFinancieros {
    cuentas: Cuenta[];
    ingresos: Ingreso[];
    gastosFijos: GastoFijo[];
    gastosAdicionales: GastoAdicional[];
}

export default function Dashboard() {
    const [datosFinancieros, setDatosFinancieros] = useState<DatosFinancieros>({
        cuentas: [],
        ingresos: [],
        gastosFijos: [],
        gastosAdicionales: []
    });
    const [loading, setLoading] = useState(true);
    const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7));
    const [showDetalleModal, setShowDetalleModal] = useState(false);

    useEffect(() => {
        loadAllData();
    }, [filtroMes]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadCuentas(),
                loadIngresos(),
                loadGastosFijos(),
                loadGastosAdicionales()
            ]);
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
            notifications.error('Error al cargar los datos financieros');
        } finally {
            setLoading(false);
        }
    };

    const loadCuentas = async () => {
        try {
            const response = await fetch('/api/v1/cuentas?usuarioId=1');
            const data = await response.json();
            setDatosFinancieros(prev => ({ ...prev, cuentas: data }));
        } catch (error) {
            console.error('Error al cargar cuentas:', error);
        }
    };

    const loadIngresos = async () => {
        try {
            const response = await fetch(`/api/v1/ingresos?usuarioId=1${filtroMes ? `&mes=${filtroMes}` : ''}`);
            const data = await response.json();
            // Mapear campos para compatibilidad
            const ingresosFormateados = data.map((ingreso: any) => ({
                ...ingreso,
                descripcion: ingreso.concepto,
                monto: typeof ingreso.monto === 'string' ? parseFloat(ingreso.monto) : ingreso.monto,
                fecha: ingreso.fecha ? ingreso.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
            }));
            console.log('Ingresos cargados desde API:', data);
            console.log('Ingresos formateados:', ingresosFormateados);
            setDatosFinancieros(prev => ({ ...prev, ingresos: ingresosFormateados }));
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
        }
    };

    const loadGastosFijos = async () => {
        try {
            const response = await fetch(`/api/v1/gastos-fijos?usuarioId=1`);
            const data = await response.json();
            // Mapear campos para compatibilidad
            const gastosFormateados = data.map((gasto: any) => ({
                ...gasto,
                descripcion: gasto.concepto,
                monto: typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto,
                fecha: gasto.fecha ? gasto.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
                proximo_pago: gasto.proximo_pago ? gasto.proximo_pago.split('T')[0] : gasto.fecha?.split('T')[0]
            }));
            setDatosFinancieros(prev => ({ ...prev, gastosFijos: gastosFormateados }));
        } catch (error) {
            console.error('Error al cargar gastos fijos:', error);
        }
    };

    const loadGastosAdicionales = async () => {
        try {
            const response = await fetch(`/api/v1/gastos-adicionales?usuarioId=1${filtroMes ? `&mes=${filtroMes}` : ''}`);
            const data = await response.json();
            // Mapear campos para compatibilidad
            const gastosFormateados = data.map((gasto: any) => ({
                ...gasto,
                descripcion: gasto.concepto,
                monto: typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto,
                fecha: gasto.fecha ? gasto.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
            }));
            setDatosFinancieros(prev => ({ ...prev, gastosAdicionales: gastosFormateados }));
        } catch (error) {
            console.error('Error al cargar gastos adicionales:', error);
        }
    };


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' Gs';
    };

    const formatDate = (date: string) => {
        const fecha = new Date(date + 'T00:00:00');
        return fecha.toLocaleDateString('es-PY');
    };

    // Cálculos financieros con datos reales de la BD
    const totalIngresos = datosFinancieros.ingresos.reduce((sum, ingreso) => {
        // Solo contar ingresos PAGADOS (temporalmente sin restricción de fecha)
        const esPagado = ingreso.estado === 'PAGADO';
        
        // Debug temporal para ver qué pasa con los ingresos
        console.log('Ingreso:', {
            concepto: ingreso.concepto,
            estado: ingreso.estado,
            esPagado,
            fecha: ingreso.fecha,
            monto: ingreso.monto,
            seIncluye: esPagado
        });
        
        if (esPagado) {
            const monto = typeof ingreso.monto === 'string' ? parseFloat(ingreso.monto) : ingreso.monto;
            return sum + (monto || 0);
        }
        return sum;
    }, 0);
    
    const totalGastosFijos = datosFinancieros.gastosFijos.reduce((sum, gasto) => {
        // Solo contar gastos fijos PAGADOS
        if (gasto.estado === 'PAGADO') {
            const monto = typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto;
            return sum + (monto || 0);
        }
        return sum;
    }, 0);


    
    const totalGastosAdicionales = datosFinancieros.gastosAdicionales.reduce((sum, gasto) => {
        // Solo contar gastos adicionales PAGADOS
        if (gasto.estado === 'PAGADO') {
            const monto = typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto;
            return sum + (monto || 0);
        }
        return sum;
    }, 0);
    
    const totalCuentas = datosFinancieros.cuentas.reduce((sum, cuenta) => {
        const saldo = typeof cuenta.saldo_inicial === 'string' ? parseFloat(cuenta.saldo_inicial) : cuenta.saldo_inicial;
        return sum + (saldo || 0);
    }, 0);
    
    // CÁLCULOS PARA VISIÓN FUTURA (Saldo Restante del Mes)
    const mesActual = filtroMes || new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // TODOS los ingresos del mes (pagados y pendientes)
    const totalIngresosDelMes = datosFinancieros.ingresos.reduce((sum, ingreso) => {
        const fechaIngreso = ingreso.fecha.slice(0, 7); // YYYY-MM
        if (fechaIngreso === mesActual) {
            const monto = typeof ingreso.monto === 'string' ? parseFloat(ingreso.monto) : ingreso.monto;
            console.log(`Ingreso del mes ${mesActual}:`, ingreso.concepto, monto);
            return sum + (monto || 0);
        }
        return sum;
    }, 0);
    
    // TODOS los gastos fijos del mes (pagados y pendientes)
    const totalGastosFijosDelMes = datosFinancieros.gastosFijos.reduce((sum, gasto) => {
        const fechaGasto = gasto.fecha.slice(0, 7); // YYYY-MM
        if (fechaGasto === mesActual) {
            const monto = typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto;
            console.log(`Gasto fijo del mes ${mesActual}:`, gasto.concepto, monto);
            return sum + (monto || 0);
        }
        return sum;
    }, 0);


    
    // TODOS los gastos adicionales del mes (pagados y pendientes)
    const totalGastosAdicionalesDelMes = datosFinancieros.gastosAdicionales.reduce((sum, gasto) => {
        const fechaGasto = gasto.fecha.slice(0, 7); // YYYY-MM
        if (fechaGasto === mesActual) {
            const monto = typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto;
            console.log(`Gasto adicional del mes ${mesActual}:`, gasto.concepto, monto);
            return sum + (monto || 0);
        }
        return sum;
    }, 0);
    
    console.log(`Totales del mes ${mesActual}:`, {
        ingresos: totalIngresosDelMes,
        gastosFijos: totalGastosFijosDelMes,
        gastosAdicionales: totalGastosAdicionalesDelMes,
        saldoDelMes: totalIngresosDelMes - totalGastosFijosDelMes - totalGastosAdicionalesDelMes
    });
    

    
    // Por ahora usamos solo el cálculo manual hasta que el backend esté completamente funcional

    // Calcular correctamente el saldo acumulado de meses anteriores
    const calcularSaldoAcumuladoAnterior = () => {
        if (!filtroMes) return 0; // Si no hay filtro, no hay meses anteriores
        
        let saldoAcumulado = 0;
        
        // Obtener todos los meses únicos donde hubo MOVIMIENTOS REALES (pagados) anteriores al mes filtrado
        const mesesConDatos = new Set<string>();
        
        // Agregar meses de ingresos PAGADOS anteriores
        datosFinancieros.ingresos.forEach(ing => {
            const mesIngreso = ing.fecha.slice(0, 7);
            if (mesIngreso < filtroMes && ing.estado === 'PAGADO') {
                mesesConDatos.add(mesIngreso);
            }
        });
        
        // Agregar meses de gastos fijos PAGADOS anteriores
        datosFinancieros.gastosFijos.forEach(gasto => {
            const mesGasto = gasto.fecha.slice(0, 7);
            if (mesGasto < filtroMes && gasto.estado === 'PAGADO') {
                mesesConDatos.add(mesGasto);
            }
        });


        
        // Agregar meses de gastos adicionales PAGADOS anteriores
        datosFinancieros.gastosAdicionales.forEach(gasto => {
            const mesGasto = gasto.fecha.slice(0, 7);
            if (mesGasto < filtroMes && gasto.estado === 'PAGADO') {
                mesesConDatos.add(mesGasto);
            }
        });
        
        // Calcular saldo de cada mes anterior
        Array.from(mesesConDatos).sort().forEach(mesAnterior => {
            // Ingresos del mes anterior (solo PAGADOS - movimientos reales)
            const ingresosDelMes = datosFinancieros.ingresos.reduce((sum, ing) => {
                if (ing.fecha.slice(0, 7) === mesAnterior && ing.estado === 'PAGADO') {
                    const monto = typeof ing.monto === 'string' ? parseFloat(ing.monto) : ing.monto;
                    return sum + (monto || 0);
                }
                return sum;
            }, 0);
            
            // Gastos fijos del mes anterior (solo PAGADOS - movimientos reales)
            const gastosFijosDelMes = datosFinancieros.gastosFijos.reduce((sum, gasto) => {
                if (gasto.fecha.slice(0, 7) === mesAnterior && gasto.estado === 'PAGADO') {
                    const monto = typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto;
                    return sum + (monto || 0);
                }
                return sum;
            }, 0);

            // Ahorros del mes anterior - eliminado
            
            // Gastos adicionales del mes anterior (solo PAGADOS - movimientos reales)
            const gastosAdicionalesDelMes = datosFinancieros.gastosAdicionales.reduce((sum, gasto) => {
                if (gasto.fecha.slice(0, 7) === mesAnterior && gasto.estado === 'PAGADO') {
                    const monto = typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto;
                    return sum + (monto || 0);
                }
                return sum;
            }, 0);
            
            // SALDO NETO del mes = Ingresos - Gastos (sin ahorros)
            const saldoNetoDelMes = ingresosDelMes - gastosFijosDelMes - gastosAdicionalesDelMes;
            
            // Acumular SOLO el saldo neto (no los gastos individuales)
            saldoAcumulado += saldoNetoDelMes;
            
            console.log(`Mes anterior ${mesAnterior}:`, {
                ingresos: ingresosDelMes,
                gastosFijos: gastosFijosDelMes,
                gastosAdicionales: gastosAdicionalesDelMes,
                saldoNetoDelMes,
                saldoAcumuladoHastaAhora: saldoAcumulado
            });
        });
        
        console.log('Saldo acumulado total de meses anteriores:', saldoAcumulado);
        return saldoAcumulado;
    };
    
    const saldoAcumuladoAnterior = calcularSaldoAcumuladoAnterior();
    
    // SALDO RESTANTE = Saldo base + Saldo acumulado anterior + (Ingresos del mes - Gastos del mes)
    const saldoDelMesActual = totalIngresosDelMes - totalGastosFijosDelMes - totalGastosAdicionalesDelMes;
    const saldoRestante = totalCuentas + saldoAcumuladoAnterior + saldoDelMesActual;
    
    console.log('Cálculo del saldo restante:', {
        totalCuentas,
        saldoAcumuladoAnterior,
        saldoDelMesActual,
        saldoRestante,
        mesActual: filtroMes
    });
    
    // CÁLCULOS PARA REALIDAD ACTUAL (Saldo Real)
    const saldoRealActual = totalCuentas + totalIngresos - totalGastosFijos - totalGastosAdicionales;
    
    // Porcentaje para la barra de progreso (basado en ingresos del mes)
    const porcentajeGastado = totalIngresosDelMes > 0 ? ((totalGastosFijosDelMes + totalGastosAdicionalesDelMes) / totalIngresosDelMes) * 100 : 0;

    // Distribución de gastos por categoría con datos reales - Solo PAGADOS
    const gastosPorCategoria = [
        ...datosFinancieros.gastosFijos, 
        ...datosFinancieros.gastosAdicionales
    ]
        .filter(gasto => gasto.estado === 'PAGADO') // Solo gastos pagados
        .reduce((acc, gasto) => {
            const categoria = gasto.categoria_nombre || 'Sin categoría';
            const monto = typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto;
            acc[categoria] = (acc[categoria] || 0) + (monto || 0);
            return acc;
        }, {} as Record<string, number>);

    const categoriasOrdenadas = Object.entries(gastosPorCategoria)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Movimientos recientes (últimos 7 días) - Solo PAGADOS
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);

    const movimientosRecientes = [
        ...datosFinancieros.ingresos
            .filter(ing => ing.estado === 'PAGADO') // Solo ingresos pagados
            .map(ing => ({
                ...ing,
                tipo: 'ingreso' as const,
                fecha: ing.fecha,
                categoria: 'Ingreso',
                monto: typeof ing.monto === 'string' ? parseFloat(ing.monto) : ing.monto
            })),
        ...datosFinancieros.gastosFijos
            .filter(gasto => gasto.estado === 'PAGADO') // Solo gastos fijos pagados
            .map(gasto => ({
                ...gasto,
                tipo: 'gasto' as const,
                fecha: gasto.fecha,
                categoria: gasto.categoria_nombre || 'Gasto Fijo',
                monto: typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto
            })),

        ...datosFinancieros.gastosAdicionales
            .filter(gasto => gasto.estado === 'PAGADO') // Solo gastos adicionales pagados
            .map(gasto => ({
                ...gasto,
                tipo: 'gasto' as const,
                fecha: gasto.fecha,
                categoria: gasto.categoria_nombre || 'Gasto Adicional',
                monto: typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto
            }))
    ]
        .filter(mov => new Date(mov.fecha) >= fechaLimite)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5);

    const getCategoriaColor = (categoria: string) => {
        const colors = {
            'Salario': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'Freelance': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            'Inversiones': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            'Vivienda': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            'Servicios': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            'Seguros': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            'Alimentación': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'Transporte': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
            'Entretenimiento': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',

        };
        return colors[categoria as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <label htmlFor="mes" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                            Filtrar por mes:
                        </label>
                        <input
                            type="month"
                            id="mes"
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(e.target.value)}
                            className="block w-36 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                        />
                        <Button
                            onClick={() => {
                                setFiltroMes('');
                                loadAllData();
                            }}
                            variant="secondary"
                            size="sm"
                        >
                            Limpiar filtro
                        </Button>
                        <Button
                            onClick={loadAllData}
                            variant="primary"
                            size="sm"  
                        >
                            Actualizar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Dashboard Financiero</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* Alerta de saldo */}
            {porcentajeGastado > 80 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 transition-colors duration-200">
                    <div className="flex">
                        <svg className="w-5 h-5 text-yellow-400 dark:text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 transition-colors duration-200">
                                Atención: Has gastado {porcentajeGastado.toFixed(1)}% de tus ingresos
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 transition-colors duration-200">
                                Te quedan {formatCurrency(saldoRestante)} disponibles este mes.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resumen de totales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <MetricCard
                    title="Ingresos Confirmados"
                    value={formatCurrency(totalIngresos)}
                    subtitle={`${datosFinancieros.ingresos.filter(i => i.estado === 'PAGADO').length} de ${datosFinancieros.ingresos.length} registros`}
                    icon={<DollarSign className="w-5 h-5" />}
                    iconColor="green"
                    valueColor="green"
                />

                <MetricCard
                    title="Gastos Fijos"
                    value={formatCurrency(totalGastosFijos)}
                    subtitle={`${datosFinancieros.gastosFijos.filter(g => g.estado === 'PAGADO').length} conceptos pagados`}
                    icon={<Home className="w-5 h-5" />}
                    iconColor="blue"
                    valueColor="red"
                />

                <MetricCard
                    title="Gastos Adicionales"
                    value={formatCurrency(totalGastosAdicionales)}
                    subtitle={`${datosFinancieros.gastosAdicionales.filter(g => g.estado === 'PAGADO').length} de ${datosFinancieros.gastosAdicionales.length} gastos`}
                    icon={<ShoppingCart className="w-5 h-5" />}
                    iconColor="red"
                    valueColor="red"
                />
            </div>

            {/* Análisis Financiero: Futuro vs Presente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            🔮 Saldo Restante del Mes
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full transition-colors duration-200">
                                Proyección
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <div className="text-center py-6">
                        <p className={`text-2xl font-bold transition-colors duration-200 ${saldoRestante >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(saldoRestante)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-200">
                            {saldoRestante >= 0 ? 'Te quedará disponible para gastos' : 'Proyección de sobregiro'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 transition-colors duration-200">
                            Solo considera ingresos/gastos del mes actual
                        </p>

                        {/* Botón para ver detalle */}
                        <Button
                            onClick={() => setShowDetalleModal(true)}
                            variant="secondary"
                            size="sm"
                            className="mt-3"
                        >
                            Ver desglose detallado
                        </Button>

                        {/* Barra de progreso */}
                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200">
                                <span>Progreso del mes</span>
                                <span>{porcentajeGastado.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 transition-colors duration-200">
                                <div
                                    className={`h-3 rounded-full transition-colors duration-200 ${porcentajeGastado > 100 ? 'bg-red-600 dark:bg-red-500' :
                                            porcentajeGastado > 80 ? 'bg-yellow-600 dark:bg-yellow-500' : 'bg-green-600 dark:bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            💰 Saldo Real Actual
                            <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded-full transition-colors duration-200">
                                Presente
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <div className="text-center py-6">
                        <p className={`text-2xl font-bold transition-colors duration-200 ${saldoRealActual >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(saldoRealActual)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-200">
                            {saldoRealActual >= 0 ? 'Dinero disponible ahora mismo' : 'Saldo negativo actual'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 transition-colors duration-200">
                            Saldo de cuentas + movimientos confirmados
                        </p>

                        {/* Desglose del saldo real */}
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Saldo inicial cuentas:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{formatCurrency(totalCuentas)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600 dark:text-green-400 transition-colors duration-200">+ Ingresos confirmados:</span>
                                <span className="font-medium text-green-600 dark:text-green-400 transition-colors duration-200">+{formatCurrency(totalIngresos)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-red-600 dark:text-red-400 transition-colors duration-200">- Gastos confirmados:</span>
                                <span className="font-medium text-red-600 dark:text-red-400 transition-colors duration-200">-{formatCurrency(totalGastosFijos + totalGastosAdicionales)}</span>
                            </div>
                            <hr className="border-gray-200 dark:border-gray-600 transition-colors duration-200" />
                            <div className="flex justify-between text-sm font-semibold">
                                <span className="text-gray-900 dark:text-gray-100 transition-colors duration-200">Saldo real:</span>
                                <span className={`transition-colors duration-200 ${saldoRealActual >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(saldoRealActual)}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gráficos y análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Categorías de Gastos</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        {categoriasOrdenadas.map(([categoria, monto], index) => {
                            const porcentaje = (monto / (totalGastosFijos + totalGastosAdicionales)) * 100;
                            return (
                                <div key={categoria} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded text-center text-xs font-medium text-blue-600 dark:text-blue-300 flex items-center justify-center transition-colors duration-200">
                                            {index + 1}
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(categoria)}`}>
                                            {categoria}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">{formatCurrency(monto)}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{porcentaje.toFixed(1)}%</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Movimientos Recientes</CardTitle>
                    </CardHeader>
                    <div className="space-y-3">
                        {movimientosRecientes.length > 0 ? (
                            movimientosRecientes.map((movimiento) => (
                                <div key={`${movimiento.tipo}-${movimiento.id}`} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors duration-200">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${movimiento.tipo === 'ingreso' ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                                }`} />
                                            <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{movimiento.descripcion}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{formatDate(movimiento.fecha)}</span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoriaColor(movimiento.categoria)}`}>
                                                {movimiento.categoria}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`font-semibold transition-colors duration-200 ${movimiento.tipo === 'ingreso' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {movimiento.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(movimiento.monto)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8 transition-colors duration-200">
                                No hay movimientos recientes
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Resumen de cuentas */}
            <Card>
                <CardHeader>
                    <CardTitle>Estado de Cuentas</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {datosFinancieros.cuentas.map(cuenta => (
                        <div key={cuenta.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">{cuenta.nombre}</h4>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                {formatCurrency(typeof cuenta.saldo_inicial === 'string' ? parseFloat(cuenta.saldo_inicial) : cuenta.saldo_inicial)}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                                <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${(typeof cuenta.saldo_inicial === 'string' ? parseFloat(cuenta.saldo_inicial) : cuenta.saldo_inicial) > 0 ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
                                    }`} />
                                <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                                    {(typeof cuenta.saldo_inicial === 'string' ? parseFloat(cuenta.saldo_inicial) : cuenta.saldo_inicial) > 0 ? 'Disponible' : 'Sobregiro'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Modal de desglose del saldo restante */}
            <Modal 
                isOpen={showDetalleModal} 
                onClose={() => setShowDetalleModal(false)}
            >
                    <div className="max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Desglose del Saldo Restante del Mes
                            </h2>
                            <Button
                                onClick={() => setShowDetalleModal(false)}
                                variant="secondary"
                                size="sm"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Cerrar
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {/* Saldo inicial */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Saldo Base en Cuentas
                                </h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Total en cuentas</span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        +{formatCurrency(totalCuentas)}
                                    </span>
                                </div>
                            </div>

                            {/* Ingresos esperados del mes */}
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Ingresos Esperados del Mes
                                </h3>
                                <div className="space-y-1.5">
                                    {datosFinancieros.ingresos
                                        .filter(ing => ing.fecha.slice(0, 7) === (filtroMes || new Date().toISOString().slice(0, 7)))
                                        .map(ingreso => (
                                            <div key={ingreso.id} className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{ingreso.concepto}</span>
                                                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                                        ingreso.estado === 'PAGADO' 
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                    }`}>
                                                        {ingreso.estado === 'PAGADO' ? (
                                                            <CheckCircle className="w-3 h-3" />
                                                        ) : (
                                                            <Clock className="w-3 h-3" />
                                                        )}
                                                        {ingreso.estado}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                    +{formatCurrency(typeof ingreso.monto === 'string' ? parseFloat(ingreso.monto) : ingreso.monto)}
                                                </span>
                                            </div>
                                        ))}
                                    <div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2">
                                        <div className="flex justify-between items-center font-semibold">
                                            <span className="text-sm text-green-800 dark:text-green-200">Subtotal Ingresos:</span>
                                            <span className="text-sm text-green-600 dark:text-green-400">
                                                +{formatCurrency(totalIngresosDelMes)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

            {/* Todos los gastos del mes */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Gastos del Mes (Pagados y Pendientes)
                </h3>
                <div className="space-y-1.5">
                    {/* Gastos fijos del mes */}
                    {datosFinancieros.gastosFijos
                        .filter(gasto => gasto.fecha.slice(0, 7) === (filtroMes || new Date().toISOString().slice(0, 7)))
                        .map(gasto => (
                            <div key={`fijo-${gasto.id}`} className="flex justify-between items-center">
                                <div className="flex-1">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{gasto.concepto}</span>
                                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                        gasto.estado === 'PAGADO' 
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                            : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                                    }`}>
                                        {gasto.estado === 'PAGADO' ? (
                                            <CheckCircle className="w-3 h-3" />
                                        ) : (
                                            <Clock className="w-3 h-3" />
                                        )}
                                        {gasto.estado} - Fijo
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                    -{formatCurrency(typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto)}
                                </span>
                            </div>
                        ))}
                    

                    
                    {/* Gastos adicionales del mes */}
                    {datosFinancieros.gastosAdicionales
                        .filter(gasto => gasto.fecha.slice(0, 7) === (filtroMes || new Date().toISOString().slice(0, 7)))
                        .map(gasto => (
                            <div key={`adicional-${gasto.id}`} className="flex justify-between items-center">
                                <div className="flex-1">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{gasto.concepto}</span>
                                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                        gasto.estado === 'PAGADO' 
                                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                            : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                                    }`}>
                                        {gasto.estado === 'PAGADO' ? (
                                            <CheckCircle className="w-3 h-3" />
                                        ) : (
                                            <Clock className="w-3 h-3" />
                                        )}
                                        {gasto.estado} - Adicional
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                    -{formatCurrency(typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto)}
                                </span>
                            </div>
                        ))}
                    
                    <div className="border-t border-red-200 dark:border-red-700 pt-2 mt-2">
                        <div className="flex justify-between items-center font-semibold">
                            <span className="text-sm text-red-800 dark:text-red-200">Total Gastos del Mes:</span>
                            <span className="text-sm text-red-600 dark:text-red-400">
                                -{formatCurrency(totalGastosFijosDelMes + totalGastosAdicionalesDelMes)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

                            {/* Resultado final */}
                            <div className={`rounded-lg p-4 border-2 ${
                                saldoRestante >= 0 
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                            }`}>
                                <div className="text-center">
                                    <h3 className={`text-base font-bold mb-2 flex items-center justify-center gap-2 ${
                                        saldoRestante >= 0 
                                            ? 'text-green-800 dark:text-green-200' 
                                            : 'text-red-800 dark:text-red-200'
                                    }`}>
                                        <DollarSign className="w-5 h-5" />
                                        {filtroMes ? 'Saldo Acumulado Final' : 'Saldo Restante Final'}
                                    </h3>
                                    <p className={`text-2xl font-bold ${
                                        saldoRestante >= 0 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {formatCurrency(saldoRestante)}
                                    </p>
                                    <p className={`text-xs mt-2 ${
                                        saldoRestante >= 0 
                                            ? 'text-green-700 dark:text-green-300' 
                                            : 'text-red-700 dark:text-red-300'
                                    }`}>
                                        {filtroMes 
                                            ? (saldoRestante >= 0 
                                                ? 'Saldo acumulado positivo incluyendo meses anteriores' 
                                                : 'Déficit acumulado - considera ajustar gastos futuros')
                                            : (saldoRestante >= 0 
                                                ? 'Te quedará disponible para gastos adicionales' 
                                                : 'Proyección de déficit - revisa tus gastos')
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
        </div>
    );
}