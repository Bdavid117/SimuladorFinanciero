interface Props {
  label: string;
  value: string | number;
  highlight?: boolean;
  mono?: boolean;
}

export default function ResultRow({ label, value, highlight = false, mono = true }: Props) {
  return (
    <div className={`flex justify-between items-center py-2.5 px-4 ${highlight ? 'bg-emerald-50/60 dark:bg-emerald-900/20 rounded-lg' : ''}`}>
      <span className={`text-sm ${highlight ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
      </span>
      <span className={`text-sm ${mono ? 'font-mono' : ''} ${highlight ? 'font-bold text-emerald-700 dark:text-emerald-400 text-base' : 'font-medium text-slate-800 dark:text-slate-100'}`}>
        {value}
      </span>
    </div>
  );
}
