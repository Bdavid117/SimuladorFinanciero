import { useState, useEffect, useMemo } from 'react';
import { venderActivo, listarLotes } from '../../services/lotes';
import { listarActivos } from '../../services/activos';
import { obtenerSaldoCaja } from '../../services/portafolio';
import { useAuth } from '../../contexts/AuthContext';
import InputField from '../../components/ui/InputField';
import ResultRow from '../../components/ui/ResultRow';
import type { Activo, SaldoCaja } from '../../types';
import { TrendingDown, Search, AlertTriangle, CheckCircle2, Info, Wallet, Package } from 'lucide-react';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

interface LoteInfo {
  id_lote: string;
  cantidad_actual: number;
  precio_compra: number;
  fecha_compra: string;
  estado: string;
}

export default function VentaPage() {
  const { user } = useAuth();

  /* ── catálogo + saldo + lotes ────────────────────────────── */
  const [activos, setActivos] = useState<Activo[]>([]);
  const [saldo, setSaldo] = useState<SaldoCaja | null>(null);
  const [lotesUsuario, setLotesUsuario] = useState<LoteInfo[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    listarActivos().then(setActivos).catch(() => {});
    obtenerSaldoCaja().then(setSaldo).catch(() => {});
    listarLotes().then((data) => setLotesUsuario(data as unknown as LoteInfo[])).catch(() => {});
  }, []);

  /* filtrar solo activos que el usuario posee (tiene lotes) */
  const activosConLotes = useMemo(() => {
    const idsConLotes = new Set(
      lotesUsuario.filter((l) => l.cantidad_actual > 0).map((l) => (l as Record<string, unknown>).id_activo as string)
    );
    return activos.filter((a) => idsConLotes.has(a.id_activo));
  }, [activos, lotesUsuario]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return activosConLotes;
    const q = busqueda.toLowerCase();
    return activosConLotes.filter(
      (a) => a.ticker.toLowerCase().includes(q) || a.nombre.toLowerCase().includes(q)
    );
  }, [activosConLotes, busqueda]);

  /* ── formulario ──────────────────────────────────────────── */
  const [seleccionado, setSeleccionado] = useState<Activo | null>(null);
  const [tipoVenta, setTipoVenta] = useState<'total' | 'parcial'>('parcial');
  const [cantidad, setCantidad] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [comision, setComision] = useState('');
  const [trm, setTrm] = useState('');
  const [urlEvidencia, setUrlEvidencia] = useState('');
  const [notas, setNotas] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [confirmar, setConfirmar] = useState(false);

  /* cantidad disponible del activo seleccionado */
  const disponible = useMemo(() => {
    if (!seleccionado) return 0;
    return lotesUsuario
      .filter((l) => (l as Record<string, unknown>).id_activo === seleccionado.id_activo && l.cantidad_actual > 0)
      .reduce((sum, l) => sum + l.cantidad_actual, 0);
  }, [seleccionado, lotesUsuario]);

  /* auto-fill TRM si el activo es extranjero */
  useEffect(() => {
    if (seleccionado?.es_extranjero && !trm) setTrm('4800');
    if (seleccionado && !seleccionado.es_extranjero) setTrm('');
  }, [seleccionado]); // eslint-disable-line react-hooks/exhaustive-deps

  /* venta total → auto-set cantidad = disponible */
  useEffect(() => {
    if (tipoVenta === 'total' && disponible > 0) setCantidad(String(disponible));
  }, [tipoVenta, disponible]);

  /* estimación de ingreso */
  const ingresoEstimado = useMemo(() => {
    const cant = Number(cantidad) || 0;
    const precio = Number(precioVenta) || 0;
    const t = seleccionado?.es_extranjero ? (Number(trm) || 1) : 1;
    const com = Number(comision) || 0;
    return cant * precio * t - com;
  }, [cantidad, precioVenta, trm, comision, seleccionado]);

  const excedeCantidad = Number(cantidad) > disponible;

  function seleccionarActivo(a: Activo) {
    setSeleccionado(a);
    setResult(null);
    setError('');
    setConfirmar(false);
    setCantidad('');
    setTipoVenta('parcial');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!seleccionado || !cantidad || !precioVenta) {
      setError('Selecciona un activo, ingresa cantidad y precio de venta.');
      return;
    }
    if (excedeCantidad) {
      setError(`Solo dispones de ${disponible.toLocaleString('es-CO')} unidades de ${seleccionado.ticker}.`);
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
      const data = await venderActivo({
        id_usuario: user?.id_usuario || '',
        id_activo: seleccionado.id_activo,
        cantidad: Number(cantidad),
        precio_venta: Number(precioVenta),
        comision: comision ? Number(comision) : undefined,
        trm: trm ? Number(trm) : undefined,
        url_evidencia: urlEvidencia || undefined,
        notas: notas || undefined,
      });
      setResult(data);
      setConfirmar(false);
      obtenerSaldoCaja().then(setSaldo).catch(() => {});
      listarLotes().then((d) => setLotesUsuario(d as unknown as LoteInfo[])).catch(() => {});
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(msg || 'Error al registrar la venta.');
      setConfirmar(false);
    } finally {
      setLoading(false);
    }
  }

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
              <TrendingDown size={16} className="text-red-500" />
              Mis Activos en Portafolio
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Solo se muestran activos con unidades disponibles</p>
          </div>
          <div className="p-3">
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por ticker o nombre..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
              />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-1 scrollbar-thin">
              {activosConLotes.length === 0 && (
                <div className="text-center py-8">
                  <Package size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-[11px] text-slate-400">No tienes activos en tu portafolio</p>
                  <p className="text-[10px] text-slate-400">Registra una compra primero</p>
                </div>
              )}
              {filtrados.map((a) => {
                const cantDisp = lotesUsuario
                  .filter((l) => (l as Record<string, unknown>).id_activo === a.id_activo && l.cantidad_actual > 0)
                  .reduce((sum, l) => sum + l.cantidad_actual, 0);
                return (
                  <button
                    key={a.id_activo}
                    type="button"
                    onClick={() => seleccionarActivo(a)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                      seleccionado?.id_activo === a.id_activo
                        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{a.ticker}</span>
                        <span className="text-slate-400 ml-2">{a.nombre}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {cantDisp.toLocaleString('es-CO')} uds
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {a.mercado} · {a.moneda}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Panel 2: Formulario de venta ──────────────── */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Datos de la Venta</h3>
              {seleccionado ? (
                <p className="text-[11px] text-red-500 mt-0.5 font-medium">
                  {seleccionado.ticker} — {seleccionado.nombre} · <span className="text-emerald-500">{disponible.toLocaleString('es-CO')} disponibles</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-0.5">Selecciona un activo del panel izquierdo</p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!seleccionado && (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <Info size={14} className="text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">Primero selecciona un activo de tu portafolio para vender.</p>
                </div>
              )}

              {/* Tipo de venta: Total / Parcial */}
              {seleccionado && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Tipo de venta</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoVenta('total')}
                      className={`px-4 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                        tipoVenta === 'total'
                          ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                          : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-semibold">Venta Total</div>
                      <div className="text-[10px] opacity-70 mt-0.5">Vender todas las {disponible.toLocaleString('es-CO')} uds</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTipoVenta('parcial'); setCantidad(''); }}
                      className={`px-4 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                        tipoVenta === 'parcial'
                          ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                          : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-semibold">Venta Parcial</div>
                      <div className="text-[10px] opacity-70 mt-0.5">Elegir cuántas uds vender</div>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputField
                    label={`Cantidad a vender (máx: ${disponible.toLocaleString('es-CO')})`}
                    type="number"
                    value={cantidad}
                    onChange={setCantidad}
                    placeholder={`1 - ${disponible}`}
                    required
                    min="1"
                    max={String(disponible)}
                    step="any"
                  />
                  {excedeCantidad && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={10} /> Supera las {disponible.toLocaleString('es-CO')} unidades disponibles
                    </p>
                  )}
                </div>
                <InputField label="Precio de venta unitario" type="number" value={precioVenta} onChange={setPrecioVenta} prefix="$" placeholder="Precio actual" required step="any" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Comisión" type="number" value={comision} onChange={setComision} prefix="$" placeholder="0 (opcional)" step="any" />
                {seleccionado?.es_extranjero ? (
                  <InputField label="TRM (Tasa de cambio)" type="number" value={trm} onChange={setTrm} prefix="$" placeholder="Ej: 4800" required step="any" />
                ) : (
                  <InputField label="TRM (Solo extranjeros)" type="number" value={trm} onChange={setTrm} prefix="$" placeholder="No aplica" step="any" />
                )}
              </div>

              {/* ingreso estimado */}
              {Number(cantidad) > 0 && Number(precioVenta) > 0 && (
                <div className="rounded-lg p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ingreso estimado (bruto)</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {formatCOP(ingresoEstimado)}
                    </span>
                  </div>
                </div>
              )}

              <InputField label="URL Evidencia (screenshot del precio)" value={urlEvidencia} onChange={setUrlEvidencia} placeholder="https://..." />

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Notas / Fuente de información</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all resize-none"
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
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">¿Confirmar esta venta?</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mb-3">
                    Venta <strong>{tipoVenta}</strong> de {seleccionado?.ticker} — {Number(cantidad).toLocaleString('es-CO')} unidades × {formatCOP(Number(precioVenta))}
                    {' '}= <strong>{formatCOP(ingresoEstimado)}</strong>
                    <br /><span className="text-[10px]">(Método FIFO: se liquidarán primero los lotes más antiguos)</span>
                  </p>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors">
                      Sí, Confirmar Venta
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
                  disabled={loading || !seleccionado || excedeCantidad}
                  className="w-full bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Procesando...
                    </span>
                  ) : 'Registrar Venta'}
                </button>
              )}
            </form>
          </div>

          {/* ── Resultado exitoso ────────────────────────── */}
          {result && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Venta Registrada Exitosamente</h3>
                  <p className="text-xs text-slate-400">Lotes liquidados por método FIFO</p>
                </div>
              </div>
              <div className="space-y-0 divide-y divide-slate-50 dark:divide-slate-700">
                <ResultRow label="Activo" value={`${seleccionado?.ticker || ''} — ${seleccionado?.nombre || ''}`} />
                {result.cantidad_vendida != null && <ResultRow label="Cantidad Vendida" value={Number(result.cantidad_vendida).toLocaleString('es-CO')} />}
                {result.monto_total != null && (
                  <ResultRow label="Monto Total" value={formatCOP(Number(result.monto_total))} highlight />
                )}
                {result.comision != null && <ResultRow label="Comisión" value={formatCOP(Number(result.comision))} />}
                {result.lotes_afectados != null && <ResultRow label="Lotes Afectados" value={String(result.lotes_afectados)} />}
                {result.saldo_anterior != null && <ResultRow label="Saldo Anterior" value={formatCOP(Number(result.saldo_anterior))} />}
                {result.saldo_nuevo != null && <ResultRow label="Saldo Nuevo" value={formatCOP(Number(result.saldo_nuevo))} highlight />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
