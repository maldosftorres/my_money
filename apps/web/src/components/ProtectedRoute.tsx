import { ReactNode } from 'react'
import { DollarSign } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Login from '../pages/Login'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <DollarSign className="w-16 h-16 text-orange-600 mx-auto" />
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Cargando...
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <>{children}</>
}