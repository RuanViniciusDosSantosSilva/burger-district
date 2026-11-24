import { Quote, Star } from 'lucide-react';
import { SplitWords } from '@/components/ui/SplitWords';
import { reviews } from '@/data/content';
import { cx } from '@/lib/format';

const tones = ['bg-ember text-ink', 'bg-cream text-ink', 'bg-ink-700 text-cream', 'bg-mustard text-ink'];

function Card({ r, i }: { r: (typeof reviews)[number]; i: number }) {
  return (
    <figure className={cx('relative flex w-[300px] shrink-0 flex-col rounded-[26px] p-6 transition-transform duration-500 hover:-translate-y-2 hover:rotate-[-1deg] sm:w-[360px]', tones[i % tones.length])}>
      <Quote size={30} className="opacity-30" />
      <div className="mt-3 flex gap-0.5" role="img" aria-label={`Avaliação ilustrativa: ${r.rating} de 5 estrelas`}>
        {Array.from({ length: 5 }).map((_, k) => (
          <Star key={k} size={16} className={k < r.rating ? 'fill-current' : 'opacity-25'} />
        ))}
      </div>
      <blockquote className="mt-3 text-[17px] font-semibold leading-snug">“{r.text}”</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-6">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-black/15 font-display text-lg">{r.name[0]}</span>
        <span className="leading-tight">
          <span className="block font-bold">{r.name}</span>
          <span className="block text-xs opacity-60">{r.when}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Depoimentos fictícios em duas faixas que correm em sentidos opostos (pausam no hover). */
export function Reviews() {
  const a = reviews.slice(0, 4);
  const b = reviews.slice(4);
  return (
    <section id="avaliacoes" className="relative overflow-hidden bg-ink py-24 md:py-32" aria-labelledby="rev-title">
      <div className="wrap mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-5">Avaliações</p>
          <h2 id="rev-title" className="display text-[clamp(3rem,8vw,7rem)]">
            <SplitWords text="Quem prova," className="block" />
            <SplitWords text="volta." className="block text-ember" delay={0.15} />
          </h2>
        </div>
        <p className="max-w-[22rem] rounded-2xl border border-cream/15 p-4 text-sm text-cream/60">
          <strong className="text-cream">Conteúdo demonstrativo:</strong> nomes, notas e comentários abaixo são fictícios e não representam avaliações reais verificadas.
        </p>
      </div>

      <div className="group/rev space-y-5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        {[a, b].map((row, k) => (
          <div key={k} className="overflow-hidden">
            <div className={cx('flex w-max gap-5 animate-marquee group-hover/rev:[animation-play-state:paused]', k === 1 && '[animation-direction:reverse]')} style={{ animationDuration: '60s' }}>
              {[...row, ...row, ...row, ...row].map((r, i) => (
                <div key={i} aria-hidden={i >= row.length ? true : undefined}>
                  <Card r={r} i={i + k * 2} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
