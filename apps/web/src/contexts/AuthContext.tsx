import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: number
  username: string
  nombre: string
  email?: string
  estado: 'ACTIVO' | 'INACTIVO'
  creado_en: string
  ultimo_acceso?: string
  rol: 'ADMIN' | 'USUARIO'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  loginLoading: boolean
  logoutLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      validateToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setToken(tokenToValidate)
      } else {
        // Token is invalid
        localStorage.removeItem('auth_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Error validating token:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    setLoginLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al iniciar sesión')
      }

      const { user: userData, token: userToken } = await response.json()
      
      setUser(userData)
      setToken(userToken)
      localStorage.setItem('auth_token', userToken)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoginLoading(false)
    }
  }

  const logout = async () => {
    setLogoutLoading(true)
    try {
      if (token) {
        await fetch('http://localhost:3001/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
      setLogoutLoading(false)
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    loginLoading,
    logoutLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}