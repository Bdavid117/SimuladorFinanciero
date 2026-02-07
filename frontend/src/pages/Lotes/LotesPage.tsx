import { useEffect, useState } from 'react';
import { listarLotes } from '../../services/lotes';
import type { LoteResponse, EstadoLote } from '../../types';
import SemaforoBadge from '../../components/ui/SemaforoBadge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import { Download } from 'lucide-react';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}
function formatDate(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function LotesPage() {
  const [lotes, setLotes] = useState<LoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<string>('todos');

  useEffect(() => { loadLotes(); }, []);

  async function loadLotes() {
    setLoading(true);
    setError('');
    try {
      const data = await listarLotes();
      setLotes(data);
    } catch {
      setError('Error al cargar lotes. Verifica la conexion con el backend.');
    } finally {
      setLoading(false);
    }
  }

  const filtrados = filtro === 'todos' ? lotes : lotes.filter((l) => l.estado === filtro);
  const counts = {
    todos: lotes.length,
    VERDE: lotes.filter((l) => l.estado === 'VERDE').length,
    AMARILLO: lotes.filter((l) => l.estado === 'AMARILLO').length,
    ROJO: lotes.filter((l) => l.estado === 'ROJO').length,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(['todos', 'VERDE', 'AMARILLO', 'ROJO'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filtro === f
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {f === 'todos' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="ml-1.5 opacity-60">{counts[f]}</span>
          </button>
        ))}
        {lotes.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => exportToCSV(filtrados.map(l => ({
                Estado: l.estado, ID: l.id_lote.slice(0, 8), Cantidad: l.cantidad_inicial,
                Disponible: l.cantidad_disponible, Precio: l.precio_compra, Costo: l.costo_total,
                Progreso: `${l.porcentaje_disponible.toFixed(0)}%`, Fecha: l.fecha_compra,
              })), 'lotes')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
            >
              <Download size={11} /> CSV
            </button>
            <button
              onClick={() => exportToJSON(filtrados, 'lotes')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
            >
              <Download size={11} /> JSON
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ID Lote</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cant. Inicial</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Disponible</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Precio Compra</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Costo Total</th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Progreso</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-xs text-slate-400">
                      No se encontraron lotes{filtro !== 'todos' ? ` con estado ${filtro}` : ''}
                    </td>
                  </tr>
                ) : (
                  filtrados.map((lote) => (
                    <tr key={lote.id_lote} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3">
                        <SemaforoBadge estado={lote.estado as EstadoLote} size="sm" />
                      </td>
                      <td className="px-5 py-3">
                        <code className="text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                          {lote.id_lote.slice(0, 8)}
                        </code>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-600">
                        {Number(lote.cantidad_inicial).toLocaleString('es-CO')}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-800 font-medium">
                        {Number(lote.cantidad_disponible).toLocaleString('es-CO')}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-600">
                        {formatCOP(Number(lote.precio_compra))}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-800 font-medium">
                        {formatCOP(Number(lote.costo_total))}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-14 bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                lote.porcentaje_disponible === 100 ? 'bg-emerald-500'
                                  : lote.porcentaje_disponible > 0 ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${lote.porcentaje_disponible}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono w-7 text-right">
                            {lote.porcentaje_disponible.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {formatDate(lote.fecha_compra)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
