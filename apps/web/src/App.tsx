import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Ingresos from './pages/Ingresos'
import GastosFijos from './pages/GastosFijos'
import GastosAdicionales from './pages/GastosAdicionales'
import Tarjetas from './pages/Tarjetas'
import Cuentas from './pages/Cuentas'

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ingresos" element={<Ingresos />} />
                <Route path="/gastos-fijos" element={<GastosFijos />} />
                <Route path="/gastos-adicionales" element={<GastosAdicionales />} />
                <Route path="/tarjetas" element={<Tarjetas />} />
                <Route path="/cuentas" element={<Cuentas />} />
            </Routes>
        </Layout>
    )
}

export default App