import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  DollarSign, 
  Home, 
  ShoppingCart, 
  CreditCard, 
  Building2,
  ArrowLeftRight,
  ArrowUpDown,
  Users,
  FileText
} from 'lucide-react'
import { ThemeToggle } from './ui/ThemeToggle'
import { FullScreenSpinner } from './ui'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Ingresos', href: '/ingresos', icon: DollarSign },
  { name: 'Gastos Fijos', href: '/gastos-fijos', icon: Home },
  { name: 'Gastos Adicionales', href: '/gastos-adicionales', icon: ShoppingCart },
  { name: 'Transferencias', href: '/transferencias', icon: ArrowUpDown },
  { name: 'Movimientos', href: '/movimientos', icon: ArrowLeftRight },
  { name: 'Tarjetas', href: '/tarjetas', icon: CreditCard },
  { name: 'Cuentas', href: '/cuentas', icon: Building2 },
]

const adminMenuItems = [
  { name: 'Gestión de Usuarios', href: '/admin/usuarios', icon: Users },
  { name: 'Logs del Sistema', href: '/admin/logs', icon: FileText },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, logout, logoutLoading } = useAuth()
  
  // Verificar si el usuario es administrador
  const isAdmin = user?.rol === 'ADMIN'
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen')
      return saved ? JSON.parse(saved) : window.innerWidth >= 1024
    }
    return true
  })
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024
    }
    return false
  })
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      // En desktop, restaurar estado guardado
      if (!mobile) {
        const saved = localStorage.getItem('sidebarOpen')
        setSidebarOpen(saved ? JSON.parse(saved) : true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Guardar estado del sidebar en localStorage (solo para desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen))
    }
  }, [sidebarOpen, isMobile])

  // Cerrar sidebar en móvil cuando cambia la ruta
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center h-16">
            {/* Esquina izquierda - Menú y título */}
            <div className="flex items-center">
              <button
                id="sidebar-trigger"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200 flex items-center">
                <DollarSign className="w-6 h-6 mr-2" /> My Money
              </h1>
            </div>

            {/* Centro - Fecha (posición absoluta) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden sm:block text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200 uppercase">
              {new Date().toLocaleDateString('es-PY', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>

            {/* Esquina derecha - Toggle tema y usuario */}
            <div className="flex items-center space-x-3">
              <ThemeToggle size="md" />
              
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="hidden md:block text-right">
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {user.nombre}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </div>
                    </div>
                    <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        {user.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="py-1">
                          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-medium text-gray-900 dark:text-white">
                              {user.nombre}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              @{user.username}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false)
                              logout()
                            }}
                            disabled={logoutLoading}
                            className="w-full flex items-center px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Overlay para móvil */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Unificado */}
        <aside
          className={`${
            isMobile 
              ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : `fixed left-0 top-16 bottom-0 z-20 transition-all duration-300 ease-in-out ${
                  sidebarOpen ? 'w-64' : 'w-16'
                }`
          } bg-white dark:bg-gray-800 shadow-sm overflow-hidden`}
        >
          <div className={`${isMobile ? 'w-64' : sidebarOpen ? 'w-64' : 'w-16'} h-full flex flex-col transition-all duration-300`}>
            {/* Header del sidebar - solo en móvil */}
            {isMobile && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  <DollarSign className="w-6 h-6 mr-2" /> My Money
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  aria-label="Cerrar menú"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Navegación */}
            <nav className={`${isMobile ? 'p-4' : sidebarOpen ? 'p-4' : 'p-2'} space-y-2 flex-1 ${
              isMobile || sidebarOpen ? 'overflow-y-auto' : 'overflow-hidden'
            } transition-all duration-300`}>
              {/* Navegación principal */}
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center ${
                      isMobile || sidebarOpen 
                        ? 'px-4 py-2 justify-start' 
                        : 'px-2 py-2 justify-center'
                    } text-sm font-medium rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title={!sidebarOpen && !isMobile ? item.name : undefined}
                  >
                    <span className={`${isMobile || sidebarOpen ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0 transition-all duration-200`}>
                      <item.icon className="w-full h-full" />
                    </span>
                    {(isMobile || sidebarOpen) && (
                      <span className="ml-3 transition-all duration-200">
                        {item.name}
                      </span>
                    )}
                    
                    {/* Tooltip para modo contraído en desktop */}
                    {!isMobile && !sidebarOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                      </div>
                    )}
                  </Link>
                )
              })}
              
              {/* Sección de Administración - Solo para administradores */}
              {isAdmin && (
                <>
                  <div className={`${isMobile || sidebarOpen ? 'px-4 py-2' : 'px-2 py-2'} transition-all duration-300`}>
                    <div className={`${isMobile || sidebarOpen ? 'block' : 'hidden'} border-t border-gray-200 dark:border-gray-700`}></div>
                    {(isMobile || sidebarOpen) && (
                      <h3 className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Administración
                      </h3>
                    )}
                  </div>
                  
                  {adminMenuItems.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center ${
                          isMobile || sidebarOpen 
                            ? 'px-4 py-2 justify-start' 
                            : 'px-2 py-2 justify-center'
                        } text-sm font-medium rounded-lg transition-all duration-200 group relative ${
                          isActive
                            ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300'
                        }`}
                        title={!sidebarOpen && !isMobile ? item.name : undefined}
                      >
                        <span className={`${isMobile || sidebarOpen ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0 transition-all duration-200`}>
                          <item.icon className="w-full h-full" />
                        </span>
                        {(isMobile || sidebarOpen) && (
                          <span className="ml-3 transition-all duration-200">
                            {item.name}
                          </span>
                        )}
                        
                        {/* Tooltip para modo contraído en desktop */}
                        {!isMobile && !sidebarOpen && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {item.name}
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </>
              )}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 transition-all duration-300 min-h-screen ${
          !isMobile ? (sidebarOpen ? 'ml-64' : 'ml-16') : 'ml-0'
        }`}>
          <div className="max-w-full mx-auto pt-16">
            {children}
          </div>
        </main>
      </div>
      
      <FullScreenSpinner 
        message="Cerrando sesión..." 
        show={logoutLoading} 
      />
    </div>
  )
}