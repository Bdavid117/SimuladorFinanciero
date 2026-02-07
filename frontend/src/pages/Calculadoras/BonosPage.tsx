import { useState } from 'react';
import { calcularBono } from '../../services/calculos';
import type { BonoResponse } from '../../types';
import FormCard from '../../components/ui/FormCard';
import InputField from '../../components/ui/InputField';
import ResultRow from '../../components/ui/ResultRow';

function fmt(n: number, d = 2) {
  return n.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function BonosPage() {
  const [form, setForm] = useState({
    valor_nominal: '',
    tasa_cupon: '',
    frecuencia_cupon: '',
    tir: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    fecha_valoracion: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BonoResponse | null>(null);
  const [error, setError] = useState('');

  const set = (k: string) => (val: string) =>
    setForm((p) => ({ ...p, [k]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.valor_nominal || !form.tasa_cupon || !form.frecuencia_cupon || !form.tir || !form.fecha_emision || !form.fecha_vencimiento) {
      setError('Todos los campos son obligatorios (fecha valoración es opcional).');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await calcularBono({
        valor_nominal: Number(form.valor_nominal),
        tasa_cupon: Number(form.tasa_cupon),
        frecuencia_cupon: Number(form.frecuencia_cupon),
        tir: Number(form.tir),
        fecha_emision: form.fecha_emision,
        fecha_vencimiento: form.fecha_vencimiento,
        fecha_valoracion: form.fecha_valoracion || undefined,
      });
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(msg || 'Error al calcular el bono.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <FormCard
        title="Calculadora de Bonos"
        subtitle="Calcula el precio sucio, limpio y cupón acumulado de un bono"
        loading={loading}
        onSubmit={handleSubmit}
        submitLabel="Calcular Bono"
      >
        <InputField label="Valor Nominal" type="number" value={form.valor_nominal} onChange={set('valor_nominal')} prefix="$" placeholder="1000000" required />

        <div className="grid grid-cols-3 gap-4">
          <InputField label="Tasa Cupón" type="number" value={form.tasa_cupon} onChange={set('tasa_cupon')} suffix="%" placeholder="0.08" required />
          <InputField label="Frecuencia Cupón" type="number" value={form.frecuencia_cupon} onChange={set('frecuencia_cupon')} placeholder="2" required />
          <InputField label="TIR" type="number" value={form.tir} onChange={set('tir')} suffix="%" placeholder="0.10" required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <InputField label="Fecha Emisión" type="date" value={form.fecha_emision} onChange={set('fecha_emision')} required />
          <InputField label="Fecha Vencimiento" type="date" value={form.fecha_vencimiento} onChange={set('fecha_vencimiento')} required />
          <InputField label="Fecha Valoración" type="date" value={form.fecha_valoracion} onChange={set('fecha_valoracion')} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

      </FormCard>

      {result && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Resultado de la Valoración</h3>
          <div className="space-y-0 divide-y divide-slate-50">
            <ResultRow label="Precio Sucio" value={`$ ${fmt(result.precio_sucio)}`} highlight />
            <ResultRow label="Precio Limpio" value={`$ ${fmt(result.precio_limpio)}`} highlight />
            <ResultRow label="Cupón Acumulado" value={`$ ${fmt(result.cupon_acumulado)}`} />
            <ResultRow label="Cupón del Período" value={`$ ${fmt(result.cupon_periodo)}`} />
            <ResultRow label="Número de Períodos" value={String(result.num_periodos)} />
            <ResultRow label="Días desde Último Cupón" value={String(result.dias_desde_ultimo_cupon)} />
            <ResultRow label="TIR Utilizada" value={`${(result.tir_utilizada * 100).toFixed(2)} %`} />
            <ResultRow label="Fecha Valoración" value={new Date(result.fecha_valoracion).toLocaleDateString('es-CO')} />
          </div>
        </div>
      )}
    </div>
  );
}
