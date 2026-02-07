import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/lotes': 'Inventario de Lotes',
  '/comprar': 'Comprar Activo',
  '/vender': 'Vender Activo',
  '/calculadora/bonos': 'Valoracion de Bonos',
  '/calculadora/cdt': 'Liquidacion CDT',
  '/calculadora/divisas': 'Conversion de Divisas',
  '/calificacion': 'Calificacion del Portafolio',
};

export default function MainLayout() {
  const location = useLocation();
  const pageTitle = titles[location.pathname] || 'SimInversiones';

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
          <h2 className="text-sm font-semibold text-slate-800">{pageTitle}</h2>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs text-slate-400">
              API: <span className="text-emerald-600 font-medium">Conectado</span>
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
