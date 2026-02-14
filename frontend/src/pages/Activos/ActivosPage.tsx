import { useEffect, useState, useCallback } from 'react';
import { listarActivos, listarTiposActivo, crearActivo, eliminarActivo } from '../../services/activos';
import type { Activo, TipoActivo, ActivoCreateRequest } from '../../types';
import FormCard from '../../components/ui/FormCard';
import InputField from '../../components/ui/InputField';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Briefcase, Plus, Trash2, Search } from 'lucide-react';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

export default function ActivosPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [tipos, setTipos] = useState<TipoActivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [form, setForm] = useState({
    id_tipo_activo: '',
    ticker: '',
    nombre: '',
    moneda: 'COP',
    mercado: '',
    es_extranjero: false,
    valor_nominal: '',
    tasa_cupon: '',
    frecuencia_cupon: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    tasa_interes_anual: '',
    plazo_dias: '',
  });

  const tipoSeleccionado = tipos.find((t) => t.id_tipo_activo === Number(form.id_tipo_activo));
  const esBono = tipoSeleccionado?.nombre === 'BONO';
  const esCDT = tipoSeleccionado?.nombre === 'CDT';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [a, t] = await Promise.all([
        listarActivos({ buscar: buscar || undefined }),
        listarTiposActivo(),
      ]);
      setActivos(a);
      setTipos(t);
    } catch {
      setError('Error al cargar activos.');
    } finally {
      setLoading(false);
    }
  }, [buscar]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string) => (val: string) => setForm((p) => ({ ...p, [k]: val }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id_tipo_activo || !form.ticker || !form.nombre) {
      setFormError('Tipo, ticker y nombre son obligatorios.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');
    try {
      const body: ActivoCreateRequest = {
        id_tipo_activo: Number(form.id_tipo_activo),
        ticker: form.ticker,
        nombre: form.nombre,
        moneda: form.moneda || 'COP',
        mercado: form.mercado || undefined,
        es_extranjero: form.es_extranjero,
      };

      if (esBono) {
        if (form.valor_nominal) body.valor_nominal = Number(form.valor_nominal);
        if (form.tasa_cupon) body.tasa_cupon = Number(form.tasa_cupon);
        if (form.frecuencia_cupon) body.frecuencia_cupon = Number(form.frecuencia_cupon);
        if (form.fecha_emision) body.fecha_emision = form.fecha_emision;
        if (form.fecha_vencimiento) body.fecha_vencimiento = form.fecha_vencimiento;
      }
      if (esCDT) {
        if (form.tasa_interes_anual) body.tasa_interes_anual = Number(form.tasa_interes_anual);
        if (form.plazo_dias) body.plazo_dias = Number(form.plazo_dias);
      }

      await crearActivo(body);
      setFormSuccess('Activo creado exitosamente.');
      setForm({
        id_tipo_activo: '', ticker: '', nombre: '', moneda: 'COP', mercado: '',
        es_extranjero: false, valor_nominal: '', tasa_cupon: '', frecuencia_cupon: '',
        fecha_emision: '', fecha_vencimiento: '', tasa_interes_anual: '', plazo_dias: '',
      });
      load();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response: { data: { detail?: string } } }).response?.data?.detail
        : undefined;
      setFormError(msg || 'Error al crear el activo.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string, ticker: string) {
    if (!confirm(`¿Desactivar el activo ${ticker}?`)) return;
    try {
      await eliminarActivo(id);
      load();
    } catch {
      alert('Error al desactivar el activo.');
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <Briefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Catálogo de Activos</h2>
            <p className="text-[11px] text-slate-400">{activos.length} activos registrados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar ticker o nombre..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 w-52 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors"
          >
            <Plus size={14} /> Nuevo Activo
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <FormCard
          title="Crear Nuevo Activo"
          subtitle="Registra un activo financiero en el catálogo"
          loading={formLoading}
          onSubmit={handleCreate}
          submitLabel="Crear Activo"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Tipo de Activo *
              </label>
              <select
                title="Filtrar por tipo de activo"
                value={form.id_tipo_activo}
                onChange={(e) => setForm((p) => ({ ...p, id_tipo_activo: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
                required
              >
                <option value="">Seleccionar tipo...</option>
                {tipos.map((t) => (
                  <option key={t.id_tipo_activo} value={t.id_tipo_activo}>
                    {t.nombre} {t.descripcion ? `— ${t.descripcion}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <InputField label="Ticker *" value={form.ticker} onChange={set('ticker')} placeholder="ECOPETROL" required />
          </div>

          <InputField label="Nombre Completo *" value={form.nombre} onChange={set('nombre')} placeholder="Ecopetrol S.A." required />

          <div className="grid grid-cols-3 gap-4">
            <InputField label="Moneda" value={form.moneda} onChange={set('moneda')} placeholder="COP" />
            <InputField label="Mercado" value={form.mercado} onChange={set('mercado')} placeholder="BVC" />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.es_extranjero}
                  onChange={(e) => setForm((p) => ({ ...p, es_extranjero: e.target.checked }))}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                Activo extranjero
              </label>
            </div>
          </div>

          {/* Campos para Bonos */}
          {esBono && (
            <>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pt-2">Datos del Bono</p>
              <div className="grid grid-cols-3 gap-4">
                <InputField label="Valor Nominal" type="number" value={form.valor_nominal} onChange={set('valor_nominal')} prefix="$" />
                <InputField label="Tasa Cupón (%)" type="number" value={form.tasa_cupon} onChange={set('tasa_cupon')} suffix="%" />
                <InputField label="Frecuencia Cupón" type="number" value={form.frecuencia_cupon} onChange={set('frecuencia_cupon')} placeholder="2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Fecha Emisión" type="date" value={form.fecha_emision} onChange={set('fecha_emision')} />
                <InputField label="Fecha Vencimiento" type="date" value={form.fecha_vencimiento} onChange={set('fecha_vencimiento')} />
              </div>
            </>
          )}

          {/* Campos para CDTs */}
          {esCDT && (
            <>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pt-2">Datos del CDT</p>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Tasa Interés Anual (%)" type="number" value={form.tasa_interes_anual} onChange={set('tasa_interes_anual')} suffix="%" />
                <InputField label="Plazo (días)" type="number" value={form.plazo_dias} onChange={set('plazo_dias')} placeholder="360" />
              </div>
            </>
          )}

          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
            </div>
          )}
          {formSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{formSuccess}</p>
            </div>
          )}
        </FormCard>
      )}

      {/* Table */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ticker</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nombre</th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Moneda</th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mercado</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Val. Nominal</th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {activos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-xs text-slate-400">
                      No hay activos registrados. Crea uno con el botón "Nuevo Activo".
                    </td>
                  </tr>
                ) : (
                  activos.map((a) => (
                    <tr key={a.id_activo} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-mono font-semibold text-xs text-slate-800 dark:text-slate-100">{a.ticker}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-50 truncate">{a.nombre}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold uppercase rounded-md">
                          {a.tipo_nombre || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-slate-500 dark:text-slate-400">{a.moneda}</td>
                      <td className="px-5 py-3 text-center text-xs text-slate-500 dark:text-slate-400">{a.mercado || '-'}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                        {a.valor_nominal ? formatCOP(Number(a.valor_nominal)) : '-'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <code className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-700 px-1.5 py-0.5 rounded select-all">
                          {a.id_activo.slice(0, 8)}
                        </code>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleDelete(a.id_activo, a.ticker)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Desactivar activo"
                        >
                          <Trash2 size={14} />
                        </button>
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
