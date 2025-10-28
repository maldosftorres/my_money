import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input } from '../components/ui';
import { notifications } from '../utils/notifications';

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
    dia_mes?: number;
    frecuencia_meses?: number;
    es_recurrente?: boolean;
    ingreso_padre_id?: number;
    fecha_cobro?: string;
}

export default function Ingresos() {
    const [ingresos, setIngresos] = useState<Ingreso[]>([]);
    const [cuentas, setCuentas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedIngreso, setSelectedIngreso] = useState<Ingreso | null>(null);
    const [filtroEstado, setFiltroEstado] = useState<string>('');
    const [filtroCuenta, setFiltroCuenta] = useState<string>('');
    const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7)); // Mes actual YYYY-MM
    const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
    const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        cuenta_id: '',
        estado: 'PENDIENTE' as 'PENDIENTE' | 'PAGADO',
        notas: '',
        es_recurrente: false,
        dia_mes: '',
        frecuencia_meses: '1'
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!loading) {
            loadIngresos();
        }
    }, [filtroMes, filtroEstado, filtroCuenta, filtroFechaDesde, filtroFechaHasta]);

    const loadInitialData = async () => {
        setLoading(true);
        await loadCuentas();
        await loadIngresos();
        setLoading(false);
    };

    const loadIngresos = async () => {
        try {
            const params = new URLSearchParams({ usuarioId: '1' });
            
            // Agregar filtros si están presentes
            if (filtroMes) params.append('mes', filtroMes);
            if (filtroEstado) params.append('estado', filtroEstado);
            if (filtroCuenta) params.append('cuentaId', filtroCuenta);
            if (filtroFechaDesde) params.append('fechaDesde', filtroFechaDesde);
            if (filtroFechaHasta) params.append('fechaHasta', filtroFechaHasta);

            const response = await fetch(`/api/v1/ingresos?${params.toString()}`);
            const data = await response.json();
            // Convertir los datos de la BD al formato que espera el frontend
            const ingresosFormateados = data.map((ingreso: any) => ({
                ...ingreso,
                descripcion: ingreso.concepto, // Mapear concepto a descripcion
                monto: typeof ingreso.monto === 'string' ? parseFloat(ingreso.monto) : ingreso.monto,
                // Convertir fecha ISO a formato local para evitar problemas de zona horaria
                fecha: ingreso.fecha ? ingreso.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
            }));
            setIngresos(ingresosFormateados);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
            notifications.error('Error al cargar los ingresos');
        }
    };

    const loadCuentas = async () => {
        try {
            const response = await fetch('/api/v1/cuentas');
            const data = await response.json();
            setCuentas(data);
        } catch (error) {
            console.error('Error al cargar cuentas:', error);
            notifications.error('Error al cargar las cuentas');
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
        if (!date) return 'No definido';
        // Tratar la fecha como local para evitar problemas de zona horaria
        const [year, month, day] = date.split('-');
        const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return localDate.toLocaleDateString('es-PY');
    };

    const getEstadoColor = (estado: string) => {
        const colors = {
            'PENDIENTE': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'PAGADO': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
        };
        return colors[estado as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    };

    const getEstadoText = (estado: string) => {
        const texts = {
            'PENDIENTE': 'Pendiente',
            'PAGADO': 'Pagado'
        };
        return texts[estado as keyof typeof texts] || estado;
    };

    // Los datos ya vienen filtrados del backend
    const ingresosFiltrados = ingresos;

    const totalIngresos = ingresos.reduce((sum, ingreso) => {
        // Solo contar ingresos PAGADOS para el total real
        if (ingreso.estado === 'PAGADO') {
            const monto = typeof ingreso.monto === 'number' ? ingreso.monto : parseFloat(ingreso.monto) || 0;
            return sum + monto;
        }
        return sum;
    }, 0);
    
    const ingresosPendientes = ingresosFiltrados.filter(i => i.estado === 'PENDIENTE').length;
    const ingresosPagados = ingresosFiltrados.filter(i => i.estado === 'PAGADO').length;

    const handleView = (ingreso: Ingreso) => {
        setSelectedIngreso(ingreso);
        setIsViewModalOpen(true);
    };

    const handleEdit = (ingreso: Ingreso) => {
        setSelectedIngreso(ingreso);
        setFormData({
            descripcion: ingreso.concepto || ingreso.descripcion,
            monto: ingreso.monto.toString(),
            fecha: ingreso.fecha,
            cuenta_id: ingreso.cuenta_id ? ingreso.cuenta_id.toString() : '',
            estado: ingreso.estado,
            notas: ingreso.notas || '',
            es_recurrente: ingreso.es_recurrente || false,
            dia_mes: ingreso.dia_mes ? ingreso.dia_mes.toString() : '',
            frecuencia_meses: ingreso.frecuencia_meses ? ingreso.frecuencia_meses.toString() : '1'
        });
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedIngreso(null);
        setFormData({
            descripcion: '',
            monto: '',
            fecha: new Date().toISOString().split('T')[0],
            cuenta_id: '',
            estado: 'PENDIENTE',
            notas: '',
            es_recurrente: false,
            dia_mes: '',
            frecuencia_meses: '1'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            notifications.loading(selectedIngreso ? 'Actualizando ingreso...' : 'Creando ingreso...');
            
            const ingresoData = {
                concepto: formData.descripcion,
                monto: formData.monto.toString(),
                fecha: formData.fecha,
                cuenta_id: formData.cuenta_id ? parseInt(formData.cuenta_id) : null,
                estado: formData.estado,
                notas: formData.notas || null,
                es_recurrente: formData.es_recurrente,
                dia_mes: formData.es_recurrente && formData.dia_mes ? parseInt(formData.dia_mes) : null,
                frecuencia_meses: formData.es_recurrente ? parseInt(formData.frecuencia_meses) : null
            };

            // Solo agregar usuario_id para crear nuevos ingresos
            if (!selectedIngreso) {
                (ingresoData as any).usuario_id = 1;
            }

            const url = selectedIngreso 
                ? `/api/v1/ingresos/${selectedIngreso.id}`
                : '/api/v1/ingresos';
            
            const method = selectedIngreso ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ingresoData)
            });

            if (!response.ok) {
                throw new Error('Error al guardar el ingreso');
            }

            notifications.close();
            notifications.toast.success(
                selectedIngreso ? 'Ingreso actualizado correctamente' : 'Ingreso creado correctamente'
            );
            
            await loadIngresos();
            setIsModalOpen(false);
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al guardar ingreso');
        }
    };

    const handleDeleteIngreso = async (ingreso: Ingreso) => {
        const result = await notifications.confirmDelete(`el ingreso "${ingreso.descripcion}"`);
        
        if (result.isConfirmed) {
            try {
                notifications.loading('Eliminando ingreso...');
                
                const response = await fetch(`/api/v1/ingresos/${ingreso.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
                    throw new Error(errorMessage);
                }

                notifications.close();
                notifications.toast.success('Ingreso eliminado correctamente');
                await loadIngresos();
            } catch (err) {
                notifications.close();
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                notifications.error(errorMessage, 'Error al eliminar ingreso');
            }
        }
    };

    const handleDeleteRecurrentes = async (ingreso: Ingreso) => {
        const tipoIngreso = ingreso.es_recurrente && !ingreso.ingreso_padre_id ? 'padre' : 'hijo';
        const mensaje = tipoIngreso === 'padre' 
            ? `todos los ingresos recurrentes de "${ingreso.descripcion}" (incluyendo los meses futuros pendientes)`
            : `toda la serie recurrente relacionada con "${ingreso.descripcion}"`;
            
        const result = await notifications.confirm(
            `¿Estás seguro de que deseas eliminar ${mensaje}?`,
            'Eliminar Serie Recurrente',
            'Sí, eliminar todos',
            'Cancelar'
        );
        
        if (result.isConfirmed) {
            try {
                notifications.loading('Eliminando ingresos recurrentes...');
                
                const response = await fetch(`/api/v1/ingresos/${ingreso.id}/recurrentes`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                notifications.close();
                notifications.toast.success(data.message || 'Ingresos recurrentes eliminados correctamente');
                await loadIngresos();
            } catch (err) {
                notifications.close();
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                notifications.error(errorMessage, 'Error al eliminar ingresos recurrentes');
            }
        }
    };

    const handleMarcarPagado = async (ingreso: Ingreso, fechaCobro?: string) => {
        try {
            notifications.loading('Marcando como pagado...');
            
            const body = fechaCobro ? { fechaCobro } : {};
            
            const response = await fetch(`/api/v1/ingresos/${ingreso.id}/pagar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error('Error al marcar como pagado');
            }

            notifications.close();
            notifications.toast.success('Ingreso marcado como pagado correctamente');
            await loadIngresos();
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al marcar como pagado');
        }
    };

    const handleQuickPay = async (ingreso: Ingreso) => {
        const result = await notifications.inputDate({
            title: 'Marcar como Pagado',
            text: `¿Cuándo se cobró "${ingreso.descripcion}"?`,
            inputLabel: 'Fecha de cobro',
            inputValue: new Date().toISOString().split('T')[0],
            confirmButtonText: 'Marcar como Pagado',
            showCancelButton: true
        });

        if (result.isConfirmed && result.value) {
            await handleMarcarPagado(ingreso, result.value);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                    Ingresos
                </h1>
            </div>

            {/* Filtros y Botón Nuevo */}
            <Card>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                Estado
                            </label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="block w-40 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                            >
                                <option value="">Todos</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="PAGADO">Pagado</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                Cuenta
                            </label>
                            <select
                                value={filtroCuenta}
                                onChange={(e) => setFiltroCuenta(e.target.value)}
                                className="block w-40 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                            >
                                <option value="">Todas</option>
                                {cuentas.map(cuenta => (
                                    <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
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

                        {(filtroFechaDesde || filtroFechaHasta || filtroEstado || filtroCuenta || filtroMes) && (
                            <div className="flex items-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFiltroEstado('');
                                        setFiltroCuenta('');
                                        setFiltroMes('');
                                        setFiltroFechaDesde('');
                                        setFiltroFechaHasta('');
                                    }}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Limpiar filtros
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex-shrink-0">
                        <Button onClick={handleNew}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Ingreso
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Total Cobrado</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{formatCurrency(totalIngresos)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Pendientes</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{ingresosPendientes}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200">Pagados</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">{ingresosPagados}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Lista de Ingresos */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Ingresos</CardTitle>
                </CardHeader>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Cuenta</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    Cargando ingresos...
                                </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                            </TableRow>
                        ) : ingresosFiltrados.length === 0 ? (
                            <TableRow>
                                <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No tienes ingresos registrados. ¡Agrega tu primer ingreso!
                                </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                            </TableRow>
                        ) : (
                            ingresosFiltrados.map((ingreso) => (
                                <TableRow key={ingreso.id}>
                                    <TableCell className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{ingreso.descripcion}</TableCell>
                                    <TableCell>{formatDate(ingreso.fecha)}</TableCell>
                                    <TableCell className="font-semibold text-green-600 dark:text-green-400 transition-colors duration-200">{formatCurrency(ingreso.monto)}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(ingreso.estado)}`}>
                                            {getEstadoText(ingreso.estado)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{ingreso.cuenta_nombre}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleView(ingreso)}
                                                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                title="Ver detalles"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Button>
                                            {ingreso.estado === 'PENDIENTE' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleQuickPay(ingreso)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                    title="Marcar como pagado"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(ingreso)}
                                                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                title="Editar"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Button>
                                            {/* Botón especial para eliminar recurrentes - Solo en el ingreso original */}
                                            {(ingreso.es_recurrente && !ingreso.ingreso_padre_id) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteRecurrentes(ingreso)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                                    title="Eliminar toda la serie recurrente"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </Button>
                                            )}
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteIngreso(ingreso)}
                                                className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Eliminar solo este ingreso"
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
                title={selectedIngreso ? 'Editar Ingreso' : 'Nuevo Ingreso'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Descripción"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Ej. Sueldo Octubre"
                        required
                    />

                    <Input
                        label="Monto"
                        type="number"
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                        placeholder="0"
                        required
                    />

                    <Input
                        label="Fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                            Cuenta destino
                        </label>
                        <select
                            value={formData.cuenta_id}
                            onChange={(e) => setFormData({ ...formData, cuenta_id: e.target.value })}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                            required
                        >
                            <option value="">Seleccionar cuenta</option>
                            {cuentas.map(cuenta => (
                                <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                            Estado
                        </label>
                        <select
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'PENDIENTE' | 'PAGADO' })}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                            required
                        >
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="PAGADO">Pagado</option>
                        </select>
                    </div>

                    {/* Sección de Ingresos Recurrentes */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="es_recurrente"
                                checked={formData.es_recurrente}
                                onChange={(e) => setFormData({ ...formData, es_recurrente: e.target.checked })}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 transition-colors duration-200"
                            />
                            <label htmlFor="es_recurrente" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                💰 Ingreso recurrente (se repite automáticamente)
                            </label>
                        </div>

                        {formData.es_recurrente && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 border-l-2 border-primary-200 dark:border-primary-600">
                                <Input
                                    label="Día del mes"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={formData.dia_mes}
                                    onChange={(e) => setFormData({ ...formData, dia_mes: e.target.value })}
                                    placeholder="15"
                                    helperText="Día en que se recibe (1-31)"
                                    required={formData.es_recurrente}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                        Frecuencia
                                    </label>
                                    <select
                                        value={formData.frecuencia_meses}
                                        onChange={(e) => setFormData({ ...formData, frecuencia_meses: e.target.value })}
                                        className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                        required={formData.es_recurrente}
                                    >
                                        <option value="1">Mensual (cada mes)</option>
                                        <option value="2">Bimestral (cada 2 meses)</option>
                                        <option value="3">Trimestral (cada 3 meses)</option>
                                        <option value="6">Semestral (cada 6 meses)</option>
                                        <option value="12">Anual (cada año)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {formData.es_recurrente && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>ℹ️ Información:</strong> Se generarán automáticamente los próximos 12 meses con estado "PENDIENTE". 
                                    Podrás marcarlos como pagados cuando recibas cada pago.
                                </p>
                            </div>
                        )}
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
                            placeholder="Notas adicionales sobre el ingreso..."
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
                            {selectedIngreso ? 'Actualizar' : 'Crear'} Ingreso
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Ver Detalles */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles del Ingreso"
                size="md"
            >
                {selectedIngreso && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Descripción
                                </label>
                                <p className="text-lg text-gray-900 dark:text-white">
                                    {selectedIngreso.descripcion || selectedIngreso.concepto}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Monto
                                </label>
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                    {formatCurrency(selectedIngreso.monto)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Fecha
                                </label>
                                <p className="text-lg text-gray-900 dark:text-white">
                                    {formatDate(selectedIngreso.fecha)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Estado
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(selectedIngreso.estado)}`}>
                                    {getEstadoText(selectedIngreso.estado)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Cuenta de destino
                            </label>
                            <p className="text-lg text-gray-900 dark:text-white">
                                {selectedIngreso.cuenta_nombre || 'Sin cuenta'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Notas
                            </label>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-h-[60px] transition-colors duration-200">
                                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                    {selectedIngreso.notas || 'Sin notas adicionales'}
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <p>Creado: {formatDate(selectedIngreso.creado_en)}</p>
                            <p>Actualizado: {formatDate(selectedIngreso.actualizado_en)}</p>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEdit(selectedIngreso);
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