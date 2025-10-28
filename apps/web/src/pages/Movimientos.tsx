import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Table, Button, Input, Modal } from '../components/ui';
import { notifications } from '../utils/notifications';
import { Eye, Filter, RotateCcw, RefreshCw } from 'lucide-react';

// Interfaces para movimientos
interface Movimiento {
    id: number;
    usuario_id: number;
    cuenta_origen_id: number | null;
    cuenta_destino_id: number | null;
    tipo: 'INGRESO' | 'GASTO' | 'TRANSFERENCIA' | 'TRANSFERENCIA_ENTRADA' | 'TRANSFERENCIA_SALIDA' | 'PAGO_TARJETA';
    monto: number | string;
    fecha: string;
    descripcion: string;
    creado_en: string;
    actualizado_en: string;
    cuenta_origen_nombre?: string;
    cuenta_destino_nombre?: string;
}

interface Cuenta {
    id: number;
    nombre: string;
    tipo: string;
    saldo_inicial: number | string;
    moneda: string;
    activa: boolean;
}

interface FiltrosMovimientos {
    fechaInicio: string;
    fechaFin: string;
    tipo: string;
    cuentaId: string;
    busqueda: string;
    montoMin: string;
    montoMax: string;
}

export default function Movimientos() {
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [cuentas, setCuentas] = useState<Cuenta[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedMovimiento, setSelectedMovimiento] = useState<Movimiento | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    const [filtros, setFiltros] = useState<FiltrosMovimientos>({
        fechaInicio: '',
        fechaFin: '',
        tipo: '',
        cuentaId: '',
        busqueda: '',
        montoMin: '',
        montoMax: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadMovimientos();
    }, [filtros]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadCuentas(),
                loadMovimientos()
            ]);
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            notifications.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const loadCuentas = async () => {
        try {
            const response = await fetch('/api/v1/cuentas?usuarioId=1');
            const data = await response.json();
            setCuentas(data);
        } catch (error) {
            console.error('Error al cargar cuentas:', error);
        }
    };

    const loadMovimientos = async () => {
        try {
            const params = new URLSearchParams({ usuarioId: '1' });
            
            Object.entries(filtros).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    params.append(key, value.trim());
                }
            });

            const response = await fetch(`/api/v1/movimientos?${params.toString()}`);
            const data = await response.json();
            
            // Mapear y formatear los movimientos
            const movimientosFormateados = data.map((mov: any) => ({
                ...mov,
                monto: typeof mov.monto === 'string' ? parseFloat(mov.monto) : mov.monto,
                fecha: mov.fecha ? mov.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
            }));

            setMovimientos(movimientosFormateados);
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            notifications.error('Error al cargar los movimientos');
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

    const getTipoColor = (tipo: string) => {
        switch (tipo) {
            case 'INGRESO':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'GASTO':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'TRANSFERENCIA':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            case 'TRANSFERENCIA_ENTRADA':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'TRANSFERENCIA_SALIDA':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'PAGO_TARJETA':
                return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
            default:
                return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
        }
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'INGRESO':
                return '↗️';
            case 'GASTO':
                return '↙️';
            case 'TRANSFERENCIA':
                return '↔️';
            case 'TRANSFERENCIA_ENTRADA':
                return '↗️';
            case 'TRANSFERENCIA_SALIDA':
                return '↙️';
            case 'PAGO_TARJETA':
                return '💳';
            default:
                return '📝';
        }
    };

    const handleFilterChange = (key: keyof FiltrosMovimientos, value: string) => {
        setFiltros(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFiltros({
            fechaInicio: '',
            fechaFin: '',
            tipo: '',
            cuentaId: '',
            busqueda: '',
            montoMin: '',
            montoMax: ''
        });
    };

    const showMovimientoDetail = (movimiento: Movimiento) => {
        setSelectedMovimiento(movimiento);
        setShowDetailModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 transition-colors duration-200"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                        Movimientos
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
                        Historial automático de todos los movimientos financieros
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowFilters(!showFilters)}
                        variant={showFilters ? 'secondary' : 'ghost'}
                        className="text-sm border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </Button>
                    <Button
                        onClick={loadMovimientos}
                        variant="ghost"
                        className="text-sm border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Panel de Filtros */}
            {showFilters && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filtros de Búsqueda</CardTitle>
                    </CardHeader>
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Rango de fechas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha inicio
                                </label>
                                <Input
                                    type="date"
                                    value={filtros.fechaInicio}
                                    onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha fin
                                </label>
                                <Input
                                    type="date"
                                    value={filtros.fechaFin}
                                    onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                                />
                            </div>

                            {/* Tipo de movimiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo
                                </label>
                                <select
                                    value={filtros.tipo}
                                    onChange={(e) => handleFilterChange('tipo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="INGRESO">Ingresos</option>
                                    <option value="GASTO">Gastos</option>
                                    <option value="TRANSFERENCIA">Transferencias</option>
                                    <option value="PAGO_TARJETA">Pago Tarjeta</option>
                                </select>
                            </div>

                            {/* Cuenta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Cuenta
                                </label>
                                <select
                                    value={filtros.cuentaId}
                                    onChange={(e) => handleFilterChange('cuentaId', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                                >
                                    <option value="">Todas las cuentas</option>
                                    {cuentas.map((cuenta) => (
                                        <option key={cuenta.id} value={cuenta.id}>
                                            {cuenta.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Búsqueda por descripción */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Buscar en descripción
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Buscar movimientos..."
                                    value={filtros.busqueda}
                                    onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                                />
                            </div>

                            {/* Rango de montos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Monto mínimo
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={filtros.montoMin}
                                    onChange={(e) => handleFilterChange('montoMin', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Monto máximo
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Sin límite"
                                    value={filtros.montoMax}
                                    onChange={(e) => handleFilterChange('montoMax', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button 
                                onClick={clearFilters} 
                                variant="ghost" 
                                size="sm" 
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4 transition-colors duration-200">
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 mb-1">Total Movimientos</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                            {movimientos.length}
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="p-4 transition-colors duration-200">
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 mb-1">Total Ingresos</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400 transition-colors duration-200">
                            {formatCurrency(
                                movimientos
                                    .filter(m => m.tipo === 'INGRESO')
                                    .reduce((sum, m) => sum + (typeof m.monto === 'string' ? parseFloat(m.monto) : m.monto), 0)
                            )}
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="p-4 transition-colors duration-200">
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 mb-1">Total Gastos</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400 transition-colors duration-200">
                            {formatCurrency(
                                movimientos
                                    .filter(m => m.tipo === 'GASTO')
                                    .reduce((sum, m) => sum + (typeof m.monto === 'string' ? parseFloat(m.monto) : m.monto), 0)
                            )}
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="p-4 transition-colors duration-200">
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 mb-1">Balance Neto</p>
                        <p className={`text-lg font-bold transition-colors duration-200 ${
                            movimientos
                                .reduce((sum, m) => {
                                    const monto = typeof m.monto === 'string' ? parseFloat(m.monto) : m.monto;
                                    return sum + (m.tipo === 'INGRESO' ? monto : -monto);
                                }, 0) >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                        }`}>
                            {formatCurrency(
                                movimientos.reduce((sum, m) => {
                                    const monto = typeof m.monto === 'string' ? parseFloat(m.monto) : m.monto;
                                    return sum + (m.tipo === 'INGRESO' ? monto : -monto);
                                }, 0)
                            )}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Tabla de Movimientos */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Historial de Movimientos</CardTitle>
                </CardHeader>
                <Table>
                    <thead>
                        <tr>
                            <th className="text-center text-gray-900 dark:text-gray-100 transition-colors duration-200">Fecha</th>
                            <th className="text-center text-gray-900 dark:text-gray-100 transition-colors duration-200">Tipo</th>
                            <th className="text-center text-gray-900 dark:text-gray-100 transition-colors duration-200">Descripción</th>
                            <th className="text-center text-gray-900 dark:text-gray-100 transition-colors duration-200">Cuenta</th>
                            <th className="text-center text-gray-900 dark:text-gray-100 transition-colors duration-200">Monto</th>
                            <th className="text-center text-gray-900 dark:text-gray-100 transition-colors duration-200">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-200 text-sm">
                                    No se encontraron movimientos
                                </td>
                            </tr>
                        ) : (
                            movimientos.map((movimiento) => (
                                <tr key={movimiento.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                                    <td className="text-center font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 text-sm">
                                        {formatDate(movimiento.fecha)}
                                    </td>
                                    <td className="text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(movimiento.tipo)}`}>
                                            <span className="mr-1">{getTipoIcon(movimiento.tipo)}</span>
                                            {movimiento.tipo}
                                        </span>
                                    </td>
                                    <td className="text-center max-w-xs truncate text-gray-900 dark:text-gray-100 transition-colors duration-200 text-sm">
                                        {movimiento.descripcion}
                                    </td>
                                    <td className="text-center text-sm">
                                        {movimiento.tipo === 'INGRESO' ? (
                                            <span className="text-green-600 dark:text-green-400 transition-colors duration-200">
                                                → {movimiento.cuenta_destino_nombre || 'N/A'}
                                            </span>
                                        ) : movimiento.tipo === 'GASTO' ? (
                                            <span className="text-red-600 dark:text-red-400 transition-colors duration-200">
                                                ← {movimiento.cuenta_origen_nombre || 'N/A'}
                                            </span>
                                        ) : movimiento.tipo === 'TRANSFERENCIA_ENTRADA' ? (
                                            <span className="text-green-600 dark:text-green-400 transition-colors duration-200">
                                                → {movimiento.cuenta_destino_nombre || 'N/A'}
                                            </span>
                                        ) : movimiento.tipo === 'TRANSFERENCIA_SALIDA' ? (
                                            <span className="text-red-600 dark:text-red-400 transition-colors duration-200">
                                                ← {movimiento.cuenta_origen_nombre || 'N/A'}
                                            </span>
                                        ) : (
                                            <span className="text-blue-600 dark:text-blue-400 transition-colors duration-200">
                                                {movimiento.cuenta_origen_nombre} → {movimiento.cuenta_destino_nombre}
                                            </span>
                                        )}
                                    </td>
                                    <td className={`text-center font-bold text-sm transition-colors duration-200 ${
                                        movimiento.tipo === 'INGRESO' || movimiento.tipo === 'TRANSFERENCIA_ENTRADA'
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {movimiento.tipo === 'INGRESO' || movimiento.tipo === 'TRANSFERENCIA_ENTRADA' ? '+' : '-'}
                                        {formatCurrency(typeof movimiento.monto === 'string' ? parseFloat(movimiento.monto) : movimiento.monto)}
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            onClick={() => showMovimientoDetail(movimiento)}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                                            title="Ver detalles"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Modal de Detalles */}
            {showDetailModal && selectedMovimiento && (
                <Modal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    title="Detalles del Movimiento"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                    ID del Movimiento
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                    #{selectedMovimiento.id}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                    Tipo
                                </label>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${getTipoColor(selectedMovimiento.tipo)}`}>
                                    <span className="mr-1">{getTipoIcon(selectedMovimiento.tipo)}</span>
                                    {selectedMovimiento.tipo}
                                </span>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                Descripción
                            </label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                {selectedMovimiento.descripcion}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                    Fecha
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                    {formatDate(selectedMovimiento.fecha)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                    Monto
                                </label>
                                <p className={`text-lg font-bold transition-colors duration-200 ${
                                    selectedMovimiento.tipo === 'INGRESO' 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {selectedMovimiento.tipo === 'INGRESO' ? '+' : '-'}
                                    {formatCurrency(typeof selectedMovimiento.monto === 'string' ? parseFloat(selectedMovimiento.monto) : selectedMovimiento.monto)}
                                </p>
                            </div>
                        </div>

                        {selectedMovimiento.cuenta_origen_nombre && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                    Cuenta Origen
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                    {selectedMovimiento.cuenta_origen_nombre}
                                </p>
                            </div>
                        )}

                        {selectedMovimiento.cuenta_destino_nombre && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                    Cuenta Destino
                                </label>
                                <p className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                    {selectedMovimiento.cuenta_destino_nombre}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                            <div>
                                <label className="block font-medium">
                                    Creado
                                </label>
                                <p>{new Date(selectedMovimiento.creado_en).toLocaleString('es-PY')}</p>
                            </div>
                            <div>
                                <label className="block font-medium">
                                    Actualizado
                                </label>
                                <p>{new Date(selectedMovimiento.actualizado_en).toLocaleString('es-PY')}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>ℹ️ Información:</strong> Este movimiento fue generado automáticamente por el sistema cuando se registró un {selectedMovimiento.tipo.toLowerCase()}.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}