import { Card, CardHeader, CardTitle } from '../components/ui';

// Datos simulados (normalmente vendrían del backend)
const datosFinancieros = {
    cuentas: [
        { id: 1, nombre: 'Cuenta Corriente Principal', saldo: 45750 },
        { id: 2, nombre: 'Cuenta de Ahorros', saldo: 125300 },
        { id: 3, nombre: 'Billetera Efectivo', saldo: 15500 }
    ],
    ingresos: [
        { id: 1, descripcion: 'Sueldo Octubre', monto: 850000, fecha: '2024-10-01', categoria: 'Salario' },
        { id: 2, descripcion: 'Freelance Proyecto', monto: 150000, fecha: '2024-10-15', categoria: 'Freelance' },
        { id: 3, descripcion: 'Dividendos', monto: 25000, fecha: '2024-10-20', categoria: 'Inversiones' }
    ],
    gastosFijos: [
        { id: 1, descripcion: 'Arriendo', monto: 420000, categoria: 'Vivienda' },
        { id: 2, descripcion: 'Internet', monto: 35000, categoria: 'Servicios' },
        { id: 3, descripcion: 'Móvil', monto: 18000, categoria: 'Servicios' },
        { id: 4, descripcion: 'Seguro Auto', monto: 45000, categoria: 'Seguros' }
    ],
    gastosAdicionales: [
        { id: 1, descripcion: 'Supermercado', monto: 85000, fecha: '2024-10-18', categoria: 'Alimentación' },
        { id: 2, descripcion: 'Combustible', monto: 45000, fecha: '2024-10-20', categoria: 'Transporte' },
        { id: 3, descripcion: 'Cena Restaurante', monto: 35000, fecha: '2024-10-22', categoria: 'Entretenimiento' }
    ],
    tarjetas: [
        { id: 1, nombre: 'Visa Platinum', limite: 800000, consumos: 285000 },
        { id: 2, nombre: 'Mastercard Gold', limite: 600000, consumos: 145000 }
    ]
};

export default function Dashboard() {    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-CL');
    };

  // Cálculos financieros
  const totalIngresos = datosFinancieros.ingresos.reduce((sum, ing) => sum + ing.monto, 0);
  const totalGastosFijos = datosFinancieros.gastosFijos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const totalGastosAdicionales = datosFinancieros.gastosAdicionales.reduce((sum, gasto) => sum + gasto.monto, 0);
  const totalCuentas = datosFinancieros.cuentas.reduce((sum, cuenta) => sum + cuenta.saldo, 0);    const saldoRestante = totalIngresos - totalGastosFijos - totalGastosAdicionales;
    const porcentajeGastado = totalIngresos > 0 ? ((totalGastosFijos + totalGastosAdicionales) / totalIngresos) * 100 : 0;

    // Distribución de gastos por categoría
    const gastosPorCategoria = [...datosFinancieros.gastosFijos, ...datosFinancieros.gastosAdicionales]
        .reduce((acc, gasto) => {
            acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
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
            fecha: ing.fecha
        })),
        ...datosFinancieros.gastosAdicionales.map(gasto => ({
            ...gasto,
            tipo: 'gasto' as const,
            fecha: gasto.fecha
        }))
    ]
        .filter(mov => new Date(mov.fecha) >= fechaLimite)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5);

    const getCategoriaColor = (categoria: string) => {
        const colors = {
            'Salario': 'bg-green-100 text-green-800',
            'Freelance': 'bg-blue-100 text-blue-800',
            'Inversiones': 'bg-purple-100 text-purple-800',
            'Vivienda': 'bg-red-100 text-red-800',
            'Servicios': 'bg-blue-100 text-blue-800',
            'Seguros': 'bg-purple-100 text-purple-800',
            'Alimentación': 'bg-green-100 text-green-800',
            'Transporte': 'bg-indigo-100 text-indigo-800',
            'Entretenimiento': 'bg-pink-100 text-pink-800'
        };
        return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Financiero</h1>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* Alerta de saldo */}
            {porcentajeGastado > 80 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Atención: Has gastado {porcentajeGastado.toFixed(1)}% de tus ingresos
                            </h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                Te quedan {formatCurrency(saldoRestante)} disponibles este mes.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resumen de totales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            <p className="text-sm font-medium text-gray-500">Ingresos</p>
                            <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalIngresos)}</p>
                            <p className="text-xs text-gray-500">{datosFinancieros.ingresos.length} registros</p>
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
                            <p className="text-sm font-medium text-gray-500">Gastos Fijos</p>
                            <p className="text-2xl font-semibold text-red-600">{formatCurrency(totalGastosFijos)}</p>
                            <p className="text-xs text-gray-500">{datosFinancieros.gastosFijos.length} conceptos</p>
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
                            <p className="text-sm font-medium text-gray-500">Gastos Variables</p>
                            <p className="text-2xl font-semibold text-orange-600">{formatCurrency(totalGastosAdicionales)}</p>
                            <p className="text-xs text-gray-500">{datosFinancieros.gastosAdicionales.length} registros</p>
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
                            <p className="text-sm font-medium text-gray-500">Saldo Cuentas</p>
                            <p className="text-2xl font-semibold text-purple-600">{formatCurrency(totalCuentas)}</p>
                            <p className="text-xs text-gray-500">{datosFinancieros.cuentas.length} cuentas</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Saldo restante y progreso */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Saldo Restante del Mes</CardTitle>
                    </CardHeader>
                    <div className="text-center py-6">
                        <p className={`text-4xl font-bold ${saldoRestante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(saldoRestante)}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {saldoRestante >= 0 ? 'Disponible para gastos' : 'Sobregiro del presupuesto'}
                        </p>

                        {/* Barra de progreso */}
                        <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Gastado</span>
                                <span>{porcentajeGastado.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${porcentajeGastado > 100 ? 'bg-red-600' :
                                            porcentajeGastado > 80 ? 'bg-yellow-600' : 'bg-green-600'
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
                        {datosFinancieros.tarjetas.map(tarjeta => {
                            const utilizacion = (tarjeta.consumos / tarjeta.limite) * 100;
                            return (
                                <div key={tarjeta.id} className="border-b pb-3 last:border-b-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-900">{tarjeta.nombre}</span>
                                        <span className="text-sm text-gray-500">
                                            {formatCurrency(tarjeta.consumos)} / {formatCurrency(tarjeta.limite)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${utilizacion > 80 ? 'bg-red-600' :
                                                        utilizacion > 60 ? 'bg-yellow-600' : 'bg-green-600'
                                                    }`}
                                                style={{ width: `${Math.min(utilizacion, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">
                                            {utilizacion.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Gráficos y análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                        <div className="w-6 h-6 bg-blue-100 rounded text-center text-xs font-medium text-blue-600 flex items-center justify-center">
                                            {index + 1}
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(categoria)}`}>
                                            {categoria}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-900">{formatCurrency(monto)}</div>
                                        <div className="text-sm text-gray-500">{porcentaje.toFixed(1)}%</div>
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
                                <div key={`${movimiento.tipo}-${movimiento.id}`} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${movimiento.tipo === 'ingreso' ? 'bg-green-500' : 'bg-red-500'
                                                }`} />
                                            <span className="font-medium text-gray-900">{movimiento.descripcion}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs text-gray-500">{formatDate(movimiento.fecha)}</span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoriaColor(movimiento.categoria)}`}>
                                                {movimiento.categoria}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`font-semibold ${movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {movimiento.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(movimiento.monto)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {datosFinancieros.cuentas.map(cuenta => (
                        <div key={cuenta.id} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{cuenta.nombre}</h4>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(cuenta.saldo)}</p>
                            <div className="mt-2 flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${cuenta.saldo > 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                <span className="text-sm text-gray-500">
                                    {cuenta.saldo > 0 ? 'Disponible' : 'Sobregiro'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}