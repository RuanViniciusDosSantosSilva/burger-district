import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { Leaf, MessageCircleHeart, Sparkles, Timer, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { Counter } from '@/components/ui/Counter';
import { SplitWords } from '@/components/ui/SplitWords';
import { differentials, stats } from '@/data/content';

const icons = { Leaf, Timer, Sparkles, MessageCircleHeart, UtensilsCrossed };
const previews = ['renders/district-prime.webp', 'renders/griddle.webp', 'renders/blue-avenue.webp', 'renders/shake-doce-de-leite.webp', 'renders/combo-dupla.webp'];

/** Diferenciais: faixa de números animados + lista editorial com prévia que segue o cursor. */
export function Experience() {
  const [hover, setHover] = useState<number | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 25 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 25 });

  return (
    <section id="experiencia" className="relative bg-ink" aria-labelledby="exp-title">
      {/* números */}
      <div className="grain relative overflow-hidden bg-ember text-ink">
        <div className="wrap grid grid-cols-2 gap-x-6 gap-y-10 py-16 md:py-20 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="border-l-2 border-ink/25 pl-4 md:pl-6">
              <Counter to={s.value} suffix={s.suffix} className="block whitespace-nowrap font-display text-[clamp(2.8rem,6vw,5.4rem)] leading-none" />
              <p className="mt-2 max-w-[18ch] text-sm font-semibold text-ink/75 md:text-base">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow mb-5">Experiência</p>
            <h2 id="exp-title" className="display text-[clamp(3rem,6.5vw,6rem)]">
              <SplitWords text="O que faz" className="block" />
              <SplitWords text="a diferença." className="block text-ember" delay={0.15} />
            </h2>
            <p className="mt-6 max-w-[26rem] text-cream/60">Nada de atalhos. O que acontece na nossa cozinha é o que você sente na primeira mordida.</p>
          </div>

          <ul
            className="relative border-t border-cream/10"
            onPointerMove={(e) => {
              x.set(e.clientX);
              y.set(e.clientY);
            }}
            onPointerLeave={() => setHover(null)}
          >
            {differentials.map((d, i) => {
              const Icon = icons[d.icon];
              return (
                <motion.li
                  key={d.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
                  className="group relative grid grid-cols-[48px_1fr] gap-x-5 gap-y-1 border-b border-cream/10 py-7 md:grid-cols-[64px_1fr] md:py-9"
                >
                  <span className="row-span-2 grid h-12 w-12 place-items-center rounded-2xl bg-cream/5 text-ember transition-all duration-500 group-hover:rotate-[-8deg] group-hover:bg-ember group-hover:text-ink md:h-16 md:w-16">
                    <Icon size={24} />
                  </span>
                  <h3 className="font-display text-[clamp(1.7rem,3.2vw,2.8rem)] uppercase leading-none transition-transform duration-500 group-hover:translate-x-2">{d.title}</h3>
                  <p className="max-w-[46ch] text-cream/60">{d.text}</p>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* prévia flutuante (somente mouse) */}
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block" style={{ x, y }}>
        <AnimatePresence>
          {hover !== null && (
            <motion.div
              key={hover}
              initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute -left-[110px] -top-[150px] h-[220px] w-[220px] overflow-hidden rounded-[28px] bg-ember-700 shadow-deep"
            >
              <img src={previews[hover]} alt="" className="h-full w-full object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
