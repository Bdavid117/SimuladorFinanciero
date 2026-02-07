import { useState } from 'react';
import { calcularCalificacion } from '../../services/calculos';
import type { CalificacionResponse } from '../../types';
import FormCard from '../../components/ui/FormCard';
import InputField from '../../components/ui/InputField';

const gradeColors: Record<string, string> = {
  'A+': 'bg-emerald-500',
  A: 'bg-emerald-400',
  'B+': 'bg-lime-500',
  B: 'bg-lime-400',
  'C+': 'bg-amber-400',
  C: 'bg-amber-500',
  D: 'bg-orange-500',
  F: 'bg-red-500',
};

export default function CalificacionPage() {
  const [form, setForm] = useState({
    rendimiento_real: '',
    meta_admin: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalificacionResponse | null>(null);
  const [error, setError] = useState('');

  const set = (k: string) => (val: string) =>
    setForm((p) => ({ ...p, [k]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rendimiento_real) {
      setError('El rendimiento real es obligatorio.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await calcularCalificacion({
        rendimiento_real: Number(form.rendimiento_real),
        meta_admin: form.meta_admin ? Number(form.meta_admin) : undefined,
      });
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(msg || 'Error al calcular la calificación.');
    } finally {
      setLoading(false);
    }
  }

  const bgColor = result ? gradeColors[result.calificacion] || 'bg-slate-500' : '';

  return (
    <div className="max-w-2xl space-y-6">
      <FormCard
        title="Calificación del Portafolio"
        subtitle="Evalúa el desempeño del portafolio según el rendimiento obtenido"
        loading={loading}
        onSubmit={handleSubmit}
        submitLabel="Calcular Calificación"
      >
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Rendimiento Real" type="number" value={form.rendimiento_real} onChange={set('rendimiento_real')} suffix="%" placeholder="0.12" required />
          <InputField label="Meta Admin" type="number" value={form.meta_admin} onChange={set('meta_admin')} suffix="%" placeholder="0.08 (Opcional)" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

      </FormCard>

      {result && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          {/* Grade Hero */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Calificación Obtenida</p>
              <p className="text-xs text-slate-500">
                Nota numérica: <span className="font-mono font-semibold text-slate-700">{result.nota.toFixed(2)}</span>
              </p>
            </div>
            <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center shadow-lg`}>
              <span className="text-2xl font-black text-white">{result.calificacion}</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Rendimiento</p>
                <p className="text-sm font-mono font-semibold text-slate-800">
                  {(result.rendimiento_real * 100).toFixed(2)}%
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Meta Admin</p>
                <p className="text-sm font-mono font-semibold text-slate-800">
                  {(result.meta_admin * 100).toFixed(2)}%
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">¿Superó Meta?</p>
                <p className={`text-sm font-semibold ${result['superó_meta'] ? 'text-emerald-600' : 'text-red-500'}`}>
                  {result['superó_meta'] ? 'Sí' : 'No'}
                </p>
              </div>
            </div>

            {/* Progress bar visual */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Desempeño</span>
                <span className="text-[10px] font-mono text-slate-500">{result.nota.toFixed(2)} / 5.00</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${bgColor}`}
                  style={{ width: `${Math.min((result.nota / 5) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
