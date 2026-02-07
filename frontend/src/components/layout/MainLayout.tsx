import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ThemeToggle from '../ui/ThemeToggle';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-slate-900 transition-colors">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 lg:px-8 shrink-0 transition-colors">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 mr-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{pageTitle}</h2>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
              API: <span className="text-emerald-600 dark:text-emerald-400 font-medium">Conectado</span>
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
