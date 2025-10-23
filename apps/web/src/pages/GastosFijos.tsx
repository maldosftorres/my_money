import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input } from '../components/ui';

interface GastoFijo {
    id: number;
    descripcion: string;
    monto: number;
    dia_del_mes: number;
    categoria: string;
    cuenta_id: number;
    cuenta_nombre: string;
    activo: boolean;
    proximo_pago: string;
    ultimo_pago?: string;
    creado_en: string;
}

// Datos simulados
const gastosFijosData: GastoFijo[] = [
    {
        id: 1,
        descripcion: 'Arriendo Departamento',
        monto: 420000,
        dia_del_mes: 5,
        categoria: 'Vivienda',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        activo: true,
        proximo_pago: '2024-11-05',
        ultimo_pago: '2024-10-05',
        creado_en: '2024-01-15'
    },
    {
        id: 2,
        descripcion: 'Internet Fibra Óptica',
        monto: 35000,
        dia_del_mes: 15,
        categoria: 'Servicios',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        activo: true,
        proximo_pago: '2024-11-15',
        ultimo_pago: '2024-10-15',
        creado_en: '2024-01-20'
    },
    {
        id: 3,
        descripcion: 'Plan Telefonía Móvil',
        monto: 18000,
        dia_del_mes: 20,
        categoria: 'Servicios',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        activo: true,
        proximo_pago: '2024-11-20',
        ultimo_pago: '2024-10-20',
        creado_en: '2024-01-25'
    },
    {
        id: 4,
        descripcion: 'Seguro Auto',
        monto: 45000,
        dia_del_mes: 1,
        categoria: 'Seguros',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        activo: true,
        proximo_pago: '2024-11-01',
        ultimo_pago: '2024-10-01',
        creado_en: '2024-02-01'
    },
    {
        id: 5,
        descripcion: 'Gym Mensualidad',
        monto: 25000,
        dia_del_mes: 10,
        categoria: 'Entretenimiento',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        activo: false,
        proximo_pago: '2024-11-10',
        creado_en: '2024-03-01'
    }
];

const categorias = [
    'Vivienda',
    'Servicios',
    'Seguros',
    'Entretenimiento',
    'Educación',
    'Salud',
    'Transporte',
    'Otros'
];

const cuentas = [
    { id: 1, nombre: 'Cuenta Corriente Principal' },
    { id: 2, nombre: 'Cuenta de Ahorros' },
    { id: 3, nombre: 'Billetera Efectivo' }
];

export default function GastosFijos() {
    const [gastosFijos] = useState<GastoFijo[]>(gastosFijosData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState<GastoFijo | null>(null);
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [mostrarInactivos, setMostrarInactivos] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: '',
        dia_del_mes: '',
        categoria: '',
        cuenta_id: '',
        activo: true
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

    const getCategoriaColor = (categoria: string) => {
        const colors = {
            'Vivienda': 'bg-red-100 text-red-800',
            'Servicios': 'bg-blue-100 text-blue-800',
            'Seguros': 'bg-purple-100 text-purple-800',
            'Entretenimiento': 'bg-green-100 text-green-800',
            'Educación': 'bg-yellow-100 text-yellow-800',
            'Salud': 'bg-pink-100 text-pink-800',
            'Transporte': 'bg-indigo-100 text-indigo-800',
            'Otros': 'bg-gray-100 text-gray-800'
        };
        return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getDiasHastaVencimiento = (proximoPago: string) => {
        const hoy = new Date();
        const fechaPago = new Date(proximoPago);
        const diferencia = Math.ceil((fechaPago.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
        return diferencia;
    };

    const getEstadoPago = (diasHasta: number) => {
        if (diasHasta < 0) return { text: 'Vencido', color: 'bg-red-100 text-red-800' };
        if (diasHasta <= 3) return { text: 'Por vencer', color: 'bg-yellow-100 text-yellow-800' };
        if (diasHasta <= 7) return { text: 'Próximo', color: 'bg-blue-100 text-blue-800' };
        return { text: 'Vigente', color: 'bg-green-100 text-green-800' };
    };

    const gastosFiltrados = gastosFijos.filter(gasto => {
        const cumpleFiltroCategoria = !filtroCategoria || gasto.categoria === filtroCategoria;
        const cumpleFiltroActivo = mostrarInactivos || gasto.activo;
        return cumpleFiltroCategoria && cumpleFiltroActivo;
    });

    const totalGastosFijos = gastosFiltrados.filter(g => g.activo).reduce((sum, gasto) => sum + gasto.monto, 0);
    const gastosActivos = gastosFiltrados.filter(g => g.activo).length;
    const proximosVencimientos = gastosFiltrados.filter(g => {
        const dias = getDiasHastaVencimiento(g.proximo_pago);
        return g.activo && dias <= 7 && dias >= 0;
    }).length;

    const handleEdit = (gasto: GastoFijo) => {
        setSelectedGasto(gasto);
        setFormData({
            descripcion: gasto.descripcion,
            monto: gasto.monto.toString(),
            dia_del_mes: gasto.dia_del_mes.toString(),
            categoria: gasto.categoria,
            cuenta_id: gasto.cuenta_id.toString(),
            activo: gasto.activo
        });
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedGasto(null);
        setFormData({
            descripcion: '',
            monto: '',
            dia_del_mes: '',
            categoria: '',
            cuenta_id: '',
            activo: true
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Guardando gasto fijo:', formData);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gastos Fijos</h1>
                <Button onClick={handleNew}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Gasto Fijo
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Categoría
                        </label>
                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="">Todas</option>
                            {categorias.map(categoria => (
                                <option key={categoria} value={categoria}>{categoria}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="mostrarInactivos"
                            checked={mostrarInactivos}
                            onChange={(e) => setMostrarInactivos(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="mostrarInactivos" className="ml-2 block text-sm text-gray-900">
                            Mostrar inactivos
                        </label>
                    </div>
                </div>
            </Card>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <p className="text-sm font-medium text-gray-500">Total Mensual</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalGastosFijos)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Gastos Activos</p>
                            <p className="text-2xl font-semibold text-gray-900">{gastosActivos}</p>
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
                            <p className="text-sm font-medium text-gray-500">Próximos a Vencer</p>
                            <p className="text-2xl font-semibold text-gray-900">{proximosVencimientos}</p>
                        </div>
                    </div>
                </Card>
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
                            <TableHead>Día de Pago</TableHead>
                            <TableHead>Próximo Pago</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Cuenta</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gastosFiltrados.map((gasto) => {
                            const diasHasta = getDiasHastaVencimiento(gasto.proximo_pago);
                            const estadoPago = getEstadoPago(diasHasta);

                            return (
                                <TableRow key={gasto.id} className={!gasto.activo ? 'opacity-50' : ''}>
                                    <TableCell className="font-medium">{gasto.descripcion}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(gasto.categoria)}`}>
                                            {gasto.categoria}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-semibold text-red-600">{formatCurrency(gasto.monto)}</TableCell>
                                    <TableCell>Día {gasto.dia_del_mes}</TableCell>
                                    <TableCell>{formatDate(gasto.proximo_pago)}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoPago.color}`}>
                                            {estadoPago.text}
                                            {diasHasta >= 0 && ` (${diasHasta}d)`}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">{gasto.cuenta_nombre}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(gasto)}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
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
                    <Input
                        label="Descripción"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Ej. Arriendo Departamento"
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
                        label="Día del mes"
                        type="number"
                        min="1"
                        max="31"
                        value={formData.dia_del_mes}
                        onChange={(e) => setFormData({ ...formData, dia_del_mes: e.target.value })}
                        placeholder="5"
                        helperText="Día del mes en que se realiza el pago"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Categoría
                        </label>
                        <select
                            value={formData.categoria}
                            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                        >
                            <option value="">Seleccionar categoría</option>
                            {categorias.map(categoria => (
                                <option key={categoria} value={categoria}>{categoria}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cuenta de pago
                        </label>
                        <select
                            value={formData.cuenta_id}
                            onChange={(e) => setFormData({ ...formData, cuenta_id: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                        >
                            <option value="">Seleccionar cuenta</option>
                            {cuentas.map(cuenta => (
                                <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="activo"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                            Gasto activo
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
        </div>
    );
}