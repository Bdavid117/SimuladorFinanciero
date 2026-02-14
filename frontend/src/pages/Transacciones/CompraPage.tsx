import { useState, useEffect, useMemo } from 'react';
import { comprarActivo } from '../../services/lotes';
import { listarActivos } from '../../services/activos';
import { obtenerSaldoCaja } from '../../services/portafolio';
import { useAuth } from '../../contexts/AuthContext';
import InputField from '../../components/ui/InputField';
import ResultRow from '../../components/ui/ResultRow';
import SemaforoBadge from '../../components/ui/SemaforoBadge';
import type { Activo, EstadoLote, SaldoCaja } from '../../types';
import { ShoppingCart, Search, AlertTriangle, CheckCircle2, Info, Wallet } from 'lucide-react';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

export default function CompraPage() {
  const { user } = useAuth();

  /* ── catálogo + saldo ────────────────────────────────────── */
  const [activos, setActivos] = useState<Activo[]>([]);
  const [saldo, setSaldo] = useState<SaldoCaja | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    listarActivos().then(setActivos).catch(() => {});
    obtenerSaldoCaja().then(setSaldo).catch(() => {});
  }, []);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return activos;
    const q = busqueda.toLowerCase();
    return activos.filter(
      (a) => a.ticker.toLowerCase().includes(q) || a.nombre.toLowerCase().includes(q)
    );
  }, [activos, busqueda]);

  /* ── formulario ──────────────────────────────────────────── */
  const [seleccionado, setSeleccionado] = useState<Activo | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [comision, setComision] = useState('');
  const [trm, setTrm] = useState('');
  const [urlEvidencia, setUrlEvidencia] = useState('');
  const [notas, setNotas] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [confirmar, setConfirmar] = useState(false);

  /* auto-fill TRM si el activo es extranjero */
  useEffect(() => {
    if (seleccionado?.es_extranjero && !trm) setTrm('4800');
    if (seleccionado && !seleccionado.es_extranjero) setTrm('');
  }, [seleccionado]); // eslint-disable-line react-hooks/exhaustive-deps

  /* cálculo en vivo del costo estimado */
  const costoEstimado = useMemo(() => {
    const cant = Number(cantidad) || 0;
    const precio = Number(precioCompra) || 0;
    const t = Number(trm) || 1;
    const com = Number(comision) || 0;
    return cant * precio * t + com;
  }, [cantidad, precioCompra, trm, comision]);

  const saldoInsuficiente = saldo ? costoEstimado > Number(saldo.saldo_actual) : false;

  function seleccionarActivo(a: Activo) {
    setSeleccionado(a);
    setResult(null);
    setError('');
    setConfirmar(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!seleccionado || !cantidad || !precioCompra) {
      setError('Selecciona un activo, ingresa cantidad y precio de compra.');
      return;
    }
    if (saldoInsuficiente) {
      setError('No tienes saldo suficiente en tu caja de ahorros para esta compra.');
      return;
    }
    /* doble confirmación */
    if (!confirmar) {
      setConfirmar(true);
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await comprarActivo({
        id_usuario: user?.id_usuario || '',
        id_activo: seleccionado.id_activo,
        cantidad: Number(cantidad),
        precio_compra: Number(precioCompra),
        comision: comision ? Number(comision) : undefined,
        trm: trm ? Number(trm) : undefined,
        url_evidencia: urlEvidencia || undefined,
        notas: notas || undefined,
      });
      setResult(data);
      setConfirmar(false);
      /* refrescar saldo */
      obtenerSaldoCaja().then(setSaldo).catch(() => {});
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(msg || 'Error al registrar la compra.');
      setConfirmar(false);
    } finally {
      setLoading(false);
    }
  }

  /* ── helper para extraer datos del lote creado ── */
  const lote = result?.lote as Record<string, unknown> | undefined;

  return (
    <div className="max-w-5xl space-y-6">
      {/* ── Saldo disponible ─────────────────────────────── */}
      {saldo && (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 px-5 py-3">
          <Wallet size={18} className="text-emerald-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Saldo en caja:</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {formatCOP(Number(saldo.saldo_actual))}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Panel 1: Selector de activos ──────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShoppingCart size={16} className="text-emerald-500" />
              Seleccionar Activo
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Elige el activo que deseas comprar</p>
          </div>
          <div className="p-3">
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por ticker o nombre..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-1 scrollbar-thin">
              {filtrados.length === 0 && (
                <p className="text-[11px] text-slate-400 text-center py-6">No se encontraron activos</p>
              )}
              {filtrados.map((a) => (
                <button
                  key={a.id_activo}
                  type="button"
                  onClick={() => seleccionarActivo(a)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                    seleccionado?.id_activo === a.id_activo
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{a.ticker}</span>
                      <span className="text-slate-400 ml-2">{a.nombre}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      a.es_extranjero
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {a.tipo_nombre || a.moneda}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {a.mercado} · {a.moneda}
                    {a.es_extranjero && ' · Extranjero (requiere TRM)'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel 2: Formulario de compra ─────────────── */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Datos de la Compra</h3>
              {seleccionado ? (
                <p className="text-[11px] text-emerald-500 mt-0.5 font-medium">
                  {seleccionado.ticker} — {seleccionado.nombre}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-0.5">Selecciona un activo del panel izquierdo</p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!seleccionado && (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <Info size={14} className="text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">Primero selecciona un activo del catálogo para continuar.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Cantidad" type="number" value={cantidad} onChange={setCantidad} placeholder="Ej: 100" required min="1" step="any" />
                <InputField label="Precio unitario" type="number" value={precioCompra} onChange={setPrecioCompra} prefix="$" placeholder="Precio por unidad" required step="any" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Comisión" type="number" value={comision} onChange={setComision} prefix="$" placeholder="0 (opcional)" step="any" />
                {seleccionado?.es_extranjero ? (
                  <InputField label="TRM (Tasa de cambio)" type="number" value={trm} onChange={setTrm} prefix="$" placeholder="Ej: 4800" required step="any" />
                ) : (
                  <InputField label="TRM (Solo extranjeros)" type="number" value={trm} onChange={setTrm} prefix="$" placeholder="No aplica" step="any" />
                )}
              </div>

              {/* Costo estimado en vivo */}
              {Number(cantidad) > 0 && Number(precioCompra) > 0 && (
                <div className={`rounded-lg p-3 border ${
                  saldoInsuficiente
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Costo total estimado</span>
                    <span className={`text-sm font-bold ${saldoInsuficiente ? 'text-red-600' : 'text-slate-800 dark:text-slate-100'}`}>
                      {formatCOP(costoEstimado)}
                    </span>
                  </div>
                  {saldoInsuficiente && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <AlertTriangle size={12} className="text-red-500" />
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">Saldo insuficiente</span>
                    </div>
                  )}
                </div>
              )}

              <InputField label="URL Evidencia (screenshot del precio)" value={urlEvidencia} onChange={setUrlEvidencia} placeholder="https://..." />

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Notas / Fuente de información</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
                  placeholder="Fuente del precio, notas adicionales..."
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <AlertTriangle size={14} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Doble confirmación */}
              {confirmar && !loading && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">¿Confirmar esta compra?</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mb-3">
                    {seleccionado?.ticker} — {Number(cantidad).toLocaleString('es-CO')} unidades × {formatCOP(Number(precioCompra))} = <strong>{formatCOP(costoEstimado)}</strong>
                  </p>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">
                      Sí, Confirmar Compra
                    </button>
                    <button type="button" onClick={() => setConfirmar(false)} className="px-4 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {!confirmar && (
                <button
                  type="submit"
                  disabled={loading || !seleccionado || saldoInsuficiente}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Procesando...
                    </span>
                  ) : 'Registrar Compra'}
                </button>
              )}
            </form>
          </div>

          {/* ── Resultado exitoso ────────────────────────── */}
          {result && lote && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Compra Registrada Exitosamente</h3>
                  <p className="text-xs text-slate-400">Lote creado y agregado al portafolio</p>
                </div>
                {typeof lote.estado === 'string' && (
                  <div className="ml-auto"><SemaforoBadge estado={lote.estado as EstadoLote} /></div>
                )}
              </div>
              <div className="space-y-0 divide-y divide-slate-50 dark:divide-slate-700">
                <ResultRow label="Activo" value={`${seleccionado?.ticker || ''} — ${seleccionado?.nombre || ''}`} />
                {lote.costo_total != null && (
                  <ResultRow label="Costo Total" value={formatCOP(Number(lote.costo_total))} highlight />
                )}
                {lote.cantidad_inicial != null && <ResultRow label="Cantidad" value={Number(lote.cantidad_inicial).toLocaleString('es-CO')} />}
                {typeof lote.fecha_compra === 'string' && <ResultRow label="Fecha" value={new Date(lote.fecha_compra).toLocaleDateString('es-CO')} />}
                {saldo && <ResultRow label="Saldo Restante" value={formatCOP(Number(saldo.saldo_actual))} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
