import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui';
import { notifications } from '../utils/notifications';

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
    
    const saldoRestante = totalIngresos - totalGastosFijos - totalGastosAdicionales;
    const porcentajeGastado = totalIngresos > 0 ? ((totalGastosFijos + totalGastosAdicionales) / totalIngresos) * 100 : 0;

    // Distribución de gastos por categoría con datos reales - Solo PAGADOS
    const gastosPorCategoria = [...datosFinancieros.gastosFijos, ...datosFinancieros.gastosAdicionales]
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

    // Movimientos recientes (últimos 7 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);

    const movimientosRecientes = [
        ...datosFinancieros.ingresos.map(ing => ({
            ...ing,
            tipo: 'ingreso' as const,
            fecha: ing.fecha,
            categoria: 'Ingreso',
            monto: typeof ing.monto === 'string' ? parseFloat(ing.monto) : ing.monto
        })),
        ...datosFinancieros.gastosAdicionales.map(gasto => ({
            ...gasto,
            tipo: 'gasto' as const,
            fecha: gasto.fecha,
            categoria: gasto.categoria_nombre || 'Sin categoría',
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
            'Entretenimiento': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
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
                            className=" border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                        />
                        <button
                            onClick={() => {
                                setFiltroMes('');
                                loadAllData();
                            }}
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                        >
                            Limpiar filtro
                        </button>
                        <button
                            onClick={loadAllData}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            Actualizar
                        </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Ingresos</p>
                            <p className="text-xl font-semibold text-green-600 dark:text-green-400 transition-colors duration-200">{formatCurrency(totalIngresos)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{datosFinancieros.ingresos.length} registros</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Gastos Fijos</p>
                            <p className="text-xl font-semibold text-red-600 dark:text-red-400 transition-colors duration-200">{formatCurrency(totalGastosFijos)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{datosFinancieros.gastosFijos.length} conceptos</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Gastos Variables</p>
                            <p className="text-xl font-semibold text-orange-600 dark:text-orange-400 transition-colors duration-200">{formatCurrency(totalGastosAdicionales)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{datosFinancieros.gastosAdicionales.length} registros</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Saldo Cuentas</p>
                            <p className="text-xl font-semibold text-purple-600 dark:text-purple-400 transition-colors duration-200">{formatCurrency(totalCuentas)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{datosFinancieros.cuentas.length} cuentas</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Saldo restante y progreso */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Saldo Restante del Mes</CardTitle>
                    </CardHeader>
                    <div className="text-center py-6">
                        <p className={`text-2xl font-bold transition-colors duration-200 ${saldoRestante >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(saldoRestante)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-200">
                            {saldoRestante >= 0 ? 'Disponible para gastos' : 'Sobregiro del presupuesto'}
                        </p>

                        {/* Barra de progreso */}
                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200">
                                <span>Gastado</span>
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
                        <CardTitle>Estado de Tarjetas</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4 transition-colors duration-200">
                            Módulo de tarjetas en desarrollo
                        </p>
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
        </div>
    );
}