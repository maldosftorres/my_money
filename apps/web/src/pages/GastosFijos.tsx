import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input, MetricCard, InfoIcon } from '../components/ui';
import { notifications } from '../utils/notifications';
import { DollarSign, FileText, AlertTriangle } from 'lucide-react';

interface GastoFijo {
    id: number;
    usuario_id: number;
    concepto: string;
    descripcion: string; // Para compatibilidad con el frontend
    monto: number;
    dia_mes: number;
    dia_del_mes: number; // Para compatibilidad con el frontend
    categoria_id: number | null;
    categoria: string; // Para compatibilidad con el frontend
    categoria_nombre?: string;
    cuenta_id: number | null;
    cuenta_nombre?: string;
    activo: boolean;
    notas?: string;
    proximo_pago?: string;
    ultimo_pago?: string;
    frecuencia_meses: number;
    es_recurrente?: boolean;
    duracion_meses?: number;
    gasto_padre_id?: number;
    fecha_pago?: string;
    estado?: 'PENDIENTE' | 'PAGADO';
    creado_en: string;
    actualizado_en: string;
    // Campos específicos para préstamos
    es_prestamo?: boolean;
    total_cuotas?: number;
    cuota_actual?: number;
    descripcion_prestamo?: string;
    // Campos específicos para ahorros
    es_ahorro?: boolean;
    meses_objetivo?: number;
    mes_actual?: number;
    monto_ya_ahorrado?: number;
}

export default function GastosFijos() {
    const [gastosFijos, setGastosFijos] = useState<GastoFijo[]>([]);
    const [cuentas, setCuentas] = useState<any[]>([]);
    const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState<GastoFijo | null>(null);
    const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', es_fijo: true });
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7)); // Mes actual YYYY-MM
    const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
    const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');
    const [mostrarInactivos, setMostrarInactivos] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: '',
        fecha: '',
        dia_del_mes: '',
        categoria: '',
        cuenta_id: '',
        activo: true,
        notas: '',
        frecuencia_meses: '1',
        es_recurrente: false,
        duracion_meses: '',
        es_prestamo: false,
        total_cuotas: '',
        cuota_actual: '',
        descripcion_prestamo: '',
        es_ahorro: false,
        meses_objetivo: '',
        mes_actual: '',
        monto_ya_ahorrado: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    // Detectar automáticamente si se selecciona categoría "Ahorros"
    useEffect(() => {
        if (formData.categoria && categoriasDB.length > 0) {
            const categoriaSeleccionada = categoriasDB.find(cat => cat.id.toString() === formData.categoria);
            if (categoriaSeleccionada && categoriaSeleccionada.nombre === 'Ahorros') {
                // Solo activar automáticamente si no hay ningún tipo seleccionado
                if (!formData.es_recurrente && !formData.es_prestamo && !formData.es_ahorro) {
                    setFormData(prev => ({
                        ...prev,
                        es_ahorro: true,
                        meses_objetivo: '12',
                        mes_actual: '0',
                        monto_ya_ahorrado: '0',
                        frecuencia_meses: '1'
                    }));
                }
            }
        }
    }, [formData.categoria, categoriasDB]);

    const loadInitialData = async () => {
        setLoading(true);
        await loadCategorias();
        await loadCuentas();
        await loadGastosFijos();
        setLoading(false);
    };

    const loadGastosFijos = async () => {
        try {
            const response = await fetch('/api/v1/gastos-fijos?usuarioId=1');
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            // Convertir los datos de la BD al formato que espera el frontend
            const gastosFormateados = data.map((gasto: any) => ({
                ...gasto,
                descripcion: gasto.concepto, // Mapear concepto a descripcion
                monto: typeof gasto.monto === 'string' ? parseFloat(gasto.monto) : gasto.monto,
                dia_del_mes: gasto.dia_mes, // Mapear dia_mes a dia_del_mes
                categoria: gasto.categoria_id, // Mapear categoria_id a categoria
                cuenta: gasto.cuenta_id, // Para compatibilidad
                // Convertir fecha ISO a formato local para evitar problemas de zona horaria
                proximo_pago: gasto.proximo_pago ? gasto.proximo_pago.split('T')[0] : new Date().toISOString().split('T')[0]
            }));
            setGastosFijos(gastosFormateados);
        } catch (error) {
            console.error('Error al cargar gastos fijos:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al cargar gastos fijos');
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

    const loadCategorias = async () => {
        try {
            const response = await fetch('/api/v1/categorias-gasto');
            const data = await response.json();
            setCategoriasDB(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            notifications.error('Error al cargar las categorías');
        }
    };

    const handleCreateCategoria = async (e: React.FormEvent) => {
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
            setNuevaCategoria({ nombre: '', es_fijo: true });
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
        if (!date) return 'No definido';
        // Tratar la fecha como local para evitar problemas de zona horaria
        const [year, month, day] = date.split('-');
        const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return localDate.toLocaleDateString('es-PY');
    };



    const getCategoriaColor = (categoria: string) => {
        const colors = {
            'Vivienda': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            'Servicios': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            'Seguros': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            'Entretenimiento': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'Educación': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'Salud': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
            'Transporte': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
            'Otros': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
        };
        return colors[categoria as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    };

    const getDiasHastaVencimiento = (proximoPago: string | undefined) => {
        if (!proximoPago) return 0;
        const hoy = new Date();
        const fechaPago = new Date(proximoPago);
        const diferencia = Math.ceil((fechaPago.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
        return diferencia;
    };

    const getEstadoPago = (diasHasta: number) => {
        if (diasHasta < 0) return { text: 'Vencido', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' };
        if (diasHasta <= 3) return { text: 'Por vencer', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' };
        if (diasHasta <= 7) return { text: 'Próximo', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
        return { text: 'Vigente', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
    };

    const gastosFiltrados = gastosFijos.filter(gasto => {
        const cumpleFiltroCategoria = !filtroCategoria || gasto.categoria_nombre === filtroCategoria;
        const cumpleFiltroActivo = mostrarInactivos || gasto.activo;
        
        // Lógica de filtro de fechas para gastos fijos (basado en próximo pago)
        let cumpleFiltroFecha = true;
        if (gasto.proximo_pago) {
            if (filtroFechaDesde || filtroFechaHasta) {
                // Si hay rango de fechas, usar rango e ignorar filtro de mes
                const fechaGasto = new Date(gasto.proximo_pago);
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
                cumpleFiltroFecha = !filtroMes || gasto.proximo_pago.startsWith(filtroMes);
            }
        }
        
        return cumpleFiltroCategoria && cumpleFiltroActivo && cumpleFiltroFecha;
    });

    const totalGastosFijos = gastosFiltrados.filter(g => g.activo).reduce((sum, gasto) => {
        const monto = typeof gasto.monto === 'number' ? gasto.monto : parseFloat(gasto.monto) || 0;
        return sum + monto;
    }, 0);
    
    const gastosActivos = gastosFiltrados.filter(g => g.activo).length;
    const proximosVencimientos = gastosFiltrados.filter(g => {
        const dias = getDiasHastaVencimiento(g.proximo_pago);
        return g.activo && dias <= 7 && dias >= 0;
    }).length;

    const handleView = (gasto: GastoFijo) => {
        setSelectedGasto(gasto);
        setIsViewModalOpen(true);
    };

    const handleEdit = (gasto: GastoFijo) => {
        setSelectedGasto(gasto);
        setFormData({
            descripcion: gasto.concepto || gasto.descripcion,
            monto: gasto.monto.toString(),
            fecha: gasto.proximo_pago || '',
            dia_del_mes: gasto.dia_mes?.toString() || gasto.dia_del_mes?.toString() || '',
            categoria: gasto.categoria_id ? gasto.categoria_id.toString() : '',
            cuenta_id: gasto.cuenta_id ? gasto.cuenta_id.toString() : '',
            activo: gasto.activo,
            notas: gasto.notas || '',
            frecuencia_meses: gasto.frecuencia_meses?.toString() || '1',
            es_recurrente: gasto.es_recurrente || false,
            duracion_meses: gasto.duracion_meses?.toString() || '',
            es_prestamo: gasto.es_prestamo || false,
            total_cuotas: gasto.total_cuotas?.toString() || '',
            cuota_actual: gasto.cuota_actual?.toString() || '',
            descripcion_prestamo: gasto.descripcion_prestamo || '',
            es_ahorro: gasto.es_ahorro || false,
            meses_objetivo: gasto.meses_objetivo?.toString() || '',
            mes_actual: gasto.mes_actual?.toString() || '',
            monto_ya_ahorrado: gasto.monto_ya_ahorrado?.toString() || ''
        });
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedGasto(null);
        setFormData({
            descripcion: '',
            monto: '',
            fecha: '',
            dia_del_mes: '',
            categoria: '',
            cuenta_id: '',
            activo: true,
            notas: '',
            frecuencia_meses: '1',
            es_recurrente: false,
            duracion_meses: '',
            es_prestamo: false,
            total_cuotas: '',
            cuota_actual: '',
            descripcion_prestamo: '',
            es_ahorro: false,
            meses_objetivo: '',
            mes_actual: '',
            monto_ya_ahorrado: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            notifications.loading(selectedGasto ? 'Actualizando gasto fijo...' : 'Creando gasto fijo...');
            
            const gastoData = {
                concepto: formData.descripcion,
                monto: formData.monto.toString(),
                dia_mes: formData.fecha ? new Date(formData.fecha).getDate() : null,
                categoria_id: formData.categoria ? parseInt(formData.categoria) : null,
                cuenta_id: formData.cuenta_id ? parseInt(formData.cuenta_id) : null,
                activo: formData.activo,
                notas: formData.notas || null,
                frecuencia_meses: parseInt(formData.frecuencia_meses),
                es_recurrente: formData.es_recurrente,
                duracion_meses: formData.es_recurrente && formData.duracion_meses ? parseInt(formData.duracion_meses) : null,
                es_prestamo: formData.es_prestamo,
                total_cuotas: formData.es_prestamo && formData.total_cuotas ? parseInt(formData.total_cuotas) : null,
                cuota_actual: formData.es_prestamo && formData.cuota_actual ? parseInt(formData.cuota_actual) : null,
                descripcion_prestamo: formData.es_prestamo ? formData.descripcion_prestamo || null : null,
                es_ahorro: formData.es_ahorro,
                meses_objetivo: formData.es_ahorro && formData.meses_objetivo ? parseInt(formData.meses_objetivo) : null,
                mes_actual: formData.es_ahorro && formData.mes_actual ? parseInt(formData.mes_actual) : null,
                monto_ya_ahorrado: formData.es_ahorro && formData.monto_ya_ahorrado ? parseFloat(formData.monto_ya_ahorrado) : null
            };

            // Solo agregar usuario_id para crear nuevos gastos
            if (!selectedGasto) {
                (gastoData as any).usuario_id = 1;
            }

            const url = selectedGasto 
                ? `/api/v1/gastos-fijos/${selectedGasto.id}`
                : '/api/v1/gastos-fijos';
            
            const method = selectedGasto ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gastoData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            notifications.close();
            notifications.toast.success(
                selectedGasto ? 'Gasto fijo actualizado correctamente' : 'Gasto fijo creado correctamente'
            );
            
            await loadGastosFijos();
            setIsModalOpen(false);
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al guardar gasto fijo');
        }
    };

    const handleDeleteGasto = async (gasto: GastoFijo) => {
        const result = await notifications.confirmDelete(`el gasto fijo "${gasto.descripcion}"`);
        
        if (result.isConfirmed) {
            try {
                notifications.loading('Eliminando gasto fijo...');
                
                const response = await fetch(`/api/v1/gastos-fijos/${gasto.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
                    throw new Error(errorMessage);
                }

                notifications.close();
                notifications.toast.success('Gasto fijo eliminado correctamente');
                await loadGastosFijos();
            } catch (err) {
                notifications.close();
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                notifications.error(errorMessage, 'Error al eliminar gasto fijo');
            }
        }
    };

    const handleQuickPay = async (gasto: GastoFijo) => {
        try {
            notifications.loading('Marcando como pagado...');
            
            const response = await fetch(`/api/v1/gastos-fijos/${gasto.id}/pagar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            notifications.close();
            notifications.toast.success('Gasto marcado como pagado');
            await loadGastosFijos();
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al marcar como pagado');
        }
    };

    const handlePayWithDate = async (gasto: GastoFijo) => {
        try {
            // Usar la función inputDate de notifications
            const result = await notifications.inputDate({
                title: '¿En qué fecha se pagó?',
                text: `Marcar como pagado: ${gasto.descripcion}`,
                inputLabel: 'Fecha de pago',
                confirmButtonText: 'Marcar como pagado',
                showCancelButton: true
            });

            if (result.isDismissed) return;
            const fechaPago = result.value;

            notifications.loading('Marcando como pagado...');
            
            const response = await fetch(`/api/v1/gastos-fijos/${gasto.id}/pagar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fechaPago })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            notifications.close();
            notifications.toast.success('Gasto marcado como pagado con fecha específica');
            await loadGastosFijos();
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al marcar como pagado');
        }
    };

    const handleDeleteRecurrentes = async (gasto: GastoFijo) => {
        const tipoGasto = gasto.es_recurrente && !gasto.gasto_padre_id ? 'padre' : 'hijo';
        const mensaje = tipoGasto === 'padre' 
            ? `todos los gastos fijos recurrentes de "${gasto.descripcion}" (incluyendo los meses futuros pendientes)`
            : `toda la serie recurrente relacionada con "${gasto.descripcion}"`;
            
        const result = await notifications.confirm(
            `¿Estás seguro de que deseas eliminar ${mensaje}?`,
            'Eliminar Serie Recurrente',
            'Sí, eliminar todos',
            'Cancelar'
        );
        
        if (result.isConfirmed) {
            try {
                notifications.loading('Eliminando gastos fijos recurrentes...');
                
                const response = await fetch(`/api/v1/gastos-fijos/${gasto.id}/recurrentes`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                notifications.close();
                notifications.toast.success(data.message || 'Gastos fijos recurrentes eliminados correctamente');
                await loadGastosFijos();
            } catch (err) {
                notifications.close();
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                notifications.error(errorMessage, 'Error al eliminar gastos fijos recurrentes');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                    Gastos Fijos
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
                                Mes próx. pago
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

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="mostrarInactivos"
                                checked={mostrarInactivos}
                                onChange={(e) => setMostrarInactivos(e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 transition-colors duration-200"
                            />
                            <label htmlFor="mostrarInactivos" className="ml-2 block text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                Mostrar inactivos
                            </label>
                        </div>

                        {(filtroFechaDesde || filtroFechaHasta || filtroCategoria || filtroMes || mostrarInactivos) && (
                            <div className="flex items-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFiltroCategoria('');
                                        setFiltroMes('');
                                        setFiltroFechaDesde('');
                                        setFiltroFechaHasta('');
                                        setMostrarInactivos(false);
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
                            Nuevo Gasto Fijo
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Mensual"
                    value={formatCurrency(totalGastosFijos)}
                    icon={<DollarSign className="w-5 h-5" />}
                    iconColor="red"
                />
                <MetricCard
                    title="Gastos Activos"
                    value={gastosActivos.toString()}
                    icon={<FileText className="w-5 h-5" />}
                    iconColor="blue"
                />
                <MetricCard
                    title="Próximos a Vencer"
                    value={proximosVencimientos.toString()}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    iconColor="yellow"
                />
            </div>

            {/* Lista de Gastos Fijos */}
            <Card>
                <CardHeader>
                    <CardTitle>Gastos Fijos Mensuales</CardTitle>
                </CardHeader>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Próximo Pago</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    Cargando gastos fijos...
                                </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                            </TableRow>
                        ) : gastosFiltrados.length === 0 ? (
                            <TableRow>
                                <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No tienes gastos fijos registrados. ¡Agrega tu primer gasto fijo!
                                </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                                <TableCell> </TableCell>
                            </TableRow>
                        ) : (
                            gastosFiltrados.map((gasto) => {
                                const diasHasta = getDiasHastaVencimiento(gasto.proximo_pago);
                                const estadoPago = getEstadoPago(diasHasta);

                                return (
                                    <TableRow key={gasto.id} className={!gasto.activo ? 'opacity-50' : ''}>
                                        <TableCell className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{gasto.descripcion}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(gasto.categoria_nombre || 'Otros')}`}>
                                                {gasto.categoria_nombre || 'Sin categoría'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-semibold text-red-600 dark:text-red-400 transition-colors duration-200">{formatCurrency(gasto.monto)}</TableCell>
                                        <TableCell>{formatDate(gasto.proximo_pago || '')}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${estadoPago.color}`}>
                                                {estadoPago.text}
                                                {diasHasta >= 0 && ` (${diasHasta}d)`}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                {/* Botones de pagar - solo si está pendiente */}
                                                {gasto.estado === 'PENDIENTE' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleQuickPay(gasto)}
                                                            className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            title="Marcar como pagado hoy"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handlePayWithDate(gasto)}
                                                            className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            title="Marcar como pagado con fecha específica"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </Button>
                                                    </>
                                                )}

                                                {/* Botón especial para eliminar recurrentes - Solo en el gasto original */}
                                                {(gasto.es_recurrente && !gasto.gasto_padre_id) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteRecurrentes(gasto)}
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteGasto(gasto)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Eliminar solo este gasto"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedGasto ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <Input
                                label="Descripción"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                placeholder="Ej. Arriendo Departamento"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-1 mb-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                    Fecha del próximo pago
                                </label>
                                <InfoIcon
                                    title="Fecha del próximo pago"
                                    content="Fecha en que se realizará el próximo pago de este gasto fijo. El sistema calculará automáticamente las fechas futuras basándose en la frecuencia especificada."
                                    size={14}
                                />
                            </div>
                            <input
                                type="date"
                                value={formData.fecha}
                                onChange={(e) => {
                                    setFormData({ 
                                        ...formData, 
                                        fecha: e.target.value,
                                        dia_del_mes: new Date(e.target.value).getDate().toString()
                                    });
                                }}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Solo mostrar frecuencia si es relevante */}
                        {(formData.es_recurrente || formData.es_prestamo || formData.es_ahorro) && (
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                        Frecuencia
                                    </label>
                                    <InfoIcon
                                        title="Frecuencia de pago"
                                        content={[
                                            "¿Cada cuánto tiempo se repite?",
                                            "• Mensual - Cada mes",
                                            "• Bimestral - Cada 2 meses", 
                                            "• Trimestral - Cada 3 meses",
                                            "• Semestral - Cada 6 meses",
                                            "• Anual - Cada 12 meses"
                                        ]}
                                        size={14}
                                    />
                                </div>
                                <select
                                    value={formData.frecuencia_meses}
                                    onChange={(e) => setFormData({ ...formData, frecuencia_meses: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                    required
                                >
                                    <option value="1">Mensual (cada mes)</option>
                                    <option value="2">Bimestral (cada 2 meses)</option>
                                    <option value="3">Trimestral (cada 3 meses)</option>
                                    <option value="6">Semestral (cada 6 meses)</option>
                                    <option value="12">Anual (cada 12 meses)</option>
                                </select>
                            </div>
                        )}
                    </div>

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
                                    className="text-xs px-2 py-1 border-primary-300 text-black hover:bg-primary-50 dark:border-primary-600 dark:text-primary-400 dark:hover:bg-primary-900/20"
                                >
                                    + Nueva
                                </Button>
                            </div>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
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
                                className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
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
                            Notas (opcional)
                        </label>
                        <textarea
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            rows={3}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                            placeholder="Notas adicionales sobre el gasto fijo..."
                        />
                    </div>

                    {/* Tipo de Gasto - Simplificado */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">¿Qué tipo de gasto es?</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <input
                                    type="radio"
                                    id="tipo_simple"
                                    name="tipo_gasto"
                                    checked={!formData.es_recurrente && !formData.es_prestamo && !formData.es_ahorro}
                                    onChange={() => setFormData({ 
                                        ...formData, 
                                        es_recurrente: false, 
                                        es_prestamo: false,
                                        es_ahorro: false,
                                        duracion_meses: '',
                                        total_cuotas: '',
                                        cuota_actual: '',
                                        descripcion_prestamo: '',
                                        meses_objetivo: '',
                                        mes_actual: '',
                                        monto_ya_ahorrado: '',
                                        frecuencia_meses: '1' // Valor por defecto
                                    })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors duration-200"
                                />
                                <div className="ml-3 flex-1">
                                    <label htmlFor="tipo_simple" className="block text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                        Gasto único
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Se programa solo una vez para una fecha específica</p>
                                </div>
                                <InfoIcon
                                    title="Gasto único"
                                    content={[
                                        "Se registra una sola vez y se programa para una fecha específica.",
                                        "Ejemplo: Pago de matrícula anual, renovación de licencia, etc.",
                                        "No se repite automáticamente."
                                    ]}
                                    size={14}
                                />
                            </div>

                            <div className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <input
                                    type="radio"
                                    id="tipo_recurrente"
                                    name="tipo_gasto"
                                    checked={formData.es_recurrente}
                                    onChange={() => setFormData({ 
                                        ...formData, 
                                        es_recurrente: true, 
                                        es_prestamo: false,
                                        es_ahorro: false,
                                        total_cuotas: '',
                                        cuota_actual: '',
                                        descripcion_prestamo: '',
                                        meses_objetivo: '',
                                        mes_actual: '',
                                        monto_ya_ahorrado: '',
                                        duracion_meses: '12', // Valor por defecto 1 año
                                        frecuencia_meses: '1' // Mensual por defecto
                                    })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors duration-200"
                                />
                                <div className="ml-3 flex-1">
                                    <label htmlFor="tipo_recurrente" className="block text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                        Gasto recurrente
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Se repite automáticamente cada cierto tiempo</p>
                                </div>
                                <InfoIcon
                                    title="Gasto Recurrente"
                                    content={[
                                        "Se creará automáticamente un gasto pendiente según la frecuencia configurada.",
                                        "Ideal para: servicios, suscripciones, seguros, alquileres, etc.",
                                        "El sistema genera los gastos futuros automáticamente.",
                                        "Puedes configurar la duración total (ej: 12 meses, 24 meses)."
                                    ]}
                                    size={14}
                                />
                            </div>

                            <div className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <input
                                    type="radio"
                                    id="tipo_prestamo"
                                    name="tipo_gasto"
                                    checked={formData.es_prestamo}
                                    onChange={() => setFormData({ 
                                        ...formData, 
                                        es_prestamo: true, 
                                        es_recurrente: false,
                                        es_ahorro: false,
                                        duracion_meses: '',
                                        total_cuotas: '12', // Valor por defecto
                                        cuota_actual: '0', // Empezar desde 0
                                        meses_objetivo: '',
                                        mes_actual: '',
                                        monto_ya_ahorrado: '',
                                        frecuencia_meses: '1' // Mensual por defecto
                                    })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors duration-200"
                                />
                                <div className="ml-3 flex-1">
                                    <label htmlFor="tipo_prestamo" className="block text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                        Préstamo
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Cuotas numeradas automáticamente</p>
                                </div>
                                <InfoIcon
                                    title="Préstamo"
                                    content={[
                                        "Genera automáticamente cuotas numeradas y correlativas.",
                                        "Cada cuota se nombra automáticamente (ej: 'Cuota 3/12 - Préstamo Personal').",
                                        "Solo necesitas especificar cuántas cuotas ya pagaste.",
                                        "Ideal para: créditos personales, hipotecas, préstamos bancarios."
                                    ]}
                                    size={14}
                                />
                            </div>

                            <div className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <input
                                    type="radio"
                                    id="tipo_ahorro"
                                    name="tipo_gasto"
                                    checked={formData.es_ahorro}
                                    onChange={() => setFormData({ 
                                        ...formData, 
                                        es_ahorro: true, 
                                        es_recurrente: false,
                                        es_prestamo: false,
                                        duracion_meses: '',
                                        total_cuotas: '',
                                        cuota_actual: '',
                                        descripcion_prestamo: '',
                                        meses_objetivo: '12', // Valor por defecto
                                        mes_actual: '0', // Empezar desde 0
                                        monto_ya_ahorrado: '0', // Empezar desde 0
                                        frecuencia_meses: '1' // Mensual por defecto
                                    })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 transition-colors duration-200"
                                />
                                <div className="ml-3 flex-1">
                                    <label htmlFor="tipo_ahorro" className="block text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                        Ahorro programado
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Meses numerados automáticamente para alcanzar una meta</p>
                                </div>
                                <InfoIcon
                                    title="Ahorro programado"
                                    content={[
                                        "Genera automáticamente meses numerados y correlativas para tu meta de ahorro.",
                                        "Cada mes se nombra automáticamente (ej: 'Mes 3/12 - Ahorro Vacaciones').",
                                        "Solo necesitas especificar cuántos meses ya ahorraste.",
                                        "Ideal para: vacaciones, emergencias, compras grandes, metas financieras."
                                    ]}
                                    size={14}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Configuración específica para Gasto Recurrente */}
                    {formData.es_recurrente && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">¿Por cuánto tiempo?</h4>
                                <InfoIcon
                                    title="Duración del gasto recurrente"
                                    content={[
                                        "El sistema generará automáticamente los gastos futuros durante este período.",
                                        "Ejemplos comunes:",
                                        "• 12 meses - Suscripciones anuales",
                                        "• 24 meses - Contratos de servicios",
                                        "• 36 meses - Planes a largo plazo",
                                        "",
                                        "Una vez completado, el gasto se marcará como finalizado."
                                    ]}
                                    size={14}
                                />
                            </div>
                            <select
                                value={formData.duracion_meses}
                                onChange={(e) => setFormData({ ...formData, duracion_meses: e.target.value })}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                required
                            >
                                <option value="">Seleccionar duración</option>
                                <option value="6">6 meses</option>
                                <option value="12">12 meses (1 año)</option>
                                <option value="18">18 meses</option>
                                <option value="24">24 meses (2 años)</option>
                                <option value="36">36 meses (3 años)</option>
                                <option value="60">60 meses (5 años)</option>
                            </select>
                        </div>
                    )}

                    {/* Configuración específica para Préstamo */}
                    {formData.es_prestamo && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg space-y-4">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">Información del préstamo</h4>
                                <InfoIcon
                                    title="Configuración automática"
                                    content={[
                                        "Solo necesitas proporcionar la información básica.",
                                        "El sistema generará automáticamente:",
                                        "• Todas las cuotas restantes",
                                        "• Numeración correlativa (Cuota X/Total)",
                                        "• Fechas de vencimiento mensuales",
                                        "• Seguimiento de progreso"
                                    ]}
                                    size={14}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Total de cuotas
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="360"
                                            value={formData.total_cuotas}
                                            onChange={(e) => setFormData({ ...formData, total_cuotas: e.target.value })}
                                            placeholder="Escribir o seleccionar..."
                                            list="cuotas-options"
                                            className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                            required
                                        />
                                        <datalist id="cuotas-options">
                                            <option value="6">6 cuotas (6 meses)</option>
                                            <option value="12">12 cuotas (1 año)</option>
                                            <option value="18">18 cuotas (1.5 años)</option>
                                            <option value="24">24 cuotas (2 años)</option>
                                            <option value="30">30 cuotas (2.5 años)</option>
                                            <option value="36">36 cuotas (3 años)</option>
                                            <option value="48">48 cuotas (4 años)</option>
                                            <option value="60">60 cuotas (5 años)</option>
                                            <option value="72">72 cuotas (6 años)</option>
                                            <option value="84">84 cuotas (7 años)</option>
                                            <option value="96">96 cuotas (8 años)</option>
                                            <option value="120">120 cuotas (10 años)</option>
                                        </datalist>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formData.total_cuotas ? `${formData.total_cuotas} cuotas = ${Math.round(parseInt(formData.total_cuotas) / 12 * 10) / 10} años` : 'Puedes escribir cualquier número o seleccionar una opción común'}
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        ¿Cuántas ya pagaste?
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={formData.total_cuotas ? parseInt(formData.total_cuotas) - 1 : 60}
                                        value={formData.cuota_actual}
                                        onChange={(e) => setFormData({ ...formData, cuota_actual: e.target.value })}
                                        placeholder="0"
                                        className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formData.total_cuotas && formData.cuota_actual ? 
                                            `Faltan ${parseInt(formData.total_cuotas) - parseInt(formData.cuota_actual || '0')} cuotas` 
                                            : 'Ingresa 0 si es un préstamo nuevo'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Configuración específica para Ahorro */}
                    {formData.es_ahorro && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-4">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">Meta de ahorro</h4>
                                <InfoIcon
                                    title="Configuración automática de ahorro"
                                    content={[
                                        "Solo necesitas proporcionar la información básica de tu meta.",
                                        "El sistema generará automáticamente:",
                                        "• Todos los meses restantes hasta tu meta",
                                        "• Numeración correlativa (Mes X/Total)",
                                        "• Fechas de vencimiento mensuales",
                                        "• Seguimiento de progreso acumulado"
                                    ]}
                                    size={14}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        ¿En cuántos meses quieres lograrlo?
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="120"
                                            value={formData.meses_objetivo}
                                            onChange={(e) => setFormData({ ...formData, meses_objetivo: e.target.value })}
                                            placeholder="Escribir o seleccionar..."
                                            list="meses-options"
                                            className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                            required
                                        />
                                        <datalist id="meses-options">
                                            <option value="3">3 meses</option>
                                            <option value="6">6 meses</option>
                                            <option value="12">12 meses (1 año)</option>
                                            <option value="18">18 meses (1.5 años)</option>
                                            <option value="24">24 meses (2 años)</option>
                                            <option value="36">36 meses (3 años)</option>
                                            <option value="48">48 meses (4 años)</option>
                                            <option value="60">60 meses (5 años)</option>
                                        </datalist>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formData.meses_objetivo ? `${formData.meses_objetivo} meses = ${Math.round(parseInt(formData.meses_objetivo) / 12 * 10) / 10} años` : 'Define tu plazo para ahorrar'}
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        ¿Cuántos meses ya ahorraste?
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={formData.meses_objetivo ? parseInt(formData.meses_objetivo) - 1 : 60}
                                        value={formData.mes_actual}
                                        onChange={(e) => setFormData({ ...formData, mes_actual: e.target.value })}
                                        placeholder="0"
                                        className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formData.meses_objetivo && formData.mes_actual ? 
                                            `Faltan ${parseInt(formData.meses_objetivo) - parseInt(formData.mes_actual || '0')} meses` 
                                            : 'Ingresa 0 si es un ahorro nuevo'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    ¿Cuánto ya tienes ahorrado? (opcional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.monto_ya_ahorrado}
                                    onChange={(e) => setFormData({ ...formData, monto_ya_ahorrado: e.target.value })}
                                    placeholder="0"
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formData.monto_ya_ahorrado && formData.monto && formData.meses_objetivo ? 
                                        `Con ${formatCurrency(parseFloat(formData.monto_ya_ahorrado))} ya ahorrado, el total sería ${formatCurrency(parseFloat(formData.monto_ya_ahorrado) + (parseFloat(formData.monto) * parseInt(formData.meses_objetivo)))}` 
                                        : 'Monto que ya tienes separado para esta meta'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="activo"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded transition-colors duration-200"
                        />
                        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200">
                            Activo
                        </label>
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
                            {selectedGasto ? 'Actualizar' : 'Crear'} Gasto Fijo
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
                        placeholder="Ej. Servicios, Seguros, etc."
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
                title="Detalles del Gasto Fijo"
                size="md"
            >
                {selectedGasto && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Concepto
                                </label>
                                <p className="text-lg text-gray-900 dark:text-white">
                                    {selectedGasto.descripcion || selectedGasto.concepto}
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
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Día de pago
                                </label>
                                <p className="text-lg text-gray-900 dark:text-white">
                                    Día {selectedGasto.dia_mes || selectedGasto.dia_del_mes}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Frecuencia
                                </label>
                                <p className="text-lg text-gray-900 dark:text-white">
                                    {selectedGasto.frecuencia_meses === 1 ? 'Mensual' : `Cada ${selectedGasto.frecuencia_meses} meses`}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Categoría
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoriaColor(selectedGasto.categoria_nombre || 'Otros')}`}>
                                    {selectedGasto.categoria_nombre || 'Sin categoría'}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Próximo pago
                                </label>
                                <p className="text-lg text-gray-900 dark:text-white">
                                    {formatDate(selectedGasto.proximo_pago || '')}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Estado
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoPago(getDiasHastaVencimiento(selectedGasto.proximo_pago)).color}`}>
                                    {selectedGasto.activo ? getEstadoPago(getDiasHastaVencimiento(selectedGasto.proximo_pago)).text : 'Inactivo'}
                                </span>
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