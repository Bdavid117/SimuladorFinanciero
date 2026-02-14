import { useState } from 'react';
import { calcularCalificacion } from '../../services/calculos';
import type { CalificacionResponse } from '../../types';
import FormCard from '../../components/ui/FormCard';
import InputField from '../../components/ui/InputField';
import { Award, Info } from 'lucide-react';

const gradeColors: Record<string, string> = {
  Excelente: 'bg-emerald-500',
  Sobresaliente: 'bg-lime-500',
  Bueno: 'bg-amber-400',
  Aceptable: 'bg-orange-500',
  Insuficiente: 'bg-red-500',
};

const gradeEmojis: Record<string, string> = {
  Excelente: '🏆',
  Sobresaliente: '⭐',
  Bueno: '👍',
  Aceptable: '📊',
  Insuficiente: '⚠️',
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
        subtitle="Evalúa el desempeño del portafolio comparando rendimiento real vs meta administrativa"
        loading={loading}
        onSubmit={handleSubmit}
        submitLabel="Calcular Calificación"
        icon={<Award size={18} className="text-amber-500" />}
      >
        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>¿Cómo funciona?</strong> La nota se calcula como (Rendimiento Real / Meta) × 5.0, con un máximo de 5.0.
            Ingresa el rendimiento como decimal (ej: 0.15 para 15%).
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Rendimiento Real" type="number" value={form.rendimiento_real} onChange={set('rendimiento_real')} placeholder="Ej: 0.15 (= 15%)" required step="any" helpText="Decimal: 0.15 = 15%" />
          <InputField label="Meta Administrativa" type="number" value={form.meta_admin} onChange={set('meta_admin')} placeholder="Ej: 0.08 (= 8%)" step="any" helpText="Opcional. Default: 8% si no se indica" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

      </FormCard>

      {result && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden">
          {/* Grade Hero */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Calificación Obtenida</p>
              <p className="text-xs text-slate-500">
                Nota numérica: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{result.nota.toFixed(2)} / 5.00</span>
              </p>
            </div>
            <div className="text-center">
              <div className={`px-5 py-3 rounded-2xl ${bgColor} shadow-lg`}>
                <span className="text-lg font-black text-white">{gradeEmojis[result.calificacion] || ''} {result.calificacion}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Rendimiento</p>
                <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-100">
                  {(result.rendimiento_real * 100).toFixed(2)}%
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Meta Admin</p>
                <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-100">
                  {(result.meta_admin * 100).toFixed(2)}%
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
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
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
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
