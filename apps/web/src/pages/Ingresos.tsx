import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input } from '../components/ui';

interface Ingreso {
    id: number;
    descripcion: string;
    monto: number;
    fecha: string;
    categoria: string;
    cuenta_id: number;
    cuenta_nombre: string;
    es_recurrente: boolean;
    frecuencia_dias?: number;
    creado_en: string;
}

// Datos simulados
const ingresosData: Ingreso[] = [
    {
        id: 1,
        descripcion: 'Sueldo Octubre',
        monto: 850000,
        fecha: '2024-10-01',
        categoria: 'Salario',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        es_recurrente: true,
        frecuencia_dias: 30,
        creado_en: '2024-10-01'
    },
    {
        id: 2,
        descripcion: 'Freelance Proyecto Web',
        monto: 150000,
        fecha: '2024-10-15',
        categoria: 'Freelance',
        cuenta_id: 1,
        cuenta_nombre: 'Cuenta Corriente Principal',
        es_recurrente: false,
        creado_en: '2024-10-15'
    },
    {
        id: 3,
        descripcion: 'Dividendos Acciones',
        monto: 25000,
        fecha: '2024-10-20',
        categoria: 'Inversiones',
        cuenta_id: 2,
        cuenta_nombre: 'Cuenta de Ahorros',
        es_recurrente: true,
        frecuencia_dias: 90,
        creado_en: '2024-10-20'
    }
];

const categorias = [
    'Salario',
    'Freelance',
    'Inversiones',
    'Ventas',
    'Alquiler',
    'Otros'
];

const cuentas = [
    { id: 1, nombre: 'Cuenta Corriente Principal' },
    { id: 2, nombre: 'Cuenta de Ahorros' },
    { id: 3, nombre: 'Billetera Efectivo' }
];

export default function Ingresos() {
    const [ingresos] = useState<Ingreso[]>(ingresosData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIngreso, setSelectedIngreso] = useState<Ingreso | null>(null);
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [filtroMes, setFiltroMes] = useState<string>(new Date().toISOString().slice(0, 7));
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        categoria: '',
        cuenta_id: '',
        es_recurrente: false,
        frecuencia_dias: ''
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
            'Salario': 'bg-green-100 text-green-800',
            'Freelance': 'bg-blue-100 text-blue-800',
            'Inversiones': 'bg-purple-100 text-purple-800',
            'Ventas': 'bg-orange-100 text-orange-800',
            'Alquiler': 'bg-indigo-100 text-indigo-800',
            'Otros': 'bg-gray-100 text-gray-800'
        };
        return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const ingresosFiltrados = ingresos.filter(ingreso => {
        const cumpleFiltroCategoria = !filtroCategoria || ingreso.categoria === filtroCategoria;
        const cumpleFiltroMes = !filtroMes || ingreso.fecha.startsWith(filtroMes);
        return cumpleFiltroCategoria && cumpleFiltroMes;
    });

    const totalIngresos = ingresosFiltrados.reduce((sum, ingreso) => sum + ingreso.monto, 0);
    const ingresosRecurrentes = ingresosFiltrados.filter(ingreso => ingreso.es_recurrente).length;

    const handleEdit = (ingreso: Ingreso) => {
        setSelectedIngreso(ingreso);
        setFormData({
            descripcion: ingreso.descripcion,
            monto: ingreso.monto.toString(),
            fecha: ingreso.fecha,
            categoria: ingreso.categoria,
            cuenta_id: ingreso.cuenta_id.toString(),
            es_recurrente: ingreso.es_recurrente,
            frecuencia_dias: ingreso.frecuencia_dias?.toString() || ''
        });
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedIngreso(null);
        setFormData({
            descripcion: '',
            monto: '',
            fecha: new Date().toISOString().split('T')[0],
            categoria: '',
            cuenta_id: '',
            es_recurrente: false,
            frecuencia_dias: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Guardando ingreso:', formData);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Ingresos</h1>
                <Button onClick={handleNew}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Ingreso
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
                            <p className="text-sm font-medium text-gray-500">Total Ingresos</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalIngresos)}</p>
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
                            <p className="text-sm font-medium text-gray-500">Total Registros</p>
                            <p className="text-2xl font-semibold text-gray-900">{ingresosFiltrados.length}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Recurrentes</p>
                            <p className="text-2xl font-semibold text-gray-900">{ingresosRecurrentes}</p>
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
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Cuenta</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ingresosFiltrados.map((ingreso) => (
                            <TableRow key={ingreso.id}>
                                <TableCell>{formatDate(ingreso.fecha)}</TableCell>
                                <TableCell className="font-medium">{ingreso.descripcion}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(ingreso.categoria)}`}>
                                        {ingreso.categoria}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">{ingreso.cuenta_nombre}</TableCell>
                                <TableCell className="font-semibold text-green-600">{formatCurrency(ingreso.monto)}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ingreso.es_recurrente ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {ingreso.es_recurrente ? 'Recurrente' : 'Único'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(ingreso)}
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
                            Cuenta destino
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
                            id="es_recurrente"
                            checked={formData.es_recurrente}
                            onChange={(e) => setFormData({ ...formData, es_recurrente: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="es_recurrente" className="ml-2 block text-sm text-gray-900">
                            Es recurrente
                        </label>
                    </div>

                    {formData.es_recurrente && (
                        <Input
                            label="Frecuencia (días)"
                            type="number"
                            value={formData.frecuencia_dias}
                            onChange={(e) => setFormData({ ...formData, frecuencia_dias: e.target.value })}
                            placeholder="30"
                            helperText="Cada cuántos días se repite el ingreso"
                        />
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
                            {selectedIngreso ? 'Actualizar' : 'Crear'} Ingreso
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}