import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input } from '../components/ui';

interface GastoAdicional {
    id: number;
    descripcion: string;
    monto: number;
    fecha: string;
    categoria: string;
    cuenta_id: number;
    cuenta_nombre: string;
    notas?: string;
    creado_en: string;
}

// Datos simulados
const gastosAdicionalesData: GastoAdicional[] = [
    {
        id: 1,
        descripcion: 'Cena Restaurante',
        monto: 35000,
        fecha: '2024-10-22',
        categoria: 'Entretenimiento',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        notas: 'Cena de aniversario',
        creado_en: '2024-10-22'
    },
    {
        id: 2,
        descripcion: 'Combustible Auto',
        monto: 45000,
        fecha: '2024-10-20',
        categoria: 'Transporte',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        creado_en: '2024-10-20'
    },
    {
        id: 3,
        descripcion: 'Supermercado',
        monto: 85000,
        fecha: '2024-10-18',
        categoria: 'Alimentación',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        notas: 'Compras mensuales',
        creado_en: '2024-10-18'
    },
    {
        id: 4,
        descripcion: 'Farmacia - Medicamentos',
        monto: 15000,
        fecha: '2024-10-15',
        categoria: 'Salud',
        cuenta_id: 3,
        cuenta_nombre: 'Billetera Efectivo',
        creado_en: '2024-10-15'
    },
    {
        id: 5,
        descripcion: 'Libro Programación',
        monto: 25000,
        fecha: '2024-10-12',
        categoria: 'Educación',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        notas: 'Curso online incluido',
        creado_en: '2024-10-12'
    }
];

const categorias = [
    'Alimentación',
    'Transporte',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Ropa',
    'Hogar',
    'Otros'
];

const cuentas = [
    { id: 1, nombre: 'Cuenta Corriente Principal' },
    { id: 2, nombre: 'Cuenta de Ahorros' },
    { id: 3, nombre: 'Billetera Efectivo' }
];

export default function GastosAdicionales() {
    const [gastosAdicionales] = useState<GastoAdicional[]>(gastosAdicionalesData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState<GastoAdicional | null>(null);
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7));
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        categoria: '',
        cuenta_id: '',
        notas: ''
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
            'Alimentación': 'bg-green-100 text-green-800',
            'Transporte': 'bg-blue-100 text-blue-800',
            'Entretenimiento': 'bg-purple-100 text-purple-800',
            'Salud': 'bg-red-100 text-red-800',
            'Educación': 'bg-yellow-100 text-yellow-800',
            'Ropa': 'bg-pink-100 text-pink-800',
            'Hogar': 'bg-indigo-100 text-indigo-800',
            'Otros': 'bg-gray-100 text-gray-800'
        };
        return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const gastosFilter = gastosAdicionales.filter(gasto => {
        const cumpleFiltroCategoria = !filtroCategoria || gasto.categoria === filtroCategoria;
        const cumpleFiltroMes = !filtroMes || gasto.fecha.startsWith(filtroMes);
        return cumpleFiltroCategoria && cumpleFiltroMes;
    });

    // Calcular estadísticas
    const totalGastos = gastosFilter.reduce((sum, gasto) => sum + gasto.monto, 0);
    const promedioGasto = gastosFilter.length > 0 ? totalGastos / gastosFilter.length : 0;

    // Agrupar por categoría para el resumen
    const gastosPorCategoria = gastosFilter.reduce((acc, gasto) => {
        acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
        return acc;
    }, {} as Record<string, number>);

    const categoriaConMayorGasto = Object.entries(gastosPorCategoria).reduce(
        (max, [categoria, monto]) => monto > max.monto ? { categoria, monto } : max,
        { categoria: '', monto: 0 }
    );

    const handleEdit = (gasto: GastoAdicional) => {
        setSelectedGasto(gasto);
        setFormData({
            descripcion: gasto.descripcion,
            monto: gasto.monto.toString(),
            fecha: gasto.fecha,
            categoria: gasto.categoria,
            cuenta_id: gasto.cuenta_id.toString(),
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
            categoria: '',
            cuenta_id: '',
            notas: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Guardando gasto adicional:', formData);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gastos Adicionales</h1>
                <Button onClick={handleNew}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Gasto
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
                </div>
            </Card>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                            <p className="text-sm font-medium text-gray-500">Total Gastado</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalGastos)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Promedio por Gasto</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(promedioGasto)}</p>
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
                            <p className="text-sm font-medium text-gray-500">Total Registros</p>
                            <p className="text-2xl font-semibold text-gray-900">{gastosFilter.length}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Mayor Categoría</p>
                            <p className="text-lg font-semibold text-gray-900">{categoriaConMayorGasto.categoria || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(categoriaConMayorGasto.monto)}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Resumen por Categorías */}
            {Object.keys(gastosPorCategoria).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución por Categorías</CardTitle>
                    </CardHeader>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(gastosPorCategoria)
                            .sort(([, a], [, b]) => b - a)
                            .map(([categoria, monto]) => (
                                <div key={categoria} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(categoria)} mb-2`}>
                                        {categoria}
                                    </span>
                                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(monto)}</p>
                                    <p className="text-sm text-gray-500">
                                        {((monto / totalGastos) * 100).toFixed(1)}%
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
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Cuenta</TableHead>
                            <TableHead>Notas</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gastosFilter
                            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                            .map((gasto) => (
                                <TableRow key={gasto.id}>
                                    <TableCell>{formatDate(gasto.fecha)}</TableCell>
                                    <TableCell className="font-medium">{gasto.descripcion}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(gasto.categoria)}`}>
                                            {gasto.categoria}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-semibold text-red-600">{formatCurrency(gasto.monto)}</TableCell>
                                    <TableCell className="text-sm text-gray-500">{gasto.cuenta_nombre}</TableCell>
                                    <TableCell className="text-sm text-gray-500 max-w-32 truncate">
                                        {gasto.notas || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(gasto)}
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

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedGasto ? 'Editar Gasto' : 'Nuevo Gasto'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Descripción"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Ej. Cena Restaurante"
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas (opcional)
                        </label>
                        <textarea
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
        </div>
    );
}