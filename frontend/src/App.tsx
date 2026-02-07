import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LotesPage from './pages/Lotes/LotesPage';
import CompraPage from './pages/Transacciones/CompraPage';
import VentaPage from './pages/Transacciones/VentaPage';
import BonosPage from './pages/Calculadoras/BonosPage';
import CDTPage from './pages/Calculadoras/CDTPage';
import DivisasPage from './pages/Calculadoras/DivisasPage';
import CalificacionPage from './pages/Calificacion/CalificacionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/lotes" element={<LotesPage />} />
          <Route path="/comprar" element={<CompraPage />} />
          <Route path="/vender" element={<VentaPage />} />
          <Route path="/calculadora/bonos" element={<BonosPage />} />
          <Route path="/calculadora/cdt" element={<CDTPage />} />
          <Route path="/calculadora/divisas" element={<DivisasPage />} />
          <Route path="/calificacion" element={<CalificacionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
