import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Ingresos from './pages/Ingresos'
import GastosFijos from './pages/GastosFijos'
import GastosAdicionales from './pages/GastosAdicionales'
import Ahorros from './pages/Ahorros'
import Movimientos from './pages/Movimientos'
import Tarjetas from './pages/Tarjetas'
import Cuentas from './pages/Cuentas'
import Transferencias from './pages/Transferencias'
import GestionUsuarios from './pages/admin/GestionUsuarios'
import LogsSistema from './pages/admin/LogsSistema'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ProtectedRoute>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/ingresos" element={<Ingresos />} />
                            <Route path="/gastos-fijos" element={<GastosFijos />} />
                            <Route path="/gastos-adicionales" element={<GastosAdicionales />} />
                            <Route path="/ahorros" element={<Ahorros />} />
                            <Route path="/movimientos" element={<Movimientos />} />
                            <Route path="/tarjetas" element={<Tarjetas />} />
                            <Route path="/cuentas" element={<Cuentas />} />
                            <Route path="/transferencias" element={<Transferencias />} />
                            
                            {/* Rutas de Administración */}
                                                            <Route path="/admin/usuarios" element={
                                    <GestionUsuarios />
                                } />
                                <Route path="/admin/logs" element={
                                    <LogsSistema />
                                } />
                        </Routes>
                    </Layout>
                </ProtectedRoute>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App