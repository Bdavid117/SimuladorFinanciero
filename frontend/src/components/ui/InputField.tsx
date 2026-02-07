interface Props {
  label: string;
  type?: string;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
  helpText?: string;
  prefix?: string;
  suffix?: string;
}

export default function InputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  step,
  min,
  max,
  helpText,
  prefix,
  suffix,
}: Props) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          step={step}
          min={min}
          max={max}
          className={`w-full border border-slate-200 dark:border-slate-600 rounded-lg py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-emerald-500/20 focus:border-slate-400 dark:focus:border-emerald-500 transition-all ${
            prefix ? 'pl-8 pr-3' : suffix ? 'pl-3 pr-10' : 'px-3'
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
            {suffix}
          </span>
        )}
      </div>
      {helpText && <p className="text-[11px] text-slate-400 mt-1">{helpText}</p>}
    </div>
  );
}
