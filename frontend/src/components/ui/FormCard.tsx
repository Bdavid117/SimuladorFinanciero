import type { ReactNode, FormEvent } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  submitLabel?: string;
  loading?: boolean;
  icon?: ReactNode;
}

export default function FormCard({
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = 'Calcular',
  loading = false,
  icon,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          {icon && <div className="text-slate-400">{icon}</div>}
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        {children}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </span>
          ) : submitLabel}
        </button>
      </form>
    </div>
  );
}
