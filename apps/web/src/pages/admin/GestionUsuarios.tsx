import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { FullScreenSpinner } from '../../components/ui'
import { Edit, Trash2, Users } from 'lucide-react'

interface Usuario {
    id: number
    username: string
    nombre: string
    email?: string
    estado: 'ACTIVO' | 'INACTIVO'
    creado_en: string
    ultimo_acceso?: string
}

interface FormData {
    username: string
    nombre: string
    email: string
    password: string
    confirmPassword: string
}

export default function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<Usuario | null>(null)
    const [formData, setFormData] = useState<FormData>({
        username: '',
        nombre: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [actionLoading, setActionLoading] = useState(false)

    // Cargar usuarios
    useEffect(() => {
        loadUsuarios()
    }, [])

    const loadUsuarios = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:3001/api/v1/admin/usuarios', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                const data = await response.json()
                setUsuarios(data)
            } else {

            }
        } catch (error) {
            // Error silencioso
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        // Validaciones
        const newErrors: Record<string, string> = {}
        if (!formData.username.trim()) newErrors.username = 'El usuario es requerido'
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
        if (!editingUser && !formData.password) newErrors.password = 'La contraseña es requerida'
        if (!editingUser && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            setActionLoading(true)
            const token = localStorage.getItem('auth_token')
            const url = editingUser
                ? `http://localhost:3001/api/v1/admin/usuarios/${editingUser.id}`
                : 'http://localhost:3001/api/v1/admin/usuarios'

            const body: any = {
                username: formData.username,
                nombre: formData.nombre,
                email: formData.email || undefined
            }

            if (!editingUser || formData.password) {
                body.password = formData.password
            }

            const response = await fetch(url, {
                method: editingUser ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                setShowModal(false)
                setEditingUser(null)
                setFormData({ username: '', nombre: '', email: '', password: '', confirmPassword: '' })
                loadUsuarios()
            } else {
                const error = await response.json()
                setErrors({ general: error.message || 'Error al guardar usuario' })
            }
        } catch (error) {
            setErrors({ general: 'Error de conexión' })
        } finally {
            setActionLoading(false)
        }
    }

    const handleEdit = (usuario: Usuario) => {
        setEditingUser(usuario)
        setFormData({
            username: usuario.username,
            nombre: usuario.nombre,
            email: usuario.email || '',
            password: '',
            confirmPassword: ''
        })
        setErrors({})
        setShowModal(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return

        try {
            setActionLoading(true)
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`http://localhost:3001/api/v1/admin/usuarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                loadUsuarios()
            } else {

            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleEstado = async (usuario: Usuario) => {
        try {
            setActionLoading(true)
            const token = localStorage.getItem('auth_token')
            const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'

            const response = await fetch(`http://localhost:3001/api/v1/admin/usuarios/${usuario.id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado })
            })

            if (response.ok) {
                loadUsuarios()
            } else {

            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingUser(null)
        setFormData({ username: '', nombre: '', email: '', password: '', confirmPassword: '' })
        setErrors({})
        setShowModal(true)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return <FullScreenSpinner message="Cargando usuarios..." />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <Users className="text-orange-600 dark:text-orange-400 w-5 h-5" />
                        <span>Gestión de Usuarios</span>
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Administra los usuarios del sistema • Panel de Administración
                    </p>
                </div>
                <Button onClick={openCreateModal} className="flex items-center space-x-2 text-sm">
                    <span>➕</span>
                    <span>Nuevo Usuario</span>
                </Button>
            </div>

            <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-600">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                        <Users className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-900 dark:text-white font-bold">Usuarios Registrados ({usuarios.length})</span>
                    </CardTitle>
                </CardHeader>
                <div className="p-6">
                    {usuarios.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No hay usuarios registrados
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Creado</TableHead>
                                        <TableHead>Último Acceso</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usuarios.map((usuario) => (
                                        <TableRow key={usuario.id}>
                                            <TableCell className="font-medium">
                                                @{usuario.username}
                                            </TableCell>
                                            <TableCell>{usuario.nombre}</TableCell>
                                            <TableCell>{usuario.email || '-'}</TableCell>
                                            <TableCell>
                                                <button
                                                    onClick={() => handleToggleEstado(usuario)}
                                                    className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${usuario.estado === 'ACTIVO'
                                                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70'
                                                            : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/70'
                                                        }`}
                                                >
                                                    {usuario.estado}
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {formatDate(usuario.creado_en)}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {usuario.ultimo_acceso
                                                    ? formatDate(usuario.ultimo_acceso)
                                                    : 'Nunca'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleEdit(usuario)}
                                                        className="text-xs"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleDelete(usuario.id)}
                                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Modal de Crear/Editar Usuario */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                        {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Usuario"
                            type="text"
                            value={formData.username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="Nombre de usuario"
                            error={errors.username}
                            required
                        />

                        <Input
                            label="Nombre Completo"
                            type="text"
                            value={formData.nombre}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Nombre completo del usuario"
                            error={errors.nombre}
                            required
                        />

                        <Input
                            label="Email (Opcional)"
                            type="email"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="correo@ejemplo.com"
                            error={errors.email}
                        />

                        <Input
                            label={editingUser ? "Nueva Contraseña (dejar vacío para mantener)" : "Contraseña"}
                            type="password"
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Contraseña"
                            error={errors.password}
                            required={!editingUser}
                        />

                        {!editingUser || formData.password ? (
                            <Input
                                label="Confirmar Contraseña"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Confirmar contraseña"
                                error={errors.confirmPassword}
                                required={!editingUser || !!formData.password}
                            />
                        ) : null}

                        {errors.general && (
                            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                                {errors.general}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowModal(false)}
                                disabled={actionLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <FullScreenSpinner
                message={actionLoading ? "Procesando..." : "Cargando..."}
                show={actionLoading}
            />
        </div>
    )
}