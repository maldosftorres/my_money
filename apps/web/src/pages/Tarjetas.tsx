import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input, MetricCard } from '../components/ui';
import { notifications } from '../utils/notifications';
import { CreditCard, FileText, Plus, Minus } from 'lucide-react';

type TipoTarjeta = 'CREDITO' | 'DEBITO' | 'VIRTUAL' | 'PREPAGA';

interface Tarjeta {
    id: number;
    usuario_id: number;
    cuenta_id: number;
    nombre: string;
    tipo: TipoTarjeta;
    limite: number | null;
    saldo_utilizado: number;
    saldo_disponible: number | null;
    porcentaje_utilizado: number;
    moneda: string;
    numero_tarjeta: string | null;
    banco_emisor: string | null;
    dia_vencimiento: number | null;
    activa: boolean;
    creado_en: string;
    actualizado_en: string;
    cuenta_asociada_nombre?: string;
    cuenta_asociada_tipo?: string;
    proximo_vencimiento?: string;
    estado_tarjeta?: 'ACTIVA' | 'INACTIVA' | 'LIMITE_ALTO' | 'LIMITE_MEDIO';
}

interface Cuenta {
    id: number;
    nombre: string;
    tipo: string;
}

const tiposTarjeta = [
    { value: 'CREDITO', label: 'Crédito' },
    { value: 'DEBITO', label: 'Débito' },
    { value: 'VIRTUAL', label: 'Virtual' },
    { value: 'PREPAGA', label: 'Prepaga' }
];

export default function Tarjetas() {
    const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
    const [cuentas, setCuentas] = useState<Cuenta[]>([]);
    const [loading, setLoading] = useState(true);

    const [vistaActual, setVistaActual] = useState<'tarjetas' | 'gastos' | 'pagos'>('tarjetas');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tipoModal, setTipoModal] = useState<'tarjeta' | 'gasto' | 'pago'>('tarjeta');
    const [selectedTarjeta, setSelectedTarjeta] = useState<Tarjeta | null>(null);

    const [formDataTarjeta, setFormDataTarjeta] = useState({
        nombre: '',
        cuenta_id: '',
        tipo: 'CREDITO' as TipoTarjeta,
        limite: '',
        dia_vencimiento: '',
        numero_tarjeta: '',
        banco_emisor: '',
        activa: true
    });

    const [formDataGasto, setFormDataGasto] = useState({
        tarjeta_id: '',
        concepto: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        notas: ''
    });

    const [formDataPago, setFormDataPago] = useState({
        tarjeta_id: '',
        cuenta_origen_id: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        concepto: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        loadTarjetas();
        loadCuentas();
    }, []);

    const loadTarjetas = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/tarjetas?usuario_id=1');
            if (!response.ok) {
                throw new Error('Error al cargar tarjetas');
            }
            const data = await response.json();
            setTarjetas(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al cargar tarjetas');
        } finally {
            setLoading(false);
        }
    };

    const loadCuentas = async () => {
        try {
            const response = await fetch('/api/v1/cuentas?usuario_id=1');
            if (!response.ok) {
                throw new Error('Error al cargar cuentas');
            }
            const data = await response.json();
            setCuentas(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al cargar cuentas');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' Gs';
    };



    const getTipoColor = (tipo: TipoTarjeta) => {
        const colors = {
            'CREDITO': 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
            'DEBITO': 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
            'VIRTUAL': 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
            'PREPAGA': 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
        };
        return colors[tipo] || 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300';
    };

    const getEstadoColor = (estado?: string) => {
        const colors = {
            'ACTIVA': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'LIMITE_ALTO': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            'LIMITE_MEDIO': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'INACTIVA': 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
        };
        return colors[estado as keyof typeof colors] || colors['ACTIVA'];
    };

    // Métricas calculadas
    const tarjetasActivas = tarjetas.filter(t => t.activa).length;
    const saldoTotalUtilizado = tarjetas.reduce((sum, t) => sum + t.saldo_utilizado, 0);
    const limiteTotalDisponible = tarjetas.reduce((sum, t) => sum + (t.saldo_disponible || 0), 0);

    const handleNewTarjeta = () => {
        setSelectedTarjeta(null);
        setFormDataTarjeta({
            nombre: '',
            cuenta_id: '',
            tipo: 'CREDITO',
            limite: '',
            dia_vencimiento: '',
            numero_tarjeta: '',
            banco_emisor: '',
            activa: true
        });
        setTipoModal('tarjeta');
        setIsModalOpen(true);
    };

    const handleEditTarjeta = (tarjeta: Tarjeta) => {
        setSelectedTarjeta(tarjeta);
        setFormDataTarjeta({
            nombre: tarjeta.nombre,
            cuenta_id: tarjeta.cuenta_id.toString(),
            tipo: tarjeta.tipo,
            limite: tarjeta.limite?.toString() || '',
            dia_vencimiento: tarjeta.dia_vencimiento?.toString() || '',
            numero_tarjeta: tarjeta.numero_tarjeta || '',
            banco_emisor: tarjeta.banco_emisor || '',
            activa: tarjeta.activa
        });
        setTipoModal('tarjeta');
        setIsModalOpen(true);
    };

    const handleNewGasto = () => {
        setFormDataGasto({
            tarjeta_id: '',
            concepto: '',
            monto: '',
            fecha: new Date().toISOString().split('T')[0],
            notas: ''
        });
        setTipoModal('gasto');
        setIsModalOpen(true);
    };

    const handleNewPago = () => {
        setFormDataPago({
            tarjeta_id: '',
            cuenta_origen_id: '',
            monto: '',
            fecha: new Date().toISOString().split('T')[0],
            concepto: ''
        });
        setTipoModal('pago');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (tipoModal === 'tarjeta') {
                notifications.loading(selectedTarjeta ? 'Actualizando tarjeta...' : 'Creando tarjeta...');
                
                const tarjetaData = {
                    usuario_id: 1,
                    cuenta_id: parseInt(formDataTarjeta.cuenta_id),
                    nombre: formDataTarjeta.nombre,
                    tipo: formDataTarjeta.tipo,
                    limite: formDataTarjeta.limite ? parseFloat(formDataTarjeta.limite) : null,
                    dia_vencimiento: formDataTarjeta.dia_vencimiento ? parseInt(formDataTarjeta.dia_vencimiento) : null,
                    numero_tarjeta: formDataTarjeta.numero_tarjeta || null,
                    banco_emisor: formDataTarjeta.banco_emisor || null,
                    activa: formDataTarjeta.activa
                };

                const url = selectedTarjeta 
                    ? `/api/v1/tarjetas/${selectedTarjeta.id}`
                    : '/api/v1/tarjetas';
                
                const method = selectedTarjeta ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tarjetaData)
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error);
                }

                notifications.close();
                notifications.toast.success(
                    selectedTarjeta ? 'Tarjeta actualizada correctamente' : 'Tarjeta creada correctamente'
                );
                
                await loadTarjetas();
                setIsModalOpen(false);
                
            } else if (tipoModal === 'gasto') {
                notifications.loading('Registrando gasto...');
                
                const gastoData = {
                    usuario_id: 1,
                    tarjeta_id: parseInt(formDataGasto.tarjeta_id),
                    concepto: formDataGasto.concepto,
                    monto: parseFloat(formDataGasto.monto),
                    fecha: formDataGasto.fecha,
                    notas: formDataGasto.notas || null
                };

                const response = await fetch('/api/v1/tarjetas/gasto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gastoData)
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error);
                }

                const result = await response.json();
                
                notifications.close();
                notifications.toast.success(result.mensaje);
                
                await loadTarjetas();
                setIsModalOpen(false);
                
            } else if (tipoModal === 'pago') {
                notifications.loading('Procesando pago...');
                
                const pagoData = {
                    usuario_id: 1,
                    tarjeta_id: parseInt(formDataPago.tarjeta_id),
                    cuenta_origen_id: parseInt(formDataPago.cuenta_origen_id),
                    monto: parseFloat(formDataPago.monto),
                    fecha: formDataPago.fecha,
                    concepto: formDataPago.concepto || null
                };

                const response = await fetch('/api/v1/tarjetas/pago', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pagoData)
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error);
                }

                const result = await response.json();
                
                notifications.close();
                notifications.toast.success(result.mensaje);
                
                await loadTarjetas();
                setIsModalOpen(false);
            }
        } catch (err) {
            notifications.close();
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            notifications.error(errorMessage, 'Error al procesar solicitud');
        }
    };

    const handleDeleteTarjeta = async (tarjeta: Tarjeta) => {
        const result = await notifications.confirmDelete(`la tarjeta "${tarjeta.nombre}"`);
        
        if (result.isConfirmed) {
            try {
                notifications.loading('Eliminando tarjeta...');
                
                const response = await fetch(`/api/v1/tarjetas/${tarjeta.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error);
                }

                notifications.close();
                notifications.toast.success('Tarjeta eliminada correctamente');
                await loadTarjetas();
            } catch (err) {
                notifications.close();
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                notifications.error(errorMessage, 'Error al eliminar tarjeta');
            }
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
                        Tarjetas Modernizadas
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200">
                        <Button
                            onClick={() => setVistaActual('tarjetas')}
                            variant={vistaActual === 'tarjetas' ? 'primary' : 'ghost'}
                            size="sm"
                            className="rounded-r-none border-r border-gray-300 dark:border-gray-600"
                        >
                            Tarjetas
                        </Button>
                        <Button
                            onClick={() => setVistaActual('gastos')}
                            variant={vistaActual === 'gastos' ? 'primary' : 'ghost'}
                            size="sm"
                            className="rounded-none border-r border-gray-300 dark:border-gray-600"
                        >
                            Gastos
                        </Button>
                        <Button
                            onClick={() => setVistaActual('pagos')}
                            variant={vistaActual === 'pagos' ? 'primary' : 'ghost'}
                            size="sm"
                            className="rounded-l-none"
                        >
                            Pagos
                        </Button>
                    </div>
                    <Button onClick={() => {
                        if (vistaActual === 'tarjetas') handleNewTarjeta();
                        else if (vistaActual === 'gastos') handleNewGasto();
                        else handleNewPago();
                    }}>
                        {vistaActual === 'tarjetas' ? 'Nueva Tarjeta' : 
                         vistaActual === 'gastos' ? 'Nuevo Gasto' : 'Nuevo Pago'}
                    </Button>
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                    title="Tarjetas Activas"
                    value={tarjetasActivas.toString()}
                    icon={<CreditCard className="w-5 h-5" />}
                    iconColor="blue"
                />
                <MetricCard
                    title="Saldo Utilizado"
                    value={formatCurrency(saldoTotalUtilizado)}
                    icon={<Minus className="w-5 h-5" />}
                    iconColor="red"
                />
                <MetricCard
                    title="Límite Disponible"
                    value={formatCurrency(limiteTotalDisponible)}
                    icon={<Plus className="w-5 h-5" />}
                    iconColor="green"
                />
                <MetricCard
                    title="Total Tarjetas"
                    value={tarjetas.length.toString()}
                    icon={<FileText className="w-5 h-5" />}
                    iconColor="purple"
                />
            </div>

            {/* Vista de Tarjetas */}
            {vistaActual === 'tarjetas' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Mis Tarjetas</CardTitle>
                    </CardHeader>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Cuenta</TableHead>
                                <TableHead>Límite / Utilizado</TableHead>
                                <TableHead>Disponible</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        Cargando tarjetas...
                                    </TableCell>
                                </TableRow>
                            ) : tarjetas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No tienes tarjetas registradas. ¡Agrega tu primera tarjeta!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tarjetas.map((tarjeta) => (
                                    <TableRow key={tarjeta.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div>{tarjeta.nombre}</div>
                                                {tarjeta.numero_tarjeta && (
                                                    <div className="text-xs text-gray-500">**** {tarjeta.numero_tarjeta}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(tarjeta.tipo)}`}>
                                                {tarjeta.tipo}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div>
                                                <div>{tarjeta.cuenta_asociada_nombre}</div>
                                                {tarjeta.banco_emisor && (
                                                    <div className="text-xs text-gray-500">{tarjeta.banco_emisor}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {tarjeta.limite ? (
                                                <div className="text-sm">
                                                    <div>{formatCurrency(tarjeta.limite)}</div>
                                                    <div className="text-red-600">-{formatCurrency(tarjeta.saldo_utilizado)}</div>
                                                    <div className="text-xs text-gray-500">{tarjeta.porcentaje_utilizado}% usado</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">Sin límite</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {tarjeta.saldo_disponible !== null ? (
                                                <span className="text-green-600 font-medium">
                                                    {formatCurrency(tarjeta.saldo_disponible)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(tarjeta.estado_tarjeta)}`}>
                                                {tarjeta.estado_tarjeta === 'LIMITE_ALTO' ? 'Límite Alto' :
                                                 tarjeta.estado_tarjeta === 'LIMITE_MEDIO' ? 'Límite Medio' :
                                                 tarjeta.estado_tarjeta || 'Activa'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditTarjeta(tarjeta)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteTarjeta(tarjeta)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
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
            )}

            {/* Vista de Gastos */}
            {vistaActual === 'gastos' && (
                <GastosView 
                    onNewGasto={handleNewGasto}
                    key="gastos-view"
                />
            )}

            {/* Vista de Pagos */}
            {vistaActual === 'pagos' && (
                <PagosView 
                    onNewPago={handleNewPago}
                    key="pagos-view"
                />
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    tipoModal === 'tarjeta' ? (selectedTarjeta ? 'Editar Tarjeta' : 'Nueva Tarjeta') :
                    tipoModal === 'gasto' ? 'Nuevo Gasto con Tarjeta' :
                    'Nuevo Pago de Tarjeta'
                }
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {tipoModal === 'tarjeta' ? (
                        <>
                            <Input
                                label="Nombre de la tarjeta"
                                value={formDataTarjeta.nombre}
                                onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, nombre: e.target.value })}
                                placeholder="Ej. Visa Platinum"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo de tarjeta
                                </label>
                                <select
                                    value={formDataTarjeta.tipo}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, tipo: e.target.value as TipoTarjeta })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    required
                                >
                                    {tiposTarjeta.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Cuenta asociada
                                </label>
                                <select
                                    value={formDataTarjeta.cuenta_id}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, cuenta_id: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Seleccionar cuenta</option>
                                    {cuentas.map(cuenta => (
                                        <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {(formDataTarjeta.tipo === 'CREDITO' || formDataTarjeta.tipo === 'VIRTUAL') && (
                                <Input
                                    label="Límite de crédito"
                                    type="number"
                                    value={formDataTarjeta.limite}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, limite: e.target.value })}
                                    placeholder="0"
                                    required
                                />
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Día de vencimiento (opcional)"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={formDataTarjeta.dia_vencimiento}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, dia_vencimiento: e.target.value })}
                                    placeholder="15"
                                />

                                <Input
                                    label="Últimos 4 dígitos (opcional)"
                                    value={formDataTarjeta.numero_tarjeta}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, numero_tarjeta: e.target.value })}
                                    placeholder="1234"
                                    maxLength={4}
                                />
                            </div>

                            <Input
                                label="Banco emisor (opcional)"
                                value={formDataTarjeta.banco_emisor}
                                onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, banco_emisor: e.target.value })}
                                placeholder="Ej. Banco Nacional"
                            />

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="activa"
                                    checked={formDataTarjeta.activa}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, activa: e.target.checked })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <label htmlFor="activa" className="ml-2 block text-sm text-gray-900 dark:text-white">
                                    Tarjeta activa
                                </label>
                            </div>
                        </>
                    ) : tipoModal === 'gasto' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tarjeta
                                </label>
                                <select
                                    value={formDataGasto.tarjeta_id}
                                    onChange={(e) => setFormDataGasto({ ...formDataGasto, tarjeta_id: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Seleccionar tarjeta</option>
                                    {tarjetas.filter(t => t.activa).map(tarjeta => (
                                        <option key={tarjeta.id} value={tarjeta.id}>
                                            {tarjeta.nombre} ({tarjeta.tipo})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Concepto del gasto"
                                value={formDataGasto.concepto}
                                onChange={(e) => setFormDataGasto({ ...formDataGasto, concepto: e.target.value })}
                                placeholder="Ej. Supermercado Jumbo"
                                required
                            />

                            <Input
                                label="Monto"
                                type="number"
                                value={formDataGasto.monto}
                                onChange={(e) => setFormDataGasto({ ...formDataGasto, monto: e.target.value })}
                                placeholder="0"
                                required
                            />

                            <Input
                                label="Fecha"
                                type="date"
                                value={formDataGasto.fecha}
                                onChange={(e) => setFormDataGasto({ ...formDataGasto, fecha: e.target.value })}
                                required
                            />

                            <Input
                                label="Notas (opcional)"
                                value={formDataGasto.notas}
                                onChange={(e) => setFormDataGasto({ ...formDataGasto, notas: e.target.value })}
                                placeholder="Información adicional"
                            />
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tarjeta a pagar
                                </label>
                                <select
                                    value={formDataPago.tarjeta_id}
                                    onChange={(e) => setFormDataPago({ ...formDataPago, tarjeta_id: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Seleccionar tarjeta</option>
                                    {tarjetas.filter(t => t.activa && t.saldo_utilizado > 0).map(tarjeta => (
                                        <option key={tarjeta.id} value={tarjeta.id}>
                                            {tarjeta.nombre} (Debe: {formatCurrency(tarjeta.saldo_utilizado)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Cuenta de origen
                                </label>
                                <select
                                    value={formDataPago.cuenta_origen_id}
                                    onChange={(e) => setFormDataPago({ ...formDataPago, cuenta_origen_id: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Seleccionar cuenta</option>
                                    {cuentas.map(cuenta => (
                                        <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Monto a pagar"
                                type="number"
                                value={formDataPago.monto}
                                onChange={(e) => setFormDataPago({ ...formDataPago, monto: e.target.value })}
                                placeholder="0"
                                required
                            />

                            <Input
                                label="Fecha de pago"
                                type="date"
                                value={formDataPago.fecha}
                                onChange={(e) => setFormDataPago({ ...formDataPago, fecha: e.target.value })}
                                required
                            />

                            <Input
                                label="Concepto (opcional)"
                                value={formDataPago.concepto}
                                onChange={(e) => setFormDataPago({ ...formDataPago, concepto: e.target.value })}
                                placeholder="Pago tarjeta"
                            />
                        </>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {tipoModal === 'tarjeta' ? (selectedTarjeta ? 'Actualizar' : 'Crear') + ' Tarjeta' :
                             tipoModal === 'gasto' ? 'Registrar Gasto' :
                             'Procesar Pago'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

// Componente para vista de gastos
function GastosView({ onNewGasto }: { onNewGasto: () => void }) {
    const [gastos, setGastos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGastos();
    }, []);

    const loadGastos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/movimientos?usuarioId=1&tipo=GASTO_TARJETA');
            if (!response.ok) throw new Error('Error al cargar gastos');
            const data = await response.json();
            setGastos(data);
        } catch (err) {
            console.error('Error cargando gastos:', err);
            notifications.error('Error al cargar gastos con tarjeta');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num) + ' Gs';
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-PY');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Gastos con Tarjeta</CardTitle>
                    <Button onClick={onNewGasto}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Gasto
                    </Button>
                </div>
            </CardHeader>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tarjeta</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                Cargando gastos...
                            </TableCell>
                        </TableRow>
                    ) : gastos.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                No hay gastos con tarjeta registrados
                            </TableCell>
                        </TableRow>
                    ) : (
                        gastos.map((gasto) => (
                            <TableRow key={gasto.id}>
                                <TableCell>{formatDate(gasto.fecha)}</TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{gasto.cuenta_origen_nombre}</div>
                                        <div className="text-xs text-gray-500">ID: {gasto.tarjeta_id || 'N/A'}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="max-w-xs">
                                        <div className="truncate">{gasto.descripcion}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-red-600 font-medium">
                                        -{formatCurrency(gasto.monto)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Cargado
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
}

// Componente para vista de pagos
function PagosView({ onNewPago }: { onNewPago: () => void }) {
    const [pagos, setPagos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPagos();
    }, []);

    const loadPagos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/movimientos?usuarioId=1&tipo=PAGO_TARJETA');
            if (!response.ok) throw new Error('Error al cargar pagos');
            const data = await response.json();
            setPagos(data);
        } catch (err) {
            console.error('Error cargando pagos:', err);
            notifications.error('Error al cargar pagos de tarjeta');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number | string) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-PY', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num) + ' Gs';
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-PY');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Pagos de Tarjeta</CardTitle>
                    <Button onClick={onNewPago}>
                        <Minus className="w-4 h-4 mr-2" />
                        Nuevo Pago
                    </Button>
                </div>
            </CardHeader>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tarjeta</TableHead>
                        <TableHead>Cuenta Origen</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                Cargando pagos...
                            </TableCell>
                        </TableRow>
                    ) : pagos.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                No hay pagos de tarjeta registrados
                            </TableCell>
                        </TableRow>
                    ) : (
                        pagos.map((pago) => (
                            <TableRow key={pago.id}>
                                <TableCell>{formatDate(pago.fecha)}</TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">Tarjeta ID: {pago.tarjeta_id}</div>
                                        <div className="text-xs text-gray-500">Pago realizado</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{pago.cuenta_origen_nombre}</div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-green-600 font-medium">
                                        {formatCurrency(pago.monto)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Procesado
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
}