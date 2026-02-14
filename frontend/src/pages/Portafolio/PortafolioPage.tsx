import { useEffect, useState, useCallback } from 'react';
import { obtenerSaldoCaja, obtenerResumenPortafolio, generarSnapshotValoracion, listarValoraciones } from '../../services/portafolio';
import type { SaldoCaja, ResumenPortafolio, ValoracionDiaria } from '../../types';
import StatCard from '../../components/ui/StatCard';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { Wallet, TrendingUp, TrendingDown, PieChart as PieIcon, Camera, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

export default function PortafolioPage() {
  const [saldo, setSaldo] = useState<SaldoCaja | null>(null);
  const [resumen, setResumen] = useState<ResumenPortafolio | null>(null);
  const [valoraciones, setValoraciones] = useState<ValoracionDiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snapLoading, setSnapLoading] = useState(false);
  const [snapMsg, setSnapMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, r, v] = await Promise.all([
        obtenerSaldoCaja(),
        obtenerResumenPortafolio(),
        listarValoraciones(),
      ]);
      setSaldo(s);
      setResumen(r);
      setValoraciones(v);
    } catch {
      setError('Error al cargar datos del portafolio.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSnapshot() {
    setSnapLoading(true);
    setSnapMsg('');
    try {
      await generarSnapshotValoracion();
      setSnapMsg('Snapshot guardado correctamente.');
      load();
    } catch {
      setSnapMsg('Error al generar snapshot.');
    } finally {
      setSnapLoading(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{error}</p>
          <button onClick={load} className="mt-5 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const chartData = [...valoraciones].reverse().map((v) => ({
    fecha: new Date(v.fecha_valoracion).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
    valor: Number(v.valor_mercado_total),
    costo: Number(v.costo_total_invertido),
  }));

  const gananciaPositiva = resumen && resumen.ganancia_perdida >= 0;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo en Caja"
          value={saldo ? formatCOP(Number(saldo.saldo_actual)) : '-'}
          subtitle={`Moneda: ${saldo?.moneda || 'COP'}`}
          icon={<Wallet size={18} />}
        />
        <StatCard
          title="Inversión Total"
          value={resumen ? formatCOP(Number(resumen.inversion_total)) : '-'}
          subtitle={`${resumen?.total_lotes_activos || 0} lotes activos`}
          icon={<PieIcon size={18} />}
        />
        <StatCard
          title="Valor Estimado"
          value={resumen ? formatCOP(Number(resumen.valor_mercado_estimado)) : '-'}
          subtitle={`${resumen?.total_activos_diferentes || 0} activos diferentes`}
          icon={<BarChart3 size={18} />}
        />
        <StatCard
          title="Ganancia / Pérdida"
          value={resumen ? formatCOP(Number(resumen.ganancia_perdida)) : '-'}
          subtitle={`Rentabilidad: ${resumen ? resumen.rentabilidad_porcentaje.toFixed(2) : '0.00'}%`}
          icon={gananciaPositiva ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        />
      </div>

      {/* Snapshot + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Snapshot Action Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mb-4">
            <Camera size={22} className="text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Snapshot Diario</h3>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            Guarda una foto del estado actual del portafolio para el historial de valoraciones.
          </p>
          <button
            onClick={handleSnapshot}
            disabled={snapLoading}
            className="px-5 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {snapLoading ? 'Guardando...' : 'Tomar Snapshot'}
          </button>
          {snapMsg && (
            <p className={`text-[11px] mt-3 ${snapMsg.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`}>
              {snapMsg}
            </p>
          )}
        </div>

        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-5">
            Evolución del Portafolio
          </h3>
          {chartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCosto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => formatCOP(Number(v))} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="costo" stroke="#94a3b8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCosto)" name="Costo invertido" />
                  <Area type="monotone" dataKey="valor" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorValor)" name="Valor mercado" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-xs text-slate-400">Aún no hay snapshots. Toma uno para comenzar a ver la evolución.</p>
            </div>
          )}
        </div>
      </div>

      {/* Valoraciones Table */}
      {valoraciones.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Historial de Valoraciones
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Valor Mercado</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Costo Invertido</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">G/P</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rentabilidad</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Efectivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {valoraciones.map((v) => {
                  const gp = Number(v.ganancia_perdida || 0);
                  return (
                    <tr key={v.id_valoracion} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-3 text-xs text-slate-600 dark:text-slate-400">
                        {new Date(v.fecha_valoracion).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-xs text-slate-800 dark:text-slate-100 font-medium">
                        {formatCOP(Number(v.valor_mercado_total))}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                        {formatCOP(Number(v.costo_total_invertido))}
                      </td>
                      <td className={`px-6 py-3 text-right font-mono text-xs font-medium ${gp >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {formatCOP(gp)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
                        {v.rentabilidad_porcentaje != null ? `${Number(v.rentabilidad_porcentaje).toFixed(2)}%` : '-'}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                        {v.efectivo_disponible != null ? formatCOP(Number(v.efectivo_disponible)) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
