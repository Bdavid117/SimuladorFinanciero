import { useState } from 'react';
import { comprarActivo } from '../../services/lotes';
import { useAuth } from '../../contexts/AuthContext';
import FormCard from '../../components/ui/FormCard';
import InputField from '../../components/ui/InputField';
import ResultRow from '../../components/ui/ResultRow';
import SemaforoBadge from '../../components/ui/SemaforoBadge';
import type { EstadoLote } from '../../types';

export default function CompraPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    id_activo: '',
    cantidad: '',
    precio_compra: '',
    comision: '',
    trm: '',
    url_evidencia: '',
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const set = (k: string) => (val: string) =>
    setForm((p) => ({ ...p, [k]: val }));
  const setTextarea = (k: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id_activo || !form.cantidad || !form.precio_compra) {
      setError('Los campos ID activo, cantidad y precio de compra son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await comprarActivo({
        id_usuario: user?.id_usuario || '',
        id_activo: form.id_activo.trim(),
        cantidad: Number(form.cantidad),
        precio_compra: Number(form.precio_compra),
        comision: form.comision ? Number(form.comision) : undefined,
        trm: form.trm ? Number(form.trm) : undefined,
        url_evidencia: form.url_evidencia || undefined,
        notas: form.notas || undefined,
      });
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(msg || 'Error al registrar la compra.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <FormCard
        title="Registrar Compra de Activo"
        subtitle="Registra la adquisición de un nuevo lote al portafolio"
        loading={loading}
        onSubmit={handleSubmit}
        submitLabel="Registrar Compra"
      >
        <InputField label="ID Activo (UUID)" value={form.id_activo} onChange={set('id_activo')} placeholder="ej. 3fa85f64-5717-4562-b3fc-2c963f66afa6" required />

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Cantidad" type="number" value={form.cantidad} onChange={set('cantidad')} placeholder="0" required />
          <InputField label="Precio de Compra" type="number" value={form.precio_compra} onChange={set('precio_compra')} prefix="$" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Comisión" type="number" value={form.comision} onChange={set('comision')} prefix="$" placeholder="Opcional" />
          <InputField label="TRM" type="number" value={form.trm} onChange={set('trm')} prefix="$" placeholder="Opcional" />
        </div>

        <InputField label="URL Evidencia" value={form.url_evidencia} onChange={set('url_evidencia')} placeholder="https://..." />

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Notas</label>
          <textarea
            value={form.notas}
            onChange={setTextarea('notas')}
            rows={2}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors resize-none"
            placeholder="Notas adicionales..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

      </FormCard>

      {result && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Compra Registrada</h3>
              <p className="text-xs text-slate-400">El lote fue agregado al portafolio</p>
            </div>
            {typeof result.estado === 'string' && (
              <div className="ml-auto">
                <SemaforoBadge estado={result.estado as EstadoLote} />
              </div>
            )}
          </div>
          <div className="space-y-0 divide-y divide-slate-50 dark:divide-slate-700">
            {typeof result.id_lote === 'string' && <ResultRow label="ID Lote" value={result.id_lote.slice(0, 8) + '...'} />}
            {result.costo_total != null && (
              <ResultRow
                label="Costo Total"
                value={`$ ${Number(result.costo_total).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`}
                highlight
              />
            )}
            {result.cantidad_inicial != null && <ResultRow label="Cantidad" value={Number(result.cantidad_inicial).toLocaleString('es-CO')} />}
            {typeof result.fecha_compra === 'string' && <ResultRow label="Fecha" value={new Date(result.fecha_compra).toLocaleDateString('es-CO')} />}
          </div>
        </div>
      )}
    </div>
  );
}
