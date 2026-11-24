import { cx } from '@/lib/format';

const words = ['Smash burgers', 'Artesanais', 'Batatas da casa', 'Shakes', 'Combos', 'Feito na hora'];

/** Faixa tipográfica em movimento contínuo. */
export function Marquee({ className, reverse = false, tone = 'ember' }: { className?: string; reverse?: boolean; tone?: 'ember' | 'cream' }) {
  const row = [...words, ...words];
  return (
    <div aria-hidden className={cx('relative overflow-hidden py-4', tone === 'ember' ? 'bg-ember text-ink' : 'bg-cream text-ink', className)}>
      <div className={cx('flex w-max animate-marquee gap-8 whitespace-nowrap', reverse && '[animation-direction:reverse]')}>
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center gap-8">
            {row.map((w, i) => (
              <span key={i} className="flex items-center gap-8 font-display text-[clamp(1.6rem,3.4vw,2.8rem)] uppercase leading-none">
                {w}
                <svg width="26" height="26" viewBox="0 0 26 26"><path d="M13 0l3.2 9.8L26 13l-9.8 3.2L13 26l-3.2-9.8L0 13l9.8-3.2z" fill="currentColor" /></svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarqueeBand() {
  return (
    <div className="relative z-10 -my-6 overflow-hidden py-6">
      <Marquee className="-rotate-2 scale-105 shadow-deep" />
    </div>
  );
}
