import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input, MetricCard } from '../components/ui';
import { notifications } from '../utils/notifications';
import { DollarSign, Calculator, BarChart3, TrendingUp } from 'lucide-react';

interface GastoAdicional {
    id: number;
    usuario_id: number;
    concepto: string;
    descripcion: string; // Para compatibilidad con el frontend
    monto: number;
    fecha: string;
    estado: 'PENDIENTE' | 'PAGADO';
    categoria_id: number | null;
    categoria: string; // Para compatibilidad con el frontend
    categoria_nombre?: string;
    cuenta_id: number | null;
    cuenta_nombre?: string;
    notas?: string;
    creado_en: string;
    actualizado_en: string;
}

export default function GastosAdicionales() {
    const [gastosAdicionales, setGastosAdicionales] = useState<GastoAdicional[]>([]);
    const [cuentas, setCuentas] = useState<any[]>([]);
    const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState<GastoAdicional | null>(null);
    const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', es_fijo: false });
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7));
    const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
    const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'PENDIENTE' as 'PENDIENTE' | 'PAGADO',
        categoria: '',
        cuenta_id: '',
        notas: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        await loadCategorias(); // Cargar categorías primero
        await loadCuentas();
        await loadGastosAdicionales(); // Cargar gastos después para que tenga las categorías disponibles
        setLoading(false);
    };

    const loadGastosAdicionales = async () => {
        try {
            const response = await fetch('/api/v1/gastos-adicionales');
            const data = await response.json();
            // Convertir los datos de la BD al formato que espera el frontend
            const gastosFormateados = data.map((gasto: any) => ({
                ...gasto,
                descripcion: gasto.concepto, // Mapear concepto a descripcion
                monto: typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto, // Asegurar que monto sea número
                categoria: gasto.categoria_id, // Mapear categoria_id a categoria
                cuenta: gasto.cuenta_id, // Mapear cuenta_id a cuenta
                categoriaNombre: getCategoriaName(gasto.categoria_id),
                cuentaNombre: getCuentaName(gasto.cuenta_id)
            }));
            setGastosAdicionales(gastosFormateados);
        } catch (error) {
            console.error('Error al cargar gastos adicionales:', error);
            notifications.error('Error al cargar los gastos adicionales');
        }
    }; const loadCuentas = async () => {
        try {
            const response = await fetch('/api/v1/cuentas');
            const data = await response.json();
            setCuentas(data);
        } catch (error) {
            console.error('Error al cargar cuentas:', error);
            notifications.error('Error al cargar las cuentas');
        }
    }; const loadCategorias = async () => {
        try {
            const response = await fetch('/api/v1/categorias-gasto');
            const data = await response.json();
            setCategoriasDB(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            notifications.error('Error al cargar las categorías');
        }
    }; const handleCreateCategoria = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            notifications.loading('Creando categoría...');

            const categoriaData = {
                usuario_id: 1,
                nombre: nuevaCategoria.nombre,
                es_fijo: nuevaCategoria.es_fijo,
                activo: true
            };

            const response = await fetch('/api/v1/categorias-gasto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoriaData)
            });

            if (!response.ok) {
                throw new Error('Error al crear la categoría');
            }

            notifications.close();
            notifications.toast.success('Categoría creada correctamente');

            await loadCategorias();
            setIsCategoriaModalOpen(false);
            setNuevaCategoria({ nombre: '', es_fijo: false });
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al crear categoría');
        }
    };

    const formatCurrency = (amount: number | string) => {
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        if (isNaN(numericAmount)) return '0 Gs';

        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numericAmount) + ' Gs';
    };

    const formatDate = (date: string) => {
        // Tratar la fecha como local para evitar problemas de zona horaria
        const [year, month, day] = date.split('-');
        const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return localDate.toLocaleDateString('es-PY');
    };

    const getCategoriaName = (categoriaId: number) => {
        const categoria = categoriasDB.find(cat => cat.id === categoriaId);
        return categoria ? categoria.nombre : 'Sin categoría';
    };

    const getCuentaName = (cuentaId: number) => {
        const cuenta = cuentas.find(cuenta => cuenta.id === cuentaId);
        return cuenta ? cuenta.nombre : 'Sin cuenta';
    }; const getCategoriaColor = (categoria: string) => {
        const colors = {
            'Alimentación': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'Transporte': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            'Entretenimiento': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            'Salud': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            'Educación': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'Ropa': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
            'Hogar': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
            'Otros': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
        };
        return colors[categoria as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    };

    const gastosFilter = gastosAdicionales.filter(gasto => {
        const cumpleFiltroCategoria = !filtroCategoria || gasto.categoria_nombre === filtroCategoria;

        // Lógica de filtro de fechas: rango de fechas tiene prioridad sobre filtro de mes
        let cumpleFiltroFecha = true;
        if (filtroFechaDesde || filtroFechaHasta) {
            // Si hay rango de fechas, usar rango e ignorar filtro de mes
            const fechaGasto = new Date(gasto.fecha);
            if (filtroFechaDesde) {
                const fechaDesde = new Date(filtroFechaDesde);
                cumpleFiltroFecha = cumpleFiltroFecha && fechaGasto >= fechaDesde;
            }
            if (filtroFechaHasta) {
                const fechaHasta = new Date(filtroFechaHasta);
                cumpleFiltroFecha = cumpleFiltroFecha && fechaGasto <= fechaHasta;
            }
        } else {
            // Si no hay rango de fechas, usar filtro de mes
            cumpleFiltroFecha = !filtroMes || gasto.fecha.startsWith(filtroMes);
        }

        return cumpleFiltroCategoria && cumpleFiltroFecha;
    });

    // Calcular estadísticas - asegurar que trabajamos con números válidos
    const totalGastos = gastosFilter.reduce((sum, gasto) => {
        const monto = typeof gasto.monto === 'number' ? gasto.monto : parseFloat(gasto.monto) || 0;
        return sum + monto;
    }, 0);

    const promedioGasto = gastosFilter.length > 0 ? totalGastos / gastosFilter.length : 0;

    // Agrupar por categoría para el resumen - asegurar números válidos
    const gastosPorCategoria = gastosFilter.reduce((acc, gasto) => {
        const categoriaNombre = gasto.categoria_nombre || 'Sin categoría';
        const monto = typeof gasto.monto === 'number' ? gasto.monto : parseFloat(gasto.monto) || 0;
        acc[categoriaNombre] = (acc[categoriaNombre] || 0) + monto;
        return acc;
    }, {} as Record<string, number>);

    // Encontrar la categoría con mayor gasto - comparar números, no strings
    const categoriaConMayorGasto = Object.entries(gastosPorCategoria).reduce(
        (max, [categoria, monto]) => {
            const montoNumerico = typeof monto === 'number' ? monto : parseFloat(monto) || 0;
            return montoNumerico > max.monto ? { categoria, monto: montoNumerico } : max;
        },
        { categoria: '', monto: 0 }
    );

    const handleView = (gasto: GastoAdicional) => {
        setSelectedGasto(gasto);
        setIsViewModalOpen(true);
    };

    const handleEdit = (gasto: GastoAdicional) => {
        setSelectedGasto(gasto);
        setFormData({
            descripcion: gasto.concepto || gasto.descripcion, // Usar concepto de la BD o descripcion mapeada
            monto: gasto.monto.toString(),
            fecha: new Date().toISOString().split('T')[0], // Usar fecha de hoy
            estado: gasto.estado,
            categoria: gasto.categoria_id ? gasto.categoria_id.toString() : '',
            cuenta_id: gasto.cuenta_id ? gasto.cuenta_id.toString() : '',
            notas: gasto.notas || ''
        });
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedGasto(null);
        setFormData({
            descripcion: '',
            monto: '',
            fecha: new Date().toISOString().split('T')[0],
            estado: 'PENDIENTE' as 'PENDIENTE' | 'PAGADO',
            categoria: '',
            cuenta_id: '',
            notas: ''
        });
        setIsModalOpen(true);
    };

    const handleMarcarComoPagado = async (id: number) => {
        try {
            const response = await fetch(`/api/v1/gastos-adicionales/${id}/marcar-pagado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al marcar como pagado');
            }

            notifications.success('Gasto marcado como pagado correctamente');
            loadGastosAdicionales();
        } catch (error: any) {
            console.error('Error:', error);
            notifications.error(error.message || 'Error al marcar como pagado');
        }
    };

    const handleMarcarComoPendiente = async (id: number) => {
        try {
            const response = await fetch(`/api/v1/gastos-adicionales/${id}/marcar-pendiente`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al marcar como pendiente');
            }

            notifications.success('Gasto marcado como pendiente correctamente');
            loadGastosAdicionales();
        } catch (error: any) {
            console.error('Error:', error);
            notifications.error(error.message || 'Error al marcar como pendiente');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            notifications.loading(selectedGasto ? 'Actualizando gasto...' : 'Creando gasto...');

            const gastoData = {
                concepto: formData.descripcion,
                monto: formData.monto.toString(),
                fecha: formData.fecha,
                estado: formData.estado,
                categoria_id: formData.categoria ? parseInt(formData.categoria) : null,
                cuenta_id: formData.cuenta_id ? parseInt(formData.cuenta_id) : null,
                notas: formData.notas || null
            };

            // Solo agregar usuario_id para crear nuevos gastos
            if (!selectedGasto) {
                (gastoData as any).usuario_id = 1;
            }

            const url = selectedGasto
                ? `/api/v1/gastos-adicionales/${selectedGasto.id}`
                : '/api/v1/gastos-adicionales';

            const method = selectedGasto ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gastoData)
            });

            if (!response.ok) {
                throw new Error('Error al guardar el gasto adicional');
            }

            notifications.close();
            notifications.toast.success(
                selectedGasto ? 'Gasto actualizado correctamente' : 'Gasto creado correctamente'
            );

            await loadGastosAdicionales();
            setIsModalOpen(false);
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al guardar gasto');
        }
    };

    const handleDeleteGasto = async (gasto: GastoAdicional) => {
        const result = await notifications.confirmDelete(`el gasto "${gasto.descripcion}"`);

        if (result.isConfirmed) {
            try {
                notifications.loading('Eliminando gasto...');

                const response = await fetch(`/api/v1/gastos-adicionales/${gasto.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar el gasto');
                }

                notifications.close();
                notifications.toast.success('Gasto eliminado correctamente');
                await loadGastosAdicionales();
            } catch (err) {
                notifications.close();
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                notifications.error(errorMessage, 'Error al eliminar gasto');
            }
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                    Gastos Adicionales
                </h1>
            </div>

            {/* Filtros y Botón Nuevo */}
            <Card>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                Categoría
                            </label>
                            <select
                                value={filtroCategoria}
                                onChange={(e) => setFiltroCategoria(e.target.value)}
                                className="block w-40 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                            >
                                <option value="">Todas</option>
                                {categoriasDB.map(categoria => (
                                    <option key={categoria.id} value={categoria.nombre}>{categoria.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                Mes
                            </label>
                            <input
                                type="month"
                                value={filtroMes}
                                onChange={(e) => {
                                    setFiltroMes(e.target.value);
                                    // Limpiar rango de fechas si se selecciona mes
                                    if (e.target.value) {
                                        setFiltroFechaDesde('');
                                        setFiltroFechaHasta('');
                                    }
                                }}
                                disabled={!!(filtroFechaDesde || filtroFechaHasta)}
                                className="block w-40 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                    Desde
                                </label>
                                <input
                                    type="date"
                                    value={filtroFechaDesde}
                                    onChange={(e) => {
                                        setFiltroFechaDesde(e.target.value);
                                        // Limpiar filtro de mes si se selecciona rango
                                        if (e.target.value) {
                                            setFiltroMes('');
                                        }
                                    }}
                                    className="block w-36 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                    Hasta
                                </label>
                                <input
                                    type="date"
                                    value={filtroFechaHasta}
                                    onChange={(e) => {
                                        setFiltroFechaHasta(e.target.value);
                                        // Limpiar filtro de mes si se selecciona rango
                                        if (e.target.value) {
                                            setFiltroMes('');
                                        }
                                    }}
                                    className="block w-36 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                />
                            </div>
                        </div>

                        {(filtroFechaDesde || filtroFechaHasta || filtroCategoria || filtroMes) && (
                            <div className="flex items-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFiltroCategoria('');
                                        setFiltroMes(new Date().toISOString().slice(0, 7));
                                        setFiltroFechaDesde('');
                                        setFiltroFechaHasta('');
                                    }}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0">
                        <Button onClick={handleNew}>
                            Nuevo Gasto
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                    title="Total Gastado"
                    value={formatCurrency(totalGastos)}
                    icon={<DollarSign className="w-5 h-5" />}
                    iconColor="red"
                />
                <MetricCard
                    title="Promedio por Gasto"
                    value={formatCurrency(promedioGasto)}
                    icon={<Calculator className="w-5 h-5" />}
                    iconColor="blue"
                />
                <MetricCard
                    title="Total Registros"
                    value={gastosFilter.length.toString()}
                    icon={<BarChart3 className="w-5 h-5" />}
                    iconColor="purple"
                />
                <MetricCard
                    title="Mayor Categoría"
                    value={categoriaConMayorGasto.categoria || 'N/A'}
                    subtitle={formatCurrency(categoriaConMayorGasto.monto)}
                    icon={<TrendingUp className="w-5 h-5" />}
                    iconColor="green"
                />
            </div>

            {/* Resumen por Categorías */}
            {Object.keys(gastosPorCategoria).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución por Categorías</CardTitle>
                    </CardHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(gastosPorCategoria)
                            .sort(([, a], [, b]) => b - a)
                            .map(([categoria, monto]) => (
                                <div key={categoria} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(categoria)} mb-2`}>
                                        {categoria}
                                    </span>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">{formatCurrency(monto)}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                                        {totalGastos > 0 ? (((monto / totalGastos) * 100).toFixed(1)) : '0.0'}%
                                    </p>
                                </div>
                            ))}
                    </div>
                </Card>
            )}

            {/* Lista de Gastos */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Gastos</CardTitle>
                </CardHeader>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Cuenta</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    Cargando gastos adicionales...
                                </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                            </TableRow>
                        ) : gastosFilter.length === 0 ? (
                            <TableRow>
                                <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No tienes gastos adicionales registrados. ¡Agrega tu primer gasto!
                                </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                            </TableRow>
                        ) : (
                            gastosFilter
                                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                                .map((gasto) => (
                                    <TableRow key={gasto.id}>
                                        <TableCell className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{formatDate(gasto.fecha)}</TableCell>
                                        <TableCell className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{gasto.descripcion}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(gasto.categoria)}`}>
                                                {gasto.categoria_nombre}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-semibold text-red-600 dark:text-red-400 transition-colors duration-200">{formatCurrency(gasto.monto)}</TableCell>
                                        <TableCell className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{gasto.cuenta_nombre}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                gasto.estado === 'PAGADO' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                                {gasto.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleView(gasto)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    title="Ver detalles"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(gasto)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Button>
                                                {gasto.estado === 'PENDIENTE' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarcarComoPagado(gasto.id)}
                                                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        title="Marcar como pagado"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarcarComoPendiente(gasto.id)}
                                                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                                        title="Marcar como pendiente"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteGasto(gasto)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedGasto ? 'Editar Gasto' : 'Nuevo Gasto'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <Input
                                label="Descripción"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Ej. Cena Restaurante"
                                required
                            />
                        </div>
                        <Input
                            label="Monto"
                            type="number"
                            value={formData.monto}
                            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                            placeholder="0"
                            required
                        />
                    </div>

                    <Input
                        label="Fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-1 h-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                    Categoría
                                </label>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsCategoriaModalOpen(true)}
                                    className="text-xs px-2 py-1 border-primary-300 text-primary-600 hover:bg-primary-50 dark:border-primary-600 dark:text-primary-400 dark:hover:bg-primary-900/20"
                                >
                                    + Nueva
                                </Button>
                            </div>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                                required
                            >
                                <option value="">Seleccionar categoría</option>
                                {categoriasDB.map(categoria => (
                                    <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1 h-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                    Cuenta de pago
                                </label>
                            </div>
                            <select
                                value={formData.cuenta_id}
                                onChange={(e) => setFormData({ ...formData, cuenta_id: e.target.value })}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                                required
                            >
                                <option value="">Seleccionar cuenta</option>
                                {cuentas.map(cuenta => (
                                    <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                            Estado
                        </label>
                        <select
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'PENDIENTE' | 'PAGADO' })}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            required
                        >
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="PAGADO">Pagado</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                            Notas (opcional)
                        </label>
                        <textarea
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            rows={3}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            placeholder="Notas adicionales sobre el gasto..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {selectedGasto ? 'Actualizar' : 'Crear'} Gasto
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Nueva Categoría */}
            <Modal
                isOpen={isCategoriaModalOpen}
                onClose={() => setIsCategoriaModalOpen(false)}
                title="Nueva Categoría"
                size="sm"
            >
                <form onSubmit={handleCreateCategoria} className="space-y-4">
                    <Input
                        label="Nombre de la categoría"
                        value={nuevaCategoria.nombre}
                        onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })}
                        placeholder="Ej. Mascotas, Viajes, etc."
                        required
                    />

                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={nuevaCategoria.es_fijo}
                                onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, es_fijo: e.target.checked })}
                                className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Es gasto fijo (se repite mensualmente)
                            </span>
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsCategoriaModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Crear Categoría
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Ver Detalles */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles del Gasto"
                size="md"
            >
                {selectedGasto && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Fecha
                                </label>
                                <p className="text-lg text-gray-900 dark:text-white">
                                    {formatDate(selectedGasto.fecha)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Monto
                                </label>
                                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                                    {formatCurrency(selectedGasto.monto)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Estado
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedGasto.estado === 'PAGADO' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                }`}>
                                    {selectedGasto.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Concepto
                            </label>
                            <p className="text-lg text-gray-900 dark:text-white">
                                {selectedGasto.descripcion || selectedGasto.concepto}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Categoría
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoriaColor(selectedGasto.categoria)}`}>
                                    {selectedGasto.categoria_nombre}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Cuenta de pago
                                </label>
                                <p className="text-lg text-gray-900 dark:text-white">
                                    {selectedGasto.cuenta_nombre}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Notas
                            </label>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-h-[60px] transition-colors duration-200">
                                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                    {selectedGasto.notas || 'Sin notas adicionales'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEdit(selectedGasto);
                                }}
                            >
                                Editar
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsViewModalOpen(false)}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}