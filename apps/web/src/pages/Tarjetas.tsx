import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input, MetricCard, InfoIcon } from '../components/ui';
import { notifications } from '../utils/notifications';
import { CreditCard, DollarSign, FileText } from 'lucide-react';

interface Tarjeta {
    id: number;
    usuario_id: number;
    cuenta_id: number;
    nombre: string;
    dia_corte?: number;
    dia_vencimiento?: number;
    activa: boolean;
    creado_en: string;
    actualizado_en: string;
}

interface Cuenta {
    id: number;
    nombre: string;
}

interface ConsumoTarjeta {
    id: number;
    tarjeta_id: number;
    tarjeta_nombre: string;
    descripcion: string;
    monto: number;
    fecha: string;
    categoria: string;
    cuotas: number;
    creado_en: string;
}

const categorias = [
    'Alimentación',
    'Tecnología',
    'Entretenimiento',
    'Ropa',
    'Salud',
    'Transporte',
    'Hogar',
    'Otros'
];

export default function Tarjetas() {
    const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
    const [cuentas, setCuentas] = useState<Cuenta[]>([]);
    const [consumos] = useState<ConsumoTarjeta[]>([]);
    const [loading, setLoading] = useState(true);

    const [vistaActual, setVistaActual] = useState<'tarjetas' | 'consumos'>('tarjetas');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tipoModal, setTipoModal] = useState<'tarjeta' | 'consumo'>('tarjeta');
    const [selectedTarjeta, setSelectedTarjeta] = useState<Tarjeta | null>(null);
    const [selectedConsumo, setSelectedConsumo] = useState<ConsumoTarjeta | null>(null);
    const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7));

    const [formDataTarjeta, setFormDataTarjeta] = useState({
        nombre: '',
        cuenta_id: '',
        dia_corte: '',
        dia_vencimiento: '',
        activa: true
    });

    const [formDataConsumo, setFormDataConsumo] = useState({
        tarjeta_id: '',
        descripcion: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        categoria: '',
        cuotas: '1'
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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-PY');
    };

    const getCategoriaColor = (categoria: string) => {
        const colors = {
            'Alimentación': 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
            'Tecnología': 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700',
            'Entretenimiento': 'bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-700',
            'Ropa': 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-700',
            'Salud': 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700',
            'Transporte': 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700',
            'Hogar': 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
            'Otros': 'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
        };
        return colors[categoria as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    };

    const consumosFiltrados = consumos.filter(consumo =>
        !filtroMes || consumo.fecha.startsWith(filtroMes)
    );

    const totalConsumos = consumosFiltrados.reduce((sum, consumo) => sum + consumo.monto, 0);
    const tarjetasActivas = tarjetas.filter(t => t.activa).length;

    const getCuentaNombre = (cuentaId: number) => {
        const cuenta = cuentas.find(c => c.id === cuentaId);
        return cuenta ? cuenta.nombre : 'Cuenta no encontrada';
    };

    const handleEditTarjeta = (tarjeta: Tarjeta) => {
        setSelectedTarjeta(tarjeta);
        setFormDataTarjeta({
            nombre: tarjeta.nombre,
            cuenta_id: tarjeta.cuenta_id.toString(),
            dia_corte: tarjeta.dia_corte?.toString() || '',
            dia_vencimiento: tarjeta.dia_vencimiento?.toString() || '',
            activa: tarjeta.activa
        });
        setTipoModal('tarjeta');
        setIsModalOpen(true);
    };

    const handleNewTarjeta = () => {
        setSelectedTarjeta(null);
        setFormDataTarjeta({
            nombre: '',
            cuenta_id: '',
            dia_corte: '',
            dia_vencimiento: '',
            activa: true
        });
        setTipoModal('tarjeta');
        setIsModalOpen(true);
    };

    const handleEditConsumo = (consumo: ConsumoTarjeta) => {
        setSelectedConsumo(consumo);
        setFormDataConsumo({
            tarjeta_id: consumo.tarjeta_id.toString(),
            descripcion: consumo.descripcion,
            monto: consumo.monto.toString(),
            fecha: consumo.fecha,
            categoria: consumo.categoria,
            cuotas: consumo.cuotas.toString()
        });
        setTipoModal('consumo');
        setIsModalOpen(true);
    };

    const handleNewConsumo = () => {
        setSelectedConsumo(null);
        setFormDataConsumo({
            tarjeta_id: '',
            descripcion: '',
            monto: '',
            fecha: new Date().toISOString().split('T')[0],
            categoria: '',
            cuotas: '1'
        });
        setTipoModal('consumo');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (tipoModal === 'tarjeta') {
            try {
                notifications.loading(selectedTarjeta ? 'Actualizando tarjeta...' : 'Creando tarjeta...');
                
                const tarjetaData = {
                    usuario_id: 1,
                    cuenta_id: parseInt(formDataTarjeta.cuenta_id),
                    nombre: formDataTarjeta.nombre,
                    dia_corte: formDataTarjeta.dia_corte ? parseInt(formDataTarjeta.dia_corte) : null,
                    dia_vencimiento: formDataTarjeta.dia_vencimiento ? parseInt(formDataTarjeta.dia_vencimiento) : null,
                    activa: formDataTarjeta.activa
                };

                const url = selectedTarjeta 
                    ? `/api/v1/tarjetas/${selectedTarjeta.id}`
                    : '/api/v1/tarjetas';
                
                const method = selectedTarjeta ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tarjetaData)
                });

                if (!response.ok) {
                    throw new Error('Error al guardar la tarjeta');
                }

                notifications.close();
                notifications.toast.success(
                    selectedTarjeta ? 'Tarjeta actualizada correctamente' : 'Tarjeta creada correctamente'
                );
                
                await loadTarjetas(); // Recargar la lista
                setIsModalOpen(false);
            } catch (err) {
                notifications.close();
                const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
                notifications.error(errorMessage, 'Error al guardar tarjeta');
            }
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
                    throw new Error('Error al eliminar la tarjeta');
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
                        Tarjetas
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
                            onClick={() => setVistaActual('consumos')}
                            variant={vistaActual === 'consumos' ? 'primary' : 'ghost'}
                            size="sm"
                            className="rounded-l-none"
                        >
                            Consumos
                        </Button>
                    </div>
                    <Button onClick={vistaActual === 'tarjetas' ? handleNewTarjeta : handleNewConsumo}>
                        {vistaActual === 'tarjetas' ? 'Nueva Tarjeta' : 'Nuevo Consumo'}
                    </Button>
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <MetricCard
                    title="Tarjetas Activas"
                    value={tarjetasActivas.toString()}
                    icon={<CreditCard className="w-5 h-5" />}
                    iconColor="blue"
                />
                <MetricCard
                    title="Total Consumos"
                    value={formatCurrency(totalConsumos)}
                    icon={<DollarSign className="w-5 h-5" />}
                    iconColor="red"
                />
                <MetricCard
                    title="Registros"
                    value={consumosFiltrados.length.toString()}
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
                                <TableHead>Cuenta</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Creada</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        Cargando tarjetas...
                                    </TableCell>
                                    <TableCell> </TableCell>
                                    <TableCell> </TableCell>
                                    <TableCell> </TableCell>
                                    <TableCell> </TableCell>
                                    <TableCell> </TableCell>
                                </TableRow>
                            ) : tarjetas.length === 0 ? (
                                <TableRow>
                                    <TableCell className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No tienes tarjetas registradas. ¡Agrega tu primera tarjeta!
                                    </TableCell>
                                    <TableCell> </TableCell>
                                    <TableCell> </TableCell>
                                    <TableCell> </TableCell>
                                    <TableCell> </TableCell>
                                    <TableCell> </TableCell>
                                </TableRow>
                            ) : (
                                tarjetas.map((tarjeta) => (
                                    <TableRow key={tarjeta.id}>
                                        <TableCell className="font-medium">{tarjeta.nombre}</TableCell>
                                        <TableCell>{getCuentaNombre(tarjeta.cuenta_id)}</TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                                            {tarjeta.dia_corte && tarjeta.dia_vencimiento ? (
                                                <div>
                                                    <div>Corte: {tarjeta.dia_corte}</div>
                                                    <div>Venc: {tarjeta.dia_vencimiento}</div>
                                                </div>
                                            ) : 'No definido'}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${tarjeta.activa ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                }`}>
                                                {tarjeta.activa ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(tarjeta.creado_en)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditTarjeta(tarjeta)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteTarjeta(tarjeta)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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

            {/* Vista de Consumos */}
            {vistaActual === 'consumos' && (
                <>
                    {/* Filtros */}
                    <Card>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                Mes
                            </label>
                            <input
                                type="month"
                                value={filtroMes}
                                onChange={(e) => setFiltroMes(e.target.value)}
                                className="block w-40 rounded-md border-gray-300 dark:border-gray-500 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-400 dark:hover:border-gray-400 sm:text-sm transition-colors duration-200"
                            />
                        </div>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Consumos</CardTitle>
                        </CardHeader>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Tarjeta</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Cuotas</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consumosFiltrados
                                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                                    .map((consumo) => (
                                        <TableRow key={consumo.id}>
                                            <TableCell className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{formatDate(consumo.fecha)}</TableCell>
                                            <TableCell className="font-medium text-gray-900 dark:text-white transition-colors duration-200">{consumo.descripcion}</TableCell>
                                            <TableCell className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{consumo.tarjeta_nombre}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(consumo.categoria)}`}>
                                                    {consumo.categoria}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-semibold text-red-600 dark:text-red-400 transition-colors duration-200">{formatCurrency(consumo.monto)}</TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                                                {consumo.cuotas > 1 ? `${consumo.cuotas}x` : 'Contado'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditConsumo(consumo)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </Card>
                </>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    tipoModal === 'tarjeta'
                        ? (selectedTarjeta ? 'Editar Tarjeta' : 'Nueva Tarjeta')
                        : (selectedConsumo ? 'Editar Consumo' : 'Nuevo Consumo')
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                    Cuenta asociada
                                </label>
                                <select
                                    value={formDataTarjeta.cuenta_id}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, cuenta_id: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                                    required
                                >
                                    <option value="">Seleccionar cuenta</option>
                                    {cuentas.map(cuenta => (
                                        <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                            Día de corte
                                        </label>
                                        <InfoIcon
                                            title="Día de corte"
                                            content={[
                                                "Día del mes en que se cierra el período de facturación de la tarjeta.",
                                                "",
                                                "¿Para qué sirve?",
                                                "• Define cuándo terminan de contabilizarse los consumos",
                                                "• Los consumos después de esta fecha van al siguiente período",
                                                "• Campo opcional - puedes dejarlo vacío si no lo necesitas",
                                                "",
                                                "Ejemplo: Si el corte es el día 15, todos los consumos del 16 del mes anterior al 15 del mes actual se incluyen en la misma facturación."
                                            ]}
                                            size={14}
                                        />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={formDataTarjeta.dia_corte}
                                        onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, dia_corte: e.target.value })}
                                        placeholder="15"
                                        className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                            Día de vencimiento
                                        </label>
                                        <InfoIcon
                                            title="Día de vencimiento"
                                            content={[
                                                "Día del mes en que vence el pago de la tarjeta de crédito.",
                                                "",
                                                "¿Para qué sirve?",
                                                "• Te ayuda a recordar cuándo debes pagar",
                                                "• Útil para planificar el flujo de efectivo",
                                                "• Campo opcional - puedes dejarlo vacío si no lo necesitas",
                                                "",
                                                "Ejemplo: Si el vencimiento es el día 5, debes pagar antes de esa fecha para evitar intereses."
                                            ]}
                                            size={14}
                                        />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={formDataTarjeta.dia_vencimiento}
                                        onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, dia_vencimiento: e.target.value })}
                                        placeholder="5"
                                        className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="activa"
                                    checked={formDataTarjeta.activa}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, activa: e.target.checked })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded transition-colors duration-200"
                                />
                                <label htmlFor="activa" className="ml-2 block text-sm text-gray-900 dark:text-white transition-colors duration-200">
                                    Tarjeta activa
                                </label>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                    Tarjeta
                                </label>
                                <select
                                    value={formDataConsumo.tarjeta_id}
                                    onChange={(e) => setFormDataConsumo({ ...formDataConsumo, tarjeta_id: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                                    required
                                >
                                    <option value="">Seleccionar tarjeta</option>
                                    {tarjetas.filter(t => t.activa).map(tarjeta => (
                                        <option key={tarjeta.id} value={tarjeta.id}>{tarjeta.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Descripción"
                                value={formDataConsumo.descripcion}
                                onChange={(e) => setFormDataConsumo({ ...formDataConsumo, descripcion: e.target.value })}
                                placeholder="Ej. Supermercado Jumbo"
                                required
                            />

                            <Input
                                label="Monto"
                                type="number"
                                value={formDataConsumo.monto}
                                onChange={(e) => setFormDataConsumo({ ...formDataConsumo, monto: e.target.value })}
                                placeholder="0"
                                required
                            />

                            <Input
                                label="Fecha"
                                type="date"
                                value={formDataConsumo.fecha}
                                onChange={(e) => setFormDataConsumo({ ...formDataConsumo, fecha: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                                    Categoría
                                </label>
                                <select
                                    value={formDataConsumo.categoria}
                                    onChange={(e) => setFormDataConsumo({ ...formDataConsumo, categoria: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200"
                                    required
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map(categoria => (
                                        <option key={categoria} value={categoria}>{categoria}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                        Número de cuotas
                                    </label>
                                    <InfoIcon
                                        title="Número de cuotas"
                                        content={[
                                            "¿En cuántas cuotas quieres financiar este consumo?",
                                            "",
                                            "Opciones:",
                                            "• 1 cuota = Pago al contado (sin financiación)",
                                            "• 2-48 cuotas = Financiación en cuotas",
                                            "",
                                            "El sistema distribuirá automáticamente el monto entre las cuotas seleccionadas y las programará mes a mes."
                                        ]}
                                        size={14}
                                    />
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="48"
                                    value={formDataConsumo.cuotas}
                                    onChange={(e) => setFormDataConsumo({ ...formDataConsumo, cuotas: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 sm:text-sm transition-all duration-200"
                                    required
                                />
                            </div>
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
                            {tipoModal === 'tarjeta'
                                ? (selectedTarjeta ? 'Actualizar' : 'Crear') + ' Tarjeta'
                                : (selectedConsumo ? 'Actualizar' : 'Crear') + ' Consumo'
                            }
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}