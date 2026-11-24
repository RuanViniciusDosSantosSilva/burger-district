import { Minus, Plus } from 'lucide-react';
import { cx } from '@/lib/format';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  size?: 'sm' | 'md';
}

/** Controle de quantidade acessível (botões de 40–44 px). */
export function Stepper({ value, onChange, min = 0, max = 99, label, size = 'md' }: Props) {
  const s = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  return (
    <div className="inline-flex items-center rounded-full border border-cream/15 bg-ink-800" role="group" aria-label={label}>
      <button type="button" className={cx(s, 'grid place-items-center rounded-full transition hover:bg-cream/10 disabled:opacity-30')} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Diminuir ${label}`}>
        <Minus size={16} />
      </button>
      <span className="min-w-[2ch] text-center font-display text-lg tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={cx(s, 'grid place-items-center rounded-full transition hover:bg-cream/10 disabled:opacity-30')} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Aumentar ${label}`}>
        <Plus size={16} />
      </button>
    </div>
  );
}
