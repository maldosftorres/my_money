import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input, MetricCard } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { Building2, DollarSign, CheckCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { notifications } from '../utils/notifications';

interface Cuenta {
    id: number;
    usuario_id: number;
    nombre: string;
    tipo: 'EFECTIVO' | 'BANCO' | 'TARJETA' | 'AHORRO' | 'COOPERATIVA' | 'OTRA';
    saldo_inicial: string;
    saldo_actual?: number;
    moneda: string;
    activa: boolean;
    creado_en: string;
    actualizado_en: string;
}

interface FormData {
    nombre: string;
    tipo: Cuenta['tipo'];
    saldo_inicial: string;
    moneda: string;
    activa: boolean;
}

export default function Cuentas() {
    const { user } = useAuth();
    const [cuentas, setCuentas] = useState<Cuenta[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCuenta, setSelectedCuenta] = useState<Cuenta | null>(null);
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        tipo: 'BANCO',
        saldo_inicial: '',
        moneda: 'Gs',
        activa: true
    });

    useEffect(() => {
        if (user) {
            loadCuentas();
        }
    }, [user]);

    const loadCuentas = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/cuentas?usuario_id=${user?.id}`);
            if (!response.ok) {
                throw new Error('Error al cargar las cuentas');
            }
            const data = await response.json();
            // Simplificar: usar solo saldo inicial por ahora
            const cuentasSimples = data.map((cuenta: Cuenta) => ({
                ...cuenta,
                saldo_actual: parseFloat(cuenta.saldo_inicial)
            }));
            setCuentas(cuentasSimples);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al cargar cuentas');
            setCuentas([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numAmount) + ' Gs';
    };

    const getTipoLabel = (tipo: string) => {
        const labels = {
            'EFECTIVO': 'Efectivo',
            'BANCO': 'Banco',
            'TARJETA': 'Tarjeta',
            'AHORRO': 'Ahorro',
            'COOPERATIVA': 'Cooperativa',
            'OTRA': 'Otra'
        };
        return labels[tipo as keyof typeof labels] || tipo;
    };

    const getTipoColor = (tipo: string) => {
        const colors = {
            'EFECTIVO': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'BANCO': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            'TARJETA': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            'AHORRO': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'COOPERATIVA': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
            'OTRA': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
        };
        return colors[tipo as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    };

    const handleEdit = (cuenta: Cuenta) => {
        setSelectedCuenta(cuenta);
        setFormData({
            nombre: cuenta.nombre,
            tipo: cuenta.tipo,
            saldo_inicial: cuenta.saldo_inicial,
            moneda: cuenta.moneda,
            activa: cuenta.activa
        });
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedCuenta(null);
        setFormData({
            nombre: '',
            tipo: 'BANCO',
            saldo_inicial: '',
            moneda: 'Gs',
            activa: true
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            notifications.loading(selectedCuenta ? 'Actualizando cuenta...' : 'Creando cuenta...');
            
            const payload = {
                ...formData,
                usuario_id: user?.id
            };

            let response;
            if (selectedCuenta) {
                response = await fetch(`/api/v1/cuentas/${selectedCuenta.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch('/api/v1/cuentas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                throw new Error('Error al guardar la cuenta');
            }

            notifications.close();
            notifications.toast.success(
                selectedCuenta ? 'Cuenta actualizada correctamente' : 'Cuenta creada correctamente'
            );

            await loadCuentas();
            setIsModalOpen(false);
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al guardar cuenta');
        }
    };

    const handleDeleteCuenta = async (cuenta: Cuenta) => {
        const result = await notifications.confirmDelete(`la cuenta "${cuenta.nombre}"`);
        
        if (result.isConfirmed) {
            try {
                notifications.loading('Eliminando cuenta...');
                
                const response = await fetch(`/api/v1/cuentas/${cuenta.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar la cuenta');
                }

                notifications.close();
                notifications.toast.success('Cuenta eliminada correctamente');
                await loadCuentas();
            } catch (err) {
                notifications.close();
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                notifications.error(errorMessage, 'Error al eliminar cuenta');
            }
        }
    };

    const handleToggleStatus = async (cuenta: Cuenta) => {
        const action = cuenta.activa ? 'desactivar' : 'activar';
        const result = await notifications.confirm(
            `¿Estás seguro de que quieres ${action} la cuenta "${cuenta.nombre}"?`,
            `${action.charAt(0).toUpperCase() + action.slice(1)} cuenta`,
            `Sí, ${action}`,
            'Cancelar'
        );
        
        if (result.isConfirmed) {
            try {
                notifications.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}ando cuenta...`);
                
                const response = await fetch(`/api/v1/cuentas/${cuenta.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activa: !cuenta.activa })
                });

                if (!response.ok) {
                    throw new Error(`Error al ${action} la cuenta`);
                }

                notifications.close();
                notifications.toast.success(`Cuenta ${cuenta.activa ? 'desactivada' : 'activada'} correctamente`);
                await loadCuentas();
            } catch (err) {
                notifications.close();
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                notifications.error(errorMessage, `Error al ${action} cuenta`);
            }
        }
    };

    const totalSaldo = cuentas.reduce((sum, cuenta) => sum + (cuenta.saldo_actual || 0), 0);
    const cuentasActivas = cuentas.filter(cuenta => cuenta.activa).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
                Cuentas
            </h1>
                </div>
                <Button onClick={handleNew}>
                    Nueva Cuenta
                </Button>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                    title="Saldo Total"
                    value={formatCurrency(totalSaldo)}
                    icon={<DollarSign className="w-5 h-5" />}
                    iconColor="blue"
                    valueColor="default"
                />

                <MetricCard
                    title="Cuentas Activas"
                    value={cuentasActivas}
                    icon={<CheckCircle className="w-5 h-5" />}
                    iconColor="green"
                    valueColor="default"
                />

                <MetricCard
                    title="Total Cuentas"
                    value={cuentas.length}
                    icon={<Building2 className="w-5 h-5" />}
                    iconColor="purple"
                    valueColor="default"
                />
            </div>

            {/* Lista de Cuentas */}
            <Card>
                <CardHeader>
                    <CardTitle>Mis Cuentas</CardTitle>
                </CardHeader>

                {cuentas.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No hay cuentas registradas</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Crea tu primera cuenta para comenzar</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Saldo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cuentas.map((cuenta) => {
                                const saldoInicial = parseFloat(cuenta.saldo_inicial);
                                return (
                                    <TableRow key={cuenta.id}>
                                        <TableCell className="font-medium">{cuenta.nombre}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(cuenta.tipo)}`}>
                                                {getTipoLabel(cuenta.tipo)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(saldoInicial)}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${cuenta.activa ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                }`}>
                                                {cuenta.activa ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(cuenta)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(cuenta)}
                                                    className={`${cuenta.activa 
                                                        ? 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                                                        : 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    }`}
                                                    title={cuenta.activa ? 'Desactivar cuenta' : 'Activar cuenta'}
                                                >
                                                    {cuenta.activa ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCuenta(cuenta)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedCuenta ? 'Editar Cuenta' : 'Nueva Cuenta'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre de la cuenta"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej. Cuenta Corriente Principal"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                            Tipo de cuenta
                        </label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Cuenta['tipo'] })}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                            required
                        >
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="BANCO">Banco</option>
                            <option value="TARJETA">Tarjeta</option>
                            <option value="AHORRO">Ahorro</option>
                            <option value="COOPERATIVA">Cooperativa</option>
                            <option value="OTRA">Otra</option>
                        </select>
                    </div>

                    <Input
                        label="Saldo inicial"
                        type="number"
                        value={formData.saldo_inicial}
                        onChange={(e) => setFormData({ ...formData, saldo_inicial: e.target.value })}
                        placeholder="0"
                        required
                    />

                    <Input
                        label="Moneda"
                        value={formData.moneda}
                        onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                        placeholder="CLP"
                        required
                    />

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="activa"
                            checked={formData.activa}
                            onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                            className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-2 transition-colors duration-200"
                        />
                        <label htmlFor="activa" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                            Cuenta activa
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
                            {selectedCuenta ? 'Actualizar' : 'Crear'} Cuenta
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}