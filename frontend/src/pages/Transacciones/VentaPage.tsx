import { useState } from 'react';
import { venderActivo } from '../../services/lotes';
import { useAuth } from '../../contexts/AuthContext';
import FormCard from '../../components/ui/FormCard';
import InputField from '../../components/ui/InputField';
import ResultRow from '../../components/ui/ResultRow';

export default function VentaPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    id_activo: '',
    cantidad: '',
    precio_venta: '',
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
    if (!form.id_activo || !form.cantidad || !form.precio_venta) {
      setError('Los campos ID activo, cantidad y precio de venta son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await venderActivo({
        id_usuario: user?.id_usuario || '',
        id_activo: form.id_activo.trim(),
        cantidad: Number(form.cantidad),
        precio_venta: Number(form.precio_venta),
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
      setError(msg || 'Error al registrar la venta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <FormCard
        title="Registrar Venta de Activo"
        subtitle="Venta FIFO — se liquidan primero los lotes mas antiguos"
        loading={loading}
        onSubmit={handleSubmit}
        submitLabel="Registrar Venta"
      >
        <InputField label="ID Activo (UUID)" value={form.id_activo} onChange={set('id_activo')} placeholder="ej. 3fa85f64-5717-4562-b3fc-2c963f66afa6" required />

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Cantidad a Vender" type="number" value={form.cantidad} onChange={set('cantidad')} placeholder="0" required />
          <InputField label="Precio de Venta" type="number" value={form.precio_venta} onChange={set('precio_venta')} prefix="$" required />
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
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Venta Registrada</h3>
              <p className="text-xs text-slate-400">Los lotes fueron liquidados por FIFO</p>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-slate-50 dark:divide-slate-700">
            {result.lotes_afectados !== undefined && <ResultRow label="Lotes Afectados" value={String(result.lotes_afectados)} />}
            {result.cantidad_vendida !== undefined && <ResultRow label="Cantidad Vendida" value={Number(result.cantidad_vendida).toLocaleString('es-CO')} />}
            {result.total_venta !== undefined && (
              <ResultRow
                label="Total Venta"
                value={`$ ${Number(result.total_venta).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`}
                highlight
              />
            )}
            {result.ganancia_perdida !== undefined && (
              <ResultRow
                label="Ganancia / Pérdida"
                value={`$ ${Number(result.ganancia_perdida).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`}
                highlight
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
