import { useEffect, useState, useCallback } from 'react';
import { listarTransacciones } from '../../services/transacciones';
import type { TransaccionItem } from '../../types';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { exportToCSV } from '../../utils/exportUtils';
import { History, Download, ChevronLeft, ChevronRight } from 'lucide-react';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}
function formatDate(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const TIPO_COLORS: Record<string, string> = {
  COMPRA: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  VENTA: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DEPOSITO: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  RETIRO: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LIQUIDACION_CDT: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const TIPOS_OPERACION = ['COMPRA', 'VENTA', 'DEPOSITO', 'RETIRO', 'LIQUIDACION_CDT'] as const;

export default function TransaccionesPage() {
  const [items, setItems] = useState<TransaccionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [porPagina] = useState(15);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listarTransacciones({
        tipo: filtroTipo || undefined,
        pagina,
        por_pagina: porPagina,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPaginas(res.total_paginas);
    } catch {
      setError('Error al cargar transacciones.');
    } finally {
      setLoading(false);
    }
  }, [filtroTipo, pagina, porPagina]);

  useEffect(() => { load(); }, [load]);

  // Reset page on filter change
  useEffect(() => { setPagina(1); }, [filtroTipo]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
            <History size={18} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Historial de Transacciones</h2>
            <p className="text-[11px] text-slate-400">{total} transacciones en total</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => exportToCSV(items.map((t) => ({
              Fecha: t.fecha_transaccion, Tipo: t.tipo_operacion, Activo: t.ticker_activo || '-',
              Cantidad: t.cantidad, Precio: t.precio, Comisión: t.comision, Monto: t.monto_operacion,
              'Saldo Antes': t.saldo_caja_antes, 'Saldo Después': t.saldo_caja_despues,
            })), 'transacciones')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Download size={12} /> Exportar CSV
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFiltroTipo('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filtroTipo
            ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          Todas
        </button>
        {TIPOS_OPERACION.map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filtroTipo === tipo
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {tipo.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fecha</th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Activo</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cantidad</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Precio</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monto</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-xs text-slate-400">
                      No hay transacciones{filtroTipo ? ` de tipo ${filtroTipo}` : ''}
                    </td>
                  </tr>
                ) : (
                  items.map((tx) => (
                    <tr key={tx.id_transaccion} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(tx.fecha_transaccion)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md ${TIPO_COLORS[tx.tipo_operacion] || 'bg-slate-100 text-slate-600'}`}>
                          {tx.tipo_operacion.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                        {tx.ticker_activo || '-'}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                        {Number(tx.cantidad).toLocaleString('es-CO')}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                        {tx.precio ? formatCOP(Number(tx.precio)) : '-'}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs font-medium text-slate-800 dark:text-slate-100">
                        {formatCOP(Number(tx.monto_operacion))}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
                        {tx.saldo_caja_despues != null ? formatCOP(Number(tx.saldo_caja_despues)) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <p className="text-[11px] text-slate-400">
                Página {pagina} de {totalPaginas} — {total} registros
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  aria-label="Página siguiente"
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
