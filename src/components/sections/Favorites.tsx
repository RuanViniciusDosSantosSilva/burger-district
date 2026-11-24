import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ProductImage } from '@/components/ui/ProductImage';
import { useUI } from '@/context/UIContext';
import { favorites } from '@/data/products';
import { useQuickAdd } from '@/hooks/useAddToCart';
import { cx, money } from '@/lib/format';

const themes = [
  { bg: 'bg-ember', fg: 'text-ink', sub: 'text-ink/70', num: 'text-ink/15', btn: 'btn-dark' },
  { bg: 'bg-cream', fg: 'text-ink', sub: 'text-ink/65', num: 'text-ember/25', btn: 'btn-primary' },
  { bg: 'bg-ink-700', fg: 'text-cream', sub: 'text-cream/65', num: 'text-cream/10', btn: 'btn-primary' },
  { bg: 'bg-mustard', fg: 'text-ink', sub: 'text-ink/70', num: 'text-ink/15', btn: 'btn-dark' },
];

/** "Os favoritos do distrito": galeria editorial com rolagem horizontal pinada (desktop) e carrossel com snap (celular). */
export function Favorites() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const quickAdd = useQuickAdd();
  const { openProduct } = useUI();
  const imgs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const t = track.current!;
      const dist = () => t.scrollWidth - window.innerWidth;
      const tween = gsap.to(t, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
      t.querySelectorAll<HTMLElement>('.fav-img').forEach((el) => {
        gsap.fromTo(el, { rotate: -14, scale: 0.85 }, { rotate: 6, scale: 1.05, ease: 'none', scrollTrigger: { trigger: el, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    });
    return () => mm.revert();
  }, []);

  const nudge = (dir: number) => {
    const s = scroller.current;
    if (s) s.scrollBy({ left: dir * s.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section ref={section} id="favoritos" className="relative overflow-hidden bg-ink lg:h-[100svh]" aria-labelledby="fav-title">
      <div ref={scroller} className="no-scrollbar snap-x snap-mandatory scroll-px-5 overflow-x-auto sm:scroll-px-8 lg:h-full lg:snap-none lg:overflow-visible">
        <div ref={track} className="flex w-max gap-5 px-5 py-20 sm:px-8 lg:h-full lg:items-center lg:gap-8 lg:py-0 lg:pl-[6vw] lg:pr-[10vw]">
          {/* painel de abertura */}
          <div className="flex w-[86vw] max-w-[560px] shrink-0 snap-start flex-col justify-center pr-4 lg:w-[38vw]">
            <p className="eyebrow mb-6">Mais pedidos</p>
            <h2 id="fav-title" className="display text-[clamp(3.2rem,7vw,7.2rem)]">
              Os favoritos <span className="text-outline block text-cream">do distrito</span>
            </h2>
            <p className="mt-6 max-w-[26rem] text-cream/60">Os quatro burgers que mais saem da nossa chapa. Se é a primeira vez, comece por aqui.</p>
            <div className="mt-8 flex gap-2 lg:hidden">
              <button type="button" onClick={() => nudge(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-cream/20" aria-label="Anterior">
                <ChevronLeft />
              </button>
              <button type="button" onClick={() => nudge(1)} className="grid h-12 w-12 place-items-center rounded-full border border-cream/20" aria-label="Próximo">
                <ChevronRight />
              </button>
            </div>
          </div>

          {favorites.map((p, i) => {
            const t = themes[i % themes.length];
            return (
              <article key={p.id} className={cx('relative flex w-[86vw] max-w-[620px] shrink-0 snap-center flex-col overflow-hidden rounded-[32px] p-7 sm:p-9 lg:h-[78vh] lg:w-[min(46vw,720px)] lg:max-w-none', t.bg, t.fg)}>
                <span aria-hidden className={cx('pointer-events-none absolute -right-4 -top-8 select-none font-display text-[clamp(10rem,22vw,20rem)] leading-none', t.num)}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative flex items-center gap-3">
                  <span className="rounded-full border-2 border-current px-3 py-1 font-display text-sm uppercase tracking-wide">#{i + 1} Mais vendido</span>
                </div>
                <div ref={(el) => (imgs.current[i] = el)} className="fav-img relative mx-auto my-4 aspect-square w-[82%] max-w-[460px] lg:my-0 lg:min-h-0 lg:w-auto lg:flex-1">
                  <ProductImage src={p.image} alt={p.name} className="h-full w-full drop-shadow-[0_40px_40px_rgba(0,0,0,.4)]" />
                </div>
                <div className="relative mt-auto grid items-end gap-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <h3 className="display text-[clamp(2.6rem,5vw,4.4rem)]">{p.name}</h3>
                    <p className={cx('mt-2 max-w-[34ch] text-[15px] leading-snug', t.sub)}>{p.description}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <span className="font-display text-[40px] leading-none">{money(p.price)}</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openProduct(p)} className="btn !min-h-[44px] border-2 border-current !px-4 !text-[13px]">
                        Detalhes
                      </button>
                      <button type="button" onClick={() => quickAdd(p, imgs.current[i])} className={cx(t.btn, '!min-h-[44px] !px-4 !text-[13px]')} aria-label={`Adicionar ${p.name} ao pedido`}>
                        <Plus size={17} /> Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
