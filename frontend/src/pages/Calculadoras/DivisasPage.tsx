import { useState } from 'react';
import { convertirDivisa } from '../../services/calculos';
import type { DivisaResponse } from '../../types';
import FormCard from '../../components/ui/FormCard';
import InputField from '../../components/ui/InputField';
import ResultRow from '../../components/ui/ResultRow';

function fmt(n: number) {
  return n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DivisasPage() {
  const [form, setForm] = useState({
    cantidad: '',
    precio_unitario: '',
    trm: '',
    comision: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DivisaResponse | null>(null);
  const [error, setError] = useState('');

  const set = (k: string) => (val: string) =>
    setForm((p) => ({ ...p, [k]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cantidad || !form.precio_unitario || !form.trm) {
      setError('Cantidad, precio unitario y TRM son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await convertirDivisa({
        cantidad: Number(form.cantidad),
        precio_unitario: Number(form.precio_unitario),
        trm: Number(form.trm),
        comision: form.comision ? Number(form.comision) : undefined,
      });
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(msg || 'Error al convertir la divisa.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <FormCard
        title="Conversor de Divisas"
        subtitle="Calcula el costo total en moneda local de un activo en divisa extranjera"
        loading={loading}
        onSubmit={handleSubmit}
        submitLabel="Convertir Divisa"
      >
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Cantidad" type="number" value={form.cantidad} onChange={set('cantidad')} placeholder="100" required />
          <InputField label="Precio Unitario (extranjero)" type="number" value={form.precio_unitario} onChange={set('precio_unitario')} prefix="USD" placeholder="150.50" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="TRM (Tasa Representativa)" type="number" value={form.trm} onChange={set('trm')} prefix="$" placeholder="4150.00" required />
          <InputField label="Comisión" type="number" value={form.comision} onChange={set('comision')} prefix="$" placeholder="Opcional" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

      </FormCard>

      {result && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Resultado de Conversión</h3>
          <div className="space-y-0 divide-y divide-slate-50 dark:divide-slate-700">
            <ResultRow label="Cantidad" value={fmt(result.cantidad)} />
            <ResultRow label="Precio Unitario (USD)" value={`USD ${fmt(result.precio_unitario_extranjero)}`} />
            <ResultRow label="Costo en Extranjero" value={`USD ${fmt(result.costo_extranjero)}`} />
            <ResultRow label="TRM Aplicada" value={`$ ${fmt(result.trm)}`} />
            <ResultRow label="Costo Local sin Comisión" value={`$ ${fmt(result.costo_local_sin_comision)}`} />
            <ResultRow label="Comisión" value={`$ ${fmt(result.comision)}`} />
            <ResultRow label="Costo Total" value={`$ ${fmt(result.costo_total)}`} highlight />
            <ResultRow label="Precio Unitario Local" value={`$ ${fmt(result.precio_unitario_local)}`} />
          </div>
        </div>
      )}
    </div>
  );
}
