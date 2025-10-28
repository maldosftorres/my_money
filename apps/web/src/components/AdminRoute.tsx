import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface AdminRouteProps {
  children: ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth()
  
  // Verificar si el usuario es administrador
  const isAdmin = user?.username === 'admin' || user?.email?.includes('admin')
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}