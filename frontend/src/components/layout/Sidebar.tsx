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
  LogOut,
  X,
  Briefcase,
  History,
  PieChart,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const sections = [
  {
    title: 'GENERAL',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/portafolio', icon: PieChart, label: 'Mi Portafolio' },
      { to: '/lotes', icon: Package, label: 'Inventario de Lotes' },
      { to: '/activos', icon: Briefcase, label: 'Catálogo Activos' },
      { to: '/transacciones', icon: History, label: 'Transacciones' },
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

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const initials = user?.nombre?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-white flex flex-col min-h-screen border-r border-slate-800 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
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
          <button onClick={onClose} className="lg:hidden p-1 text-slate-500 hover:text-white transition-colors" aria-label="Close sidebar">
            <X size={18} />
          </button>
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
                      onClick={onClose}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${isActive
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
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user?.nombre || 'Usuario'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
            </div>
            <button onClick={logout} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Cerrar sesión">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
