import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  Landmark,
  Calculator,
  DollarSign,
  Award,
  ChevronRight,
} from 'lucide-react';

const sections = [
  {
    title: 'GENERAL',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/lotes', icon: Package, label: 'Inventario de Lotes' },
    ],
  },
  {
    title: 'OPERACIONES',
    items: [
      { to: '/comprar', icon: ArrowUpCircle, label: 'Comprar Activo' },
      { to: '/vender', icon: ArrowDownCircle, label: 'Vender Activo' },
    ],
  },
  {
    title: 'HERRAMIENTAS',
    items: [
      { to: '/calculadora/bonos', icon: Landmark, label: 'Valoracion Bonos' },
      { to: '/calculadora/cdt', icon: Calculator, label: 'Liquidacion CDT' },
      { to: '/calculadora/divisas', icon: DollarSign, label: 'Conversion Divisas' },
      { to: '/calificacion', icon: Award, label: 'Calificacion' },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 bg-[#0f172a] text-white flex flex-col min-h-screen border-r border-slate-800">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Landmark size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">
              SimInversiones
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Portafolio Manager
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto scrollbar-thin">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-600/15 text-emerald-400 border-l-2 border-emerald-400 -ml-px'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <item.icon
                      size={17}
                      className={isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-emerald-400/60" />}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            BD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">Usuario Demo</p>
            <p className="text-[10px] text-slate-500 truncate">demo@simulador.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
