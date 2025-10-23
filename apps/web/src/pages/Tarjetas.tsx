import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input } from '../components/ui';

interface Tarjeta {
    id: number;
    nombre: string;
    banco: string;
    tipo: 'credito' | 'debito';
    limite_credito?: number;
    dia_corte?: number;
    dia_vencimiento?: number;
    activa: boolean;
    creado_en: string;
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

// Datos simulados de tarjetas
const tarjetasData: Tarjeta[] = [
    {
        id: 1,
        nombre: 'Visa Platinum',
        banco: 'Banco Chile',
        tipo: 'credito',
        limite_credito: 800000,
        dia_corte: 15,
        dia_vencimiento: 5,
        activa: true,
        creado_en: '2024-01-15'
    },
    {
        id: 2,
        nombre: 'Mastercard Gold',
        banco: 'Banco Estado',
        tipo: 'credito',
        limite_credito: 600000,
        dia_corte: 20,
        dia_vencimiento: 10,
        activa: true,
        creado_en: '2024-02-01'
    },
    {
        id: 3,
        nombre: 'Débito Cuenta Corriente',
        banco: 'Banco Chile',
        tipo: 'debito',
        activa: true,
        creado_en: '2024-01-15'
    }
];

// Datos simulados de consumos
const consumosData: ConsumoTarjeta[] = [
    {
        id: 1,
        tarjeta_id: 1,
        tarjeta_nombre: 'Visa Platinum',
        descripcion: 'Supermercado Jumbo',
        monto: 85000,
        fecha: '2024-10-22',
        categoria: 'Alimentación',
        cuotas: 1,
        creado_en: '2024-10-22'
    },
    {
        id: 2,
        tarjeta_id: 1,
        tarjeta_nombre: 'Visa Platinum',
        descripcion: 'Laptop Gaming',
        monto: 1200000,
        fecha: '2024-10-20',
        categoria: 'Tecnología',
        cuotas: 12,
        creado_en: '2024-10-20'
    },
    {
        id: 3,
        tarjeta_id: 2,
        tarjeta_nombre: 'Mastercard Gold',
        descripcion: 'Cena Restaurante',
        monto: 45000,
        fecha: '2024-10-18',
        categoria: 'Entretenimiento',
        cuotas: 3,
        creado_en: '2024-10-18'
    }
];

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

const bancos = [
    'Banco Chile',
    'Banco Estado',
    'Banco Santander',
    'Banco BCI',
    'Banco Security',
    'Banco Falabella',
    'Otros'
];

export default function Tarjetas() {
    const [tarjetas] = useState<Tarjeta[]>(tarjetasData);
    const [consumos] = useState<ConsumoTarjeta[]>(consumosData);
    const [vistaActual, setVistaActual] = useState<'tarjetas' | 'consumos'>('tarjetas');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tipoModal, setTipoModal] = useState<'tarjeta' | 'consumo'>('tarjeta');
    const [selectedTarjeta, setSelectedTarjeta] = useState<Tarjeta | null>(null);
    const [selectedConsumo, setSelectedConsumo] = useState<ConsumoTarjeta | null>(null);
    const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7));

    const [formDataTarjeta, setFormDataTarjeta] = useState({
        nombre: '',
        banco: '',
        tipo: 'credito' as Tarjeta['tipo'],
        limite_credito: '',
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-CL');
    };

    const getTipoColor = (tipo: string) => {
        return tipo === 'credito'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800';
    };

    const getCategoriaColor = (categoria: string) => {
        const colors = {
            'Alimentación': 'bg-green-100 text-green-800',
            'Tecnología': 'bg-blue-100 text-blue-800',
            'Entretenimiento': 'bg-purple-100 text-purple-800',
            'Ropa': 'bg-pink-100 text-pink-800',
            'Salud': 'bg-red-100 text-red-800',
            'Transporte': 'bg-indigo-100 text-indigo-800',
            'Hogar': 'bg-yellow-100 text-yellow-800',
            'Otros': 'bg-gray-100 text-gray-800'
        };
        return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    // Calcular utilización de tarjetas de crédito
    const calcularUtilizacion = (tarjetaId: number) => {
        const tarjeta = tarjetas.find(t => t.id === tarjetaId);
        if (!tarjeta || tarjeta.tipo !== 'credito' || !tarjeta.limite_credito) return 0;

        const consumosTarjeta = consumos.filter(c => c.tarjeta_id === tarjetaId);
        const totalConsumos = consumosTarjeta.reduce((sum, c) => sum + c.monto, 0);

        return (totalConsumos / tarjeta.limite_credito) * 100;
    };

    const consumosFiltrados = consumos.filter(consumo =>
        !filtroMes || consumo.fecha.startsWith(filtroMes)
    );

    const totalConsumos = consumosFiltrados.reduce((sum, consumo) => sum + consumo.monto, 0);
    const tarjetasActivas = tarjetas.filter(t => t.activa).length;

    const handleEditTarjeta = (tarjeta: Tarjeta) => {
        setSelectedTarjeta(tarjeta);
        setFormDataTarjeta({
            nombre: tarjeta.nombre,
            banco: tarjeta.banco,
            tipo: tarjeta.tipo,
            limite_credito: tarjeta.limite_credito?.toString() || '',
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
            banco: '',
            tipo: 'credito',
            limite_credito: '',
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tipoModal === 'tarjeta') {
            console.log('Guardando tarjeta:', formDataTarjeta);
        } else {
            console.log('Guardando consumo:', formDataConsumo);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Tarjetas</h1>
                <div className="flex space-x-3">
                    <div className="flex rounded-lg border border-gray-300">
                        <button
                            onClick={() => setVistaActual('tarjetas')}
                            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${vistaActual === 'tarjetas'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Tarjetas
                        </button>
                        <button
                            onClick={() => setVistaActual('consumos')}
                            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${vistaActual === 'consumos'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Consumos
                        </button>
                    </div>
                    <Button onClick={vistaActual === 'tarjetas' ? handleNewTarjeta : handleNewConsumo}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {vistaActual === 'tarjetas' ? 'Nueva Tarjeta' : 'Nuevo Consumo'}
                    </Button>
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Tarjetas Activas</p>
                            <p className="text-2xl font-semibold text-gray-900">{tarjetasActivas}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Consumos</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalConsumos)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Registros</p>
                            <p className="text-2xl font-semibold text-gray-900">{consumosFiltrados.length}</p>
                        </div>
                    </div>
                </Card>
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
                                <TableHead>Banco</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Límite</TableHead>
                                <TableHead>Utilización</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tarjetas.map((tarjeta) => {
                                const utilizacion = calcularUtilizacion(tarjeta.id);
                                return (
                                    <TableRow key={tarjeta.id}>
                                        <TableCell className="font-medium">{tarjeta.nombre}</TableCell>
                                        <TableCell>{tarjeta.banco}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(tarjeta.tipo)}`}>
                                                {tarjeta.tipo === 'credito' ? 'Crédito' : 'Débito'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {tarjeta.limite_credito ? formatCurrency(tarjeta.limite_credito) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {tarjeta.tipo === 'credito' && tarjeta.limite_credito ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${utilizacion > 80 ? 'bg-red-600' :
                                                                    utilizacion > 60 ? 'bg-yellow-600' : 'bg-green-600'
                                                                }`}
                                                            style={{ width: `${Math.min(utilizacion, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">{utilizacion.toFixed(1)}%</span>
                                                </div>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {tarjeta.dia_corte && tarjeta.dia_vencimiento ? (
                                                <div>
                                                    <div>Corte: {tarjeta.dia_corte}</div>
                                                    <div>Venc: {tarjeta.dia_vencimiento}</div>
                                                </div>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tarjeta.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {tarjeta.activa ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditTarjeta(tarjeta)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mes
                            </label>
                            <input
                                type="month"
                                value={filtroMes}
                                onChange={(e) => setFiltroMes(e.target.value)}
                                className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                                            <TableCell>{formatDate(consumo.fecha)}</TableCell>
                                            <TableCell className="font-medium">{consumo.descripcion}</TableCell>
                                            <TableCell className="text-sm text-gray-500">{consumo.tarjeta_nombre}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(consumo.categoria)}`}>
                                                    {consumo.categoria}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-semibold text-red-600">{formatCurrency(consumo.monto)}</TableCell>
                                            <TableCell>
                                                {consumo.cuotas > 1 ? `${consumo.cuotas}x` : 'Contado'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditConsumo(consumo)}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Banco
                                </label>
                                <select
                                    value={formDataTarjeta.banco}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, banco: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Seleccionar banco</option>
                                    {bancos.map(banco => (
                                        <option key={banco} value={banco}>{banco}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo
                                </label>
                                <select
                                    value={formDataTarjeta.tipo}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, tipo: e.target.value as Tarjeta['tipo'] })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                >
                                    <option value="credito">Crédito</option>
                                    <option value="debito">Débito</option>
                                </select>
                            </div>

                            {formDataTarjeta.tipo === 'credito' && (
                                <>
                                    <Input
                                        label="Límite de crédito"
                                        type="number"
                                        value={formDataTarjeta.limite_credito}
                                        onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, limite_credito: e.target.value })}
                                        placeholder="800000"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Día de corte"
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={formDataTarjeta.dia_corte}
                                            onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, dia_corte: e.target.value })}
                                            placeholder="15"
                                        />

                                        <Input
                                            label="Día de vencimiento"
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={formDataTarjeta.dia_vencimiento}
                                            onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, dia_vencimiento: e.target.value })}
                                            placeholder="5"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="activa"
                                    checked={formDataTarjeta.activa}
                                    onChange={(e) => setFormDataTarjeta({ ...formDataTarjeta, activa: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="activa" className="ml-2 block text-sm text-gray-900">
                                    Tarjeta activa
                                </label>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tarjeta
                                </label>
                                <select
                                    value={formDataConsumo.tarjeta_id}
                                    onChange={(e) => setFormDataConsumo({ ...formDataConsumo, tarjeta_id: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría
                                </label>
                                <select
                                    value={formDataConsumo.categoria}
                                    onChange={(e) => setFormDataConsumo({ ...formDataConsumo, categoria: e.target.value })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categorias.map(categoria => (
                                        <option key={categoria} value={categoria}>{categoria}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Número de cuotas"
                                type="number"
                                min="1"
                                max="48"
                                value={formDataConsumo.cuotas}
                                onChange={(e) => setFormDataConsumo({ ...formDataConsumo, cuotas: e.target.value })}
                                helperText="1 = Pago al contado"
                                required
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