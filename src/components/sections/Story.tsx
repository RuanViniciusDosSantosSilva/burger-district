import gsap from 'gsap';
import { Beef, Flame, HeartHandshake, Wheat } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ProductImage } from '@/components/ui/ProductImage';
import { SplitWords } from '@/components/ui/SplitWords';
import { pillars, storyText, timeline } from '@/data/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const icons = { Beef, Wheat, Flame, HeartHandshake };

/** Nossa história: transição de cor, texto que acende com o scroll e imagem revelada por máscara. */
export function Story() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      // transição de fundo: preto → creme
      gsap.fromTo(root.current, { backgroundColor: '#0b0907', color: '#f3e9d8' }, { backgroundColor: '#f3e9d8', color: '#140d08', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 25%', scrub: true } });
      // palavras acendendo
      gsap.fromTo('.story-word', { opacity: 0.14 }, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: '.story-text', start: 'top 80%', end: 'bottom 45%', scrub: true } });
      // máscara da imagem
      gsap.fromTo('.story-mask', { clipPath: 'inset(18% 22% 18% 22% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: { trigger: '.story-mask', start: 'top 90%', end: 'center 50%', scrub: true } });
      gsap.fromTo('.story-img', { scale: 1.35, yPercent: -6 }, { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.story-mask', start: 'top bottom', end: 'bottom top', scrub: true } });
      // linha do tempo
      gsap.from('.tl-item', { y: 60, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.tl', start: 'top 80%' } });
      gsap.fromTo('.tl-line', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.tl', start: 'top 80%', end: 'bottom 60%', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="historia" className="relative overflow-hidden bg-cream py-24 text-ink-900 md:py-36" aria-labelledby="historia-title">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-6 !text-ember-600">Nossa história</p>
            <h2 id="historia-title" className="display text-[clamp(3rem,8vw,7.5rem)]">
              <SplitWords text="Nasceu na chapa." className="block" />
              <SplitWords text="Virou paixão." className="block text-ember-600" delay={0.2} />
            </h2>
          </div>
          <p className="story-text self-end text-[clamp(1.35rem,2.4vw,2.1rem)] font-semibold leading-[1.3] tracking-tight">
            {storyText.split(' ').map((w, i) => (
              <span key={i} className="story-word">
                {w}{' '}
              </span>
            ))}
          </p>
        </div>

        {/* imagem cinematográfica com máscara */}
        <figure className="mt-16 md:mt-24">
          <div className="story-mask relative aspect-[16/10] overflow-hidden rounded-[28px] bg-ink md:aspect-[21/9]">
            <div className="story-img absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,#5a2410_0%,#0b0907_70%)]" />
              <ProductImage src="renders/griddle.webp" alt="Três smash burgers na chapa de ferro, dois com queijo derretendo, ao lado de cebola caramelizada e espátula" className="absolute inset-0 h-full w-full [&_img]:object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
            <figcaption className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-4 p-6 text-cream md:p-10">
              <span className="display max-w-[14ch] text-[clamp(1.8rem,4vw,3.4rem)]">A mesma chapa desde o primeiro dia.</span>
              <span className="font-mark text-xl text-ember md:text-2xl">smash é ritual</span>
            </figcaption>
          </div>
        </figure>

        {/* linha do tempo */}
        <div className="tl relative mt-20 md:mt-28">
          <div className="tl-line absolute left-0 right-0 top-[38px] hidden h-[2px] origin-left bg-ink/80 md:block" />
          <ol className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
            {timeline.map((t) => (
              <li key={t.year} className="tl-item relative">
                <span className="relative z-10 inline-block bg-cream pr-4 font-display text-[64px] leading-none text-ink/90 md:text-[76px]">{t.year}</span>
                <h3 className="mt-4 text-lg font-bold">{t.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ink/70">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* filosofia */}
        <div className="mt-24 grid gap-px overflow-hidden rounded-[28px] bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => {
            const Icon = icons[p.icon];
            return (
              <article key={p.title} className="group bg-cream p-7 transition-colors duration-500 hover:bg-ink hover:text-cream md:p-9">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-ember transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-ember group-hover:text-ink">
                  <Icon size={26} />
                </span>
                <h3 className="mt-6 font-display text-2xl uppercase">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed opacity-75">{p.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
