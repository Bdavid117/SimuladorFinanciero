import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Lazy-loaded pages (code splitting)
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const LotesPage = lazy(() => import('./pages/Lotes/LotesPage'));
const CompraPage = lazy(() => import('./pages/Transacciones/CompraPage'));
const VentaPage = lazy(() => import('./pages/Transacciones/VentaPage'));
const BonosPage = lazy(() => import('./pages/Calculadoras/BonosPage'));
const CDTPage = lazy(() => import('./pages/Calculadoras/CDTPage'));
const DivisasPage = lazy(() => import('./pages/Calculadoras/DivisasPage'));
const CalificacionPage = lazy(() => import('./pages/Calificacion/CalificacionPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Cargando...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/lotes" element={<LotesPage />} />
                  <Route path="/comprar" element={<CompraPage />} />
                  <Route path="/vender" element={<VentaPage />} />
                  <Route path="/calculadora/bonos" element={<BonosPage />} />
                  <Route path="/calculadora/cdt" element={<CDTPage />} />
                  <Route path="/calculadora/divisas" element={<DivisasPage />} />
                  <Route path="/calificacion" element={<CalificacionPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
