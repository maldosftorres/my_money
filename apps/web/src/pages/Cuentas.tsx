import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Input } from '../components/ui';

interface Cuenta {
    id: number;
    nombre: string;
    tipo: 'ahorro' | 'corriente' | 'efectivo' | 'inversion';
    saldo_inicial: number;
    saldo_actual: number;
    moneda: string;
    activa: boolean;
    creado_en: string;
}

// Datos simulados
const cuentasData: Cuenta[] = [
    {
        id: 1,
        nombre: 'Cuenta Corriente Principal',
        tipo: 'corriente',
        saldo_inicial: 50000,
        saldo_actual: 45750,
        moneda: 'CLP',
        activa: true,
        creado_en: '2024-01-15'
    },
    {
        id: 2,
        nombre: 'Cuenta de Ahorros',
        tipo: 'ahorro',
        saldo_inicial: 100000,
        saldo_actual: 125300,
        moneda: 'CLP',
        activa: true,
        creado_en: '2024-01-20'
    },
    {
        id: 3,
        nombre: 'Billetera Efectivo',
        tipo: 'efectivo',
        saldo_inicial: 20000,
        saldo_actual: 15500,
        moneda: 'CLP',
        activa: true,
        creado_en: '2024-02-01'
    }
];

export default function Cuentas() {
    const [cuentas] = useState<Cuenta[]>(cuentasData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCuenta, setSelectedCuenta] = useState<Cuenta | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'corriente' as Cuenta['tipo'],
        saldo_inicial: '',
        moneda: 'CLP'
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    };

    const getTipoLabel = (tipo: string) => {
        const labels = {
            'corriente': 'Corriente',
            'ahorro': 'Ahorros',
            'efectivo': 'Efectivo',
            'inversion': 'Inversión'
        };
        return labels[tipo as keyof typeof labels] || tipo;
    };

    const getTipoColor = (tipo: string) => {
        const colors = {
            'corriente': 'bg-blue-100 text-blue-800',
            'ahorro': 'bg-green-100 text-green-800',
            'efectivo': 'bg-yellow-100 text-yellow-800',
            'inversion': 'bg-purple-100 text-purple-800'
        };
        return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const handleEdit = (cuenta: Cuenta) => {
        setSelectedCuenta(cuenta);
        setFormData({
            nombre: cuenta.nombre,
            tipo: cuenta.tipo,
            saldo_inicial: cuenta.saldo_inicial.toString(),
            moneda: cuenta.moneda
        });
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedCuenta(null);
        setFormData({
            nombre: '',
            tipo: 'corriente',
            saldo_inicial: '',
            moneda: 'CLP'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí se haría la llamada a la API
        console.log('Guardando cuenta:', formData);
        setIsModalOpen(false);
    };

    const totalSaldo = cuentas.reduce((sum, cuenta) => sum + cuenta.saldo_actual, 0);
    const cuentasActivas = cuentas.filter(cuenta => cuenta.activa).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Cuentas</h1>
                <Button onClick={handleNew}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Cuenta
                </Button>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Saldo Total</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalSaldo)}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Cuentas Activas</p>
                            <p className="text-2xl font-semibold text-gray-900">{cuentasActivas}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Cuentas</p>
                            <p className="text-2xl font-semibold text-gray-900">{cuentas.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Lista de Cuentas */}
            <Card>
                <CardHeader>
                    <CardTitle>Mis Cuentas</CardTitle>
                </CardHeader>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Saldo Inicial</TableHead>
                            <TableHead>Saldo Actual</TableHead>
                            <TableHead>Diferencia</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cuentas.map((cuenta) => {
                            const diferencia = cuenta.saldo_actual - cuenta.saldo_inicial;
                            return (
                                <TableRow key={cuenta.id}>
                                    <TableCell className="font-medium">{cuenta.nombre}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(cuenta.tipo)}`}>
                                            {getTipoLabel(cuenta.tipo)}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatCurrency(cuenta.saldo_inicial)}</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(cuenta.saldo_actual)}</TableCell>
                                    <TableCell className={diferencia >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {diferencia >= 0 ? '+' : ''}{formatCurrency(diferencia)}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cuenta.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {cuenta.activa ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(cuenta)}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de cuenta
                        </label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Cuenta['tipo'] })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                        >
                            <option value="corriente">Corriente</option>
                            <option value="ahorro">Ahorros</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="inversion">Inversión</option>
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