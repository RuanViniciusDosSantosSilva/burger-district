import { cx } from '@/lib/format';

/** Marca BURGER DISTRICT: selo hexagonal + logotipo condensado. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0" aria-hidden="true">
        <path d="M24 2 43 13v22L24 46 5 35V13z" fill="#e2561b" />
        <path d="M24 7.5 38.5 16v16L24 40.5 9.5 32V16z" fill="#0b0907" />
        <path d="M14 22c0-5 4.5-8 10-8s10 3 10 8z" fill="#e2561b" />
        <rect x="13" y="24" width="22" height="3.2" rx="1.6" fill="#f3e9d8" />
        <path d="M14 29.5h20c0 3-2.5 4.5-5 4.5h-10c-2.5 0-5-1.5-5-4.5z" fill="#e2561b" />
      </svg>
      {!compact && (
        <span className="flex flex-col font-display uppercase leading-[0.82]">
          <span className="text-[19px] tracking-[0.02em]">Burger</span>
          <span className="text-[19px] tracking-[0.02em] text-ember">District</span>
        </span>
      )}
    </span>
  );
}
