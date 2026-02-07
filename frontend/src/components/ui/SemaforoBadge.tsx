import type { EstadoLote } from '../../types';

interface Props {
  estado: EstadoLote;
  size?: 'sm' | 'md';
}

const config: Record<EstadoLote, { dot: string; bg: string; text: string; label: string }> = {
  VERDE:    { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Activo' },
  AMARILLO: { dot: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Parcial' },
  ROJO:     { dot: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700',     label: 'Agotado' },
};

export default function SemaforoBadge({ estado, size = 'md' }: Props) {
  const c = config[estado];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-medium ${c.bg} ${c.text} ${pad}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
