import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
}

export default function StatCard({ title, value, subtitle, icon, trend }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
