interface Props {
  label: string;
  value: string | number;
  highlight?: boolean;
  mono?: boolean;
}

export default function ResultRow({ label, value, highlight = false, mono = true }: Props) {
  return (
    <div className={`flex justify-between items-center py-2.5 px-4 ${highlight ? 'bg-emerald-50/60 rounded-lg' : ''}`}>
      <span className={`text-sm ${highlight ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
        {label}
      </span>
      <span className={`text-sm ${mono ? 'font-mono' : ''} ${highlight ? 'font-bold text-emerald-700 text-base' : 'font-medium text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}
