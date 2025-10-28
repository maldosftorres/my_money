import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input } from '../components/ui';
import { notifications } from '../utils/notifications';

interface Transferencia {
    id: number;
    usuario_id: number;
    cuenta_origen_id: number;
    cuenta_destino_id: number;
    monto: number;
    concepto: string;
    estado: 'PENDIENTE' | 'COMPLETADA';
    notas?: string;
    fecha: string;
    creado_en: string;
    actualizado_en: string;
    cuenta_origen_nombre?: string;
    cuenta_destino_nombre?: string;
}

interface Cuenta {
    id: number;
    nombre: string;
    saldo_inicial: number;
}

export default function Transferencias() {
    const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
    const [cuentas, setCuentas] = useState<Cuenta[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTransferencia, setSelectedTransferencia] = useState<Transferencia | null>(null);
    const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7));
    const [filtroCuenta, setFiltroCuenta] = useState<string>('');
    const [formData, setFormData] = useState({
        cuenta_origen_id: '',
        cuenta_destino_id: '',
        monto: '',
        concepto: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'PENDIENTE' as 'PENDIENTE' | 'COMPLETADA',
        notas: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        await Promise.all([
            loadTransferencias(),
            loadCuentas()
        ]);
        setLoading(false);
    };

    const loadTransferencias = async () => {
        try {
            const params = new URLSearchParams();
            params.append('usuarioId', '1');
            if (filtroMes) params.append('mes', filtroMes);
            if (filtroCuenta) params.append('cuentaId', filtroCuenta);

            const response = await fetch(`/api/v1/transferencias?${params}`);
            if (!response.ok) throw new Error('Error al cargar transferencias');
            
            const data = await response.json();
            setTransferencias(data);
        } catch (error) {
            console.error('Error loading transferencias:', error);
            notifications.error('Error al cargar las transferencias');
        }
    };

    const loadCuentas = async () => {
        try {
            const response = await fetch('/api/v1/cuentas?usuarioId=1');
            if (!response.ok) throw new Error('Error al cargar cuentas');
            
            const data = await response.json();
            setCuentas(data);
        } catch (error) {
            console.error('Error loading cuentas:', error);
            notifications.error('Error al cargar las cuentas');
        }
    };

    const handleNew = () => {
        setSelectedTransferencia(null);
        setFormData({
            cuenta_origen_id: '',
            cuenta_destino_id: '',
            monto: '',
            concepto: '',
            fecha: new Date().toISOString().split('T')[0],
            estado: 'PENDIENTE',
            notas: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (transferencia: Transferencia) => {
        setSelectedTransferencia(transferencia);
        setFormData({
            cuenta_origen_id: transferencia.cuenta_origen_id.toString(),
            cuenta_destino_id: transferencia.cuenta_destino_id.toString(),
            monto: transferencia.monto.toString(),
            concepto: transferencia.concepto,
            fecha: transferencia.fecha,
            estado: transferencia.estado,
            notas: transferencia.notas || ''
        });
        setIsModalOpen(true);
    };

    const handleView = (transferencia: Transferencia) => {
        setSelectedTransferencia(transferencia);
        setIsViewModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que las cuentas sean diferentes
        if (formData.cuenta_origen_id === formData.cuenta_destino_id) {
            notifications.error('Las cuentas de origen y destino deben ser diferentes');
            return;
        }

        try {
            notifications.loading(selectedTransferencia ? 'Actualizando transferencia...' : 'Creando transferencia...');

            const transferenciaData = {
                cuenta_origen_id: parseInt(formData.cuenta_origen_id),
                cuenta_destino_id: parseInt(formData.cuenta_destino_id),
                monto: formData.monto.toString(),
                concepto: formData.concepto,
                fecha: formData.fecha,
                estado: formData.estado,
                notas: formData.notas || null
            };

            // Solo agregar usuario_id para crear nuevas transferencias
            if (!selectedTransferencia) {
                (transferenciaData as any).usuario_id = 1;
            }

            const url = selectedTransferencia
                ? `/api/v1/transferencias/${selectedTransferencia.id}`
                : '/api/v1/transferencias';

            const method = selectedTransferencia ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transferenciaData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar la transferencia');
            }

            notifications.close();
            notifications.toast.success(
                selectedTransferencia ? 'Transferencia actualizada correctamente' : 'Transferencia creada correctamente'
            );

            await loadTransferencias();
            setIsModalOpen(false);
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al guardar transferencia');
        }
    };

    const handleCompletar = async (id: number) => {
        try {
            notifications.loading('Completando transferencia...');

            const response = await fetch(`/api/v1/transferencias/${id}/completar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al completar la transferencia');
            }

            notifications.close();
            notifications.toast.success('Transferencia completada correctamente');
            await loadTransferencias();
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al completar transferencia');
        }
    };

    const handleMarcarPendiente = async (id: number) => {
        try {
            notifications.loading('Marcando como pendiente...');

            const response = await fetch(`/api/v1/transferencias/${id}/marcar-pendiente`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al marcar como pendiente');
            }

            notifications.close();
            notifications.toast.success('Transferencia marcada como pendiente');
            await loadTransferencias();
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al marcar como pendiente');
        }
    };

    const handleDelete = async (transferencia: Transferencia) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la transferencia "${transferencia.concepto}"?`)) {
            return;
        }

        try {
            notifications.loading('Eliminando transferencia...');

            const response = await fetch(`/api/v1/transferencias/${transferencia.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la transferencia');
            }

            notifications.close();
            notifications.toast.success('Transferencia eliminada correctamente');
            await loadTransferencias();
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al eliminar transferencia');
        }
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' Gs';
    };

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PY');
    };

    // Filtrar transferencias
    const transferenciasFilter = transferencias.filter(transferencia => {
        const matchesMes = !filtroMes || transferencia.fecha.startsWith(filtroMes);
        const matchesCuenta = !filtroCuenta || 
            transferencia.cuenta_origen_id.toString() === filtroCuenta || 
            transferencia.cuenta_destino_id.toString() === filtroCuenta;
        return matchesMes && matchesCuenta;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                    Transferencias
                </h1>
                <Button onClick={handleNew}>
                    Nueva Transferencia
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mes
                            </label>
                            <input
                                type="month"
                                value={filtroMes}
                                onChange={(e) => setFiltroMes(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cuenta
                            </label>
                            <select
                                value={filtroCuenta}
                                onChange={(e) => setFiltroCuenta(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            >
                                <option value="">Todas las cuentas</option>
                                {cuentas.map(cuenta => (
                                    <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={loadTransferencias}
                                variant="secondary"
                                className="w-full"
                            >
                                Aplicar Filtros
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tabla de transferencias */}
            <Card>
                <CardHeader>
                    <CardTitle>Transferencias ({transferenciasFilter.length})</CardTitle>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead>Origen</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    Cargando transferencias...
                                </TableCell>
                            </TableRow>
                        ) : transferenciasFilter.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No tienes transferencias registradas. ¡Crea tu primera transferencia!
                                </TableCell>
                            </TableRow>
                        ) : (
                            transferenciasFilter
                                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                                .map((transferencia) => (
                                    <TableRow key={transferencia.id}>
                                        <TableCell className="text-gray-600 dark:text-gray-400">{formatDate(transferencia.fecha)}</TableCell>
                                        <TableCell className="font-medium text-gray-900 dark:text-white">{transferencia.concepto}</TableCell>
                                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">{transferencia.cuenta_origen_nombre}</TableCell>
                                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">{transferencia.cuenta_destino_nombre}</TableCell>
                                        <TableCell className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(transferencia.monto)}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                transferencia.estado === 'COMPLETADA' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                                {transferencia.estado === 'COMPLETADA' ? 'Completada' : 'Pendiente'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleView(transferencia)}
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
                                                    onClick={() => handleEdit(transferencia)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Button>
                                                {transferencia.estado === 'PENDIENTE' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCompletar(transferencia.id)}
                                                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        title="Completar transferencia"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarcarPendiente(transferencia.id)}
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
                                                    onClick={() => handleDelete(transferencia)}
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

            {/* Modal Crear/Editar */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedTransferencia ? 'Editar Transferencia' : 'Nueva Transferencia'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cuenta Origen
                            </label>
                            <select
                                value={formData.cuenta_origen_id}
                                onChange={(e) => setFormData({ ...formData, cuenta_origen_id: e.target.value })}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                required
                            >
                                <option value="">Seleccionar cuenta origen</option>
                                {cuentas.map(cuenta => (
                                    <option key={cuenta.id} value={cuenta.id}>
                                        {cuenta.nombre} ({formatCurrency(cuenta.saldo_inicial)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cuenta Destino
                            </label>
                            <select
                                value={formData.cuenta_destino_id}
                                onChange={(e) => setFormData({ ...formData, cuenta_destino_id: e.target.value })}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                required
                            >
                                <option value="">Seleccionar cuenta destino</option>
                                {cuentas.map(cuenta => (
                                    <option key={cuenta.id} value={cuenta.id}>
                                        {cuenta.nombre} ({formatCurrency(cuenta.saldo_inicial)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Monto"
                        type="number"
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                        placeholder="0"
                        required
                    />

                    <Input
                        label="Concepto"
                        value={formData.concepto}
                        onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                        placeholder="Ej. Transferencia para pago de servicios"
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Estado
                        </label>
                        <select
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'PENDIENTE' | 'COMPLETADA' })}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            required
                        >
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="COMPLETADA">Completada</option>
                        </select>
                        
                        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                            <div className="flex items-start">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <p><strong>Estado PENDIENTE:</strong> La transferencia se programa pero no se ejecuta hasta marcarla como completada.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notas (opcional)
                        </label>
                        <textarea
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            rows={3}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Notas adicionales sobre la transferencia..."
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
                            {selectedTransferencia ? 'Actualizar' : 'Crear'} Transferencia
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Ver Detalles */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Detalles de la Transferencia"
                size="md"
            >
                {selectedTransferencia && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Fecha
                                </label>
                                <p className="text-lg text-gray-900 dark:text-white">
                                    {formatDate(selectedTransferencia.fecha)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Monto
                                </label>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(selectedTransferencia.monto)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Estado
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedTransferencia.estado === 'COMPLETADA' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                }`}>
                                    {selectedTransferencia.estado === 'COMPLETADA' ? 'Completada' : 'Pendiente'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Concepto
                            </label>
                            <p className="text-lg text-gray-900 dark:text-white">
                                {selectedTransferencia.concepto}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Cuenta Origen
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {selectedTransferencia.cuenta_origen_nombre}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Cuenta Destino
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {selectedTransferencia.cuenta_destino_nombre}
                                </p>
                            </div>
                        </div>

                        {selectedTransferencia.notas && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Notas
                                </label>
                                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                    {selectedTransferencia.notas}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div>
                                <span className="block font-medium">Creado:</span>
                                {new Date(selectedTransferencia.creado_en).toLocaleString('es-PY')}
                            </div>
                            <div>
                                <span className="block font-medium">Actualizado:</span>
                                {new Date(selectedTransferencia.actualizado_en).toLocaleString('es-PY')}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}