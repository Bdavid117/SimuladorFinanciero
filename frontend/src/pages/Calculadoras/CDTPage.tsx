import { useState } from 'react';
import { liquidarCDT } from '../../services/calculos';
import type { CDTResponse } from '../../types';
import FormCard from '../../components/ui/FormCard';
import InputField from '../../components/ui/InputField';
import ResultRow from '../../components/ui/ResultRow';

function fmt(n: number) {
  return n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CDTPage() {
  const [form, setForm] = useState({
    capital_invertido: '',
    tasa_interes_anual: '',
    fecha_inicio: '',
    fecha_liquidacion: '',
    plazo_dias_original: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CDTResponse | null>(null);
  const [error, setError] = useState('');

  const set = (k: string) => (val: string) =>
    setForm((p) => ({ ...p, [k]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { capital_invertido, tasa_interes_anual, fecha_inicio, fecha_liquidacion, plazo_dias_original } = form;
    if (!capital_invertido || !tasa_interes_anual || !fecha_inicio || !fecha_liquidacion || !plazo_dias_original) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await liquidarCDT({
        capital_invertido: Number(capital_invertido),
        tasa_interes_anual: Number(tasa_interes_anual),
        fecha_inicio,
        fecha_liquidacion,
        plazo_dias_original: Number(plazo_dias_original),
      });
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(msg || 'Error al liquidar el CDT.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <FormCard
        title="Liquidación de CDT"
        subtitle="Calcula el rendimiento y penalización por liquidación anticipada"
        loading={loading}
        onSubmit={handleSubmit}
        submitLabel="Liquidar CDT"
      >
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Capital Invertido" type="number" value={form.capital_invertido} onChange={set('capital_invertido')} prefix="$" placeholder="10000000" required />
          <InputField label="Tasa Interés Anual" type="number" value={form.tasa_interes_anual} onChange={set('tasa_interes_anual')} suffix="%" placeholder="0.08" required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <InputField label="Fecha Inicio" type="date" value={form.fecha_inicio} onChange={set('fecha_inicio')} required />
          <InputField label="Fecha Liquidación" type="date" value={form.fecha_liquidacion} onChange={set('fecha_liquidacion')} required />
          <InputField label="Plazo Original (días)" type="number" value={form.plazo_dias_original} onChange={set('plazo_dias_original')} placeholder="360" required />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

      </FormCard>

      {result && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Resultado de Liquidación</h3>
            {result.es_liquidacion_anticipada && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold uppercase tracking-wider rounded-md border border-amber-200">
                Anticipada
              </span>
            )}
          </div>
          <div className="space-y-0 divide-y divide-slate-50">
            <ResultRow label="Capital Invertido" value={`$ ${fmt(result.capital_invertido)}`} />
            <ResultRow label="Días Transcurridos" value={`${result.dias_transcurridos} / ${result.plazo_original}`} />
            <ResultRow label="Tasa Interés Anual" value={`${(result.tasa_interes_anual * 100).toFixed(2)} %`} />
            <ResultRow label="Interés Bruto" value={`$ ${fmt(result.interes_bruto)}`} />
            {result.es_liquidacion_anticipada && (
              <>
                <ResultRow label="Penalización %" value={`${(result.penalizacion_porcentaje * 100).toFixed(2)} %`} />
                <ResultRow label="Penalización Monto" value={`$ ${fmt(result.penalizacion_monto)}`} />
              </>
            )}
            <ResultRow label="Interés Neto" value={`$ ${fmt(result.interes_neto)}`} />
            <ResultRow label="Monto Total a Recibir" value={`$ ${fmt(result.monto_total_recibir)}`} highlight />
            <ResultRow label="Tasa Efectiva Anual" value={`${(result.tasa_efectiva_anual * 100).toFixed(4)} %`} />
          </div>
        </div>
      )}
    </div>
  );
}
