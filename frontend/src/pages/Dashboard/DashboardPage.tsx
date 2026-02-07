import { useEffect, useState } from 'react';
import { obtenerDashboard, obtenerResumen } from '../../services/lotes';
import type { DashboardResponse } from '../../types';
import StatCard from '../../components/ui/StatCard';
import SemaforoBadge from '../../components/ui/SemaforoBadge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { Package, CircleDollarSign, TrendingUp, BarChart3, Download } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';

const SEMAFORO = ['#10b981', '#f59e0b', '#ef4444'];

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [resumen, setResumen] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [dash, res] = await Promise.all([obtenerDashboard(), obtenerResumen()]);
      setDashboard(dash);
      setResumen(res);
    } catch {
      setError('No se pudieron cargar los datos. Verifica que el backend este corriendo en puerto 8000.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Error al cargar</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{error}</p>
          <button
            onClick={loadData}
            className="mt-5 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const pieData = dashboard
    ? [
        { name: 'Activos', value: dashboard.lotes_verdes, color: SEMAFORO[0] },
        { name: 'Parciales', value: dashboard.lotes_amarillos, color: SEMAFORO[1] },
        { name: 'Agotados', value: dashboard.lotes_rojos, color: SEMAFORO[2] },
      ].filter((d) => d.value > 0)
    : [];

  const barData = resumen.map((r) => ({
    nombre: (r as Record<string, unknown>).ticker || 'N/A',
    inversion: Number((r as Record<string, unknown>).inversion_total || 0),
  }));

  return (
    <div className="space-y-8 max-w-7xl">
      {/* KPIs */}
      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Lotes"
            value={dashboard.total_lotes}
            subtitle="Lotes registrados en el sistema"
            icon={<Package size={18} />}
          />
          <StatCard
            title="Inversion Total"
            value={formatCOP(dashboard.inversion_total)}
            subtitle="Capital invertido acumulado"
            icon={<CircleDollarSign size={18} />}
          />
          <StatCard
            title="Lotes Disponibles"
            value={dashboard.lotes_verdes + dashboard.lotes_amarillos}
            subtitle={`${dashboard.porcentaje_verde.toFixed(0)}% completamente activos`}
            icon={<TrendingUp size={18} />}
          />
          <StatCard
            title="Unidades Disponibles"
            value={Number(dashboard.cantidad_disponible_total).toLocaleString('es-CO')}
            subtitle="Total en inventario"
            icon={<BarChart3 size={18} />}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-5">
            Estado de Lotes
          </h3>
          {pieData.length > 0 ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {dashboard && (
                <div className="flex justify-center gap-5 mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <SemaforoBadge estado="VERDE" size="sm" />
                    <span className="font-mono font-medium">{dashboard.lotes_verdes}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <SemaforoBadge estado="AMARILLO" size="sm" />
                    <span className="font-mono font-medium">{dashboard.lotes_amarillos}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <SemaforoBadge estado="ROJO" size="sm" />
                    <span className="font-mono font-medium">{dashboard.lotes_rojos}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <p className="text-xs text-slate-400">Sin lotes registrados</p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-5">
            Inversion por Activo
          </h3>
          {barData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => formatCOP(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="inversion" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <p className="text-xs text-slate-400">Sin datos de inversion aun</p>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {resumen.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Detalle por Activo
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(resumen.map(r => {
                  const item = r as Record<string, unknown>;
                  return { Activo: item.ticker || item.nombre_activo, Cantidad: item.cantidad_total, Disponible: item.cantidad_disponible, Inversion: item.inversion_total, Lotes: item.num_lotes };
                }), 'dashboard-activos')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
              >
                <Download size={11} /> CSV
              </button>
              <button
                onClick={() => exportToPDF('dashboard-activos')}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
              >
                <Download size={11} /> PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Activo</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cantidad</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Disponible</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inversion</th>
                  <th className="text-center px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lotes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {resumen.map((r, i) => {
                  const item = r as Record<string, unknown>;
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-slate-800 dark:text-slate-100 text-xs">{String(item.ticker || item.nombre_activo || '-')}</p>
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                        {Number(item.cantidad_total || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                        {Number(item.cantidad_disponible || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono text-xs font-medium text-slate-800 dark:text-slate-100">
                        {formatCOP(Number(item.inversion_total || 0))}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {Number(item.num_lotes || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advanced Area Chart */}
      {barData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-6">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-5">
            Distribucion de Inversion (Area)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={barData}>
                <defs>
                  <linearGradient id="colorInversion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCOP(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="inversion" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInversion)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
