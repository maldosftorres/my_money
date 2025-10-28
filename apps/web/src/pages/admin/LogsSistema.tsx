import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { FullScreenSpinner } from '../../components/ui'
import { FileText, RefreshCw } from 'lucide-react'

interface LogEntry {
    id: number
    usuario_id: number | null
    username: string | null
    nombre: string
    accion: string
    ip?: string
    user_agent?: string
    exitoso: boolean
    creado_en: string
    detalles?: string
}

export default function LogsSistema() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [filtro, setFiltro] = useState<'TODOS' | 'ACTIVIDAD' | 'ERRORES'>('TODOS')

    useEffect(() => {
        loadLogs()
    }, [filtro])

    const loadLogs = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            
            let endpoint = 'http://localhost:3001/api/v1/admin/logs'
            
            // Cambiar endpoint según el filtro
            if (filtro === 'ACTIVIDAD') {
                endpoint = 'http://localhost:3001/api/v1/admin/logs/activity'
            } else if (filtro === 'ERRORES') {
                endpoint = 'http://localhost:3001/api/v1/admin/logs/errors'
            }

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                const data = await response.json()
                setLogs(Array.isArray(data) ? data : [])

            } else {

                setLogs([])
            }
        } catch (error) {

            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-PY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return <FullScreenSpinner message="Cargando logs del sistema..." />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <FileText className="text-orange-600 dark:text-orange-400 w-5 h-5" />
                        <span>Logs del Sistema</span>
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Historial de actividades y eventos del sistema • Panel de Administración
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value as any)}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="TODOS">Todos los logs</option>
                        <option value="ACTIVIDAD">Solo actividad exitosa</option>
                        <option value="ERRORES">Solo errores</option>
                    </select>
                    <Button onClick={loadLogs} className="text-xs">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </Button>
                </div>
            </div>

            <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-600">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-gray-400" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">Actividad Reciente ({logs.length})</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Exitosos ({logs.filter(l => l.exitoso).length})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Total ({logs.length})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>Errores ({logs.filter(l => !l.exitoso).length})</span>
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <div className="p-6">
                    {logs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No hay logs para mostrar con el filtro seleccionado
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log: LogEntry) => (
                                <div
                                    key={log.id}
                                    className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${log.exitoso 
                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                                        : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                                        {log.exitoso ? 'ÉXITO' : 'ERROR'}
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {log.username || log.nombre || 'Sistema'}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    • {log.accion}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                {log.ip && <span>{log.ip}</span>}
                                                {log.ip && <span>•</span>}
                                                <span>{formatDate(log.creado_en)}</span>
                                            </div>
                                        </div>
                                        {log.detalles && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {typeof log.detalles === 'string' ? log.detalles : JSON.stringify(log.detalles)}
                                            </p>
                                        )}
                                        {log.user_agent && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                {log.user_agent}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}