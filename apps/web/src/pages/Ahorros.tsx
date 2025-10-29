import { Card } from '../components/ui';
import { Construction, PiggyBank } from 'lucide-react';

export default function Ahorros() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                    Ahorros
                </h1>
            </div>

            {/* En Construcción */}
            <Card>
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative mb-6">
                        {/* Icono de construcción con animación */}
                        <div className="relative">
                            <Construction className="w-20 h-20 text-yellow-500 animate-bounce" />
                            <PiggyBank className="w-12 h-12 text-blue-500 absolute -top-2 -right-2" />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        Módulo en Construcción
                    </h2>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 text-center max-w-md">
                        El módulo de Ahorros está siendo rediseñado para ofrecerte una mejor experiencia.
                    </p>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
                        Volverá pronto con nuevas funcionalidades
                    </p>

                    {/* Indicador de progreso visual */}
                    <div className="mt-8 w-64">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progreso</span>
                            <span>En desarrollo...</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse" style={{width: '30%'}}></div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}