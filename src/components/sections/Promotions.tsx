import { motion } from 'framer-motion';
import { CalendarClock, Plus, Users } from 'lucide-react';
import { useRef } from 'react';
import { ProductImage } from '@/components/ui/ProductImage';
import { SplitWords } from '@/components/ui/SplitWords';
import { weeklyDeals } from '@/data/content';
import { productById } from '@/data/products';
import { useQuickAdd } from '@/hooks/useAddToCart';
import { cx, money } from '@/lib/format';
import { todayIndex } from '@/lib/hours';
import type { Product } from '@/types';

const p = (id: string) => productById(id)!.price;
/** Preço dos itens comprados separadamente — a economia exibida é calculada, não inventada. */
const aLaCarte: Record<string, number> = {
  'combo-solo': p('classic-smash') + p('batata-classica') + p('refrigerante-lata'),
  'combo-dupla': p('bacon-rush') * 2 + p('cheddar-bacon') + 12 + p('refrigerante-lata') * 2,
  'combo-galera': p('classic-smash') * 2 + p('bacon-rush') * 2 + (p('batata-classica') + 10) * 2 + p('onion-rings') + p('refrigerante-lata') * 4,
};
const dayName = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function ComboCard({ prod, big = false, tone }: { prod: Product; big?: boolean; tone: 'ember' | 'cream' | 'ink' }) {
  const quickAdd = useQuickAdd();
  const img = useRef<HTMLDivElement>(null);
  const save = aLaCarte[prod.id] - prod.price;
  const c = {
    ember: 'bg-ember text-ink',
    cream: 'bg-cream text-ink',
    ink: 'bg-ink-700 text-cream border border-cream/10',
  }[tone];
  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cx('group relative flex flex-col overflow-hidden rounded-[30px] p-6 sm:p-8', c, big && 'lg:row-span-2')}
    >
      <div className="relative z-10 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-current px-3 py-1 text-xs font-bold uppercase">
          <Users size={13} /> {prod.serves}
        </span>
        {save > 0 && <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase text-mustard">Economize {money(save)}</span>}
      </div>
      <div ref={img} className={cx('relative mx-auto w-full transition-transform duration-700 group-hover:scale-[1.04] group-hover:-rotate-1', big ? 'my-6 aspect-[4/3] max-w-[620px] lg:my-auto' : 'my-4 aspect-[16/10] max-w-[420px]')}>
        <ProductImage src={prod.image} alt={prod.name} className="h-full w-full drop-shadow-[0_30px_30px_rgba(0,0,0,.35)]" />
      </div>
      <div className="relative z-10 mt-auto flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className={cx('display', big ? 'text-[clamp(2.8rem,5vw,4.6rem)]' : 'text-[clamp(2.2rem,3.4vw,3rem)]')}>{prod.name}</h3>
          <p className="mt-1 max-w-[36ch] text-[15px] opacity-75">{prod.ingredients.join(' · ')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* selo de preço */}
          <div className="relative grid h-[92px] w-[92px] shrink-0 rotate-[-8deg] place-items-center rounded-full bg-ink text-center text-cream transition-transform duration-500 group-hover:rotate-[4deg]">
            <span className="leading-none">
              <span className="block text-[11px] font-semibold text-cream/55 line-through">{money(aLaCarte[prod.id])}</span>
              <span className="block font-display text-[22px] text-ember">{money(prod.price)}</span>
            </span>
          </div>
          <button type="button" onClick={() => quickAdd(prod, img.current)} className="grid h-14 w-14 place-items-center rounded-full bg-ink text-cream transition hover:scale-110 hover:bg-ink-600 active:scale-95" aria-label={`Adicionar ${prod.name} ao pedido`}>
            <Plus size={24} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/** Promoções e combos: bento editorial + promoções semanais com regra fixa (sem contagem regressiva falsa). */
export function Promotions() {
  const today = todayIndex();
  return (
    <section id="promocoes" className="relative overflow-hidden bg-ink-900 py-24 md:py-32" aria-labelledby="promo-title">
      <div className="wrap">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-5">Promoções e combos</p>
            <h2 id="promo-title" className="display text-[clamp(3rem,8vw,7rem)]">
              <SplitWords text="Mais burger," className="block" />
              <SplitWords text="menos conta." className="block text-ember" delay={0.15} />
            </h2>
          </div>
          <p className="max-w-[24rem] text-sm text-cream/50">Valores e promoções fictícios, criados para demonstração. A economia é calculada a partir dos preços do próprio cardápio.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:grid-rows-2">
          <ComboCard prod={productById('combo-galera')!} big tone="ember" />
          <ComboCard prod={productById('combo-dupla')!} tone="cream" />
          <ComboCard prod={productById('combo-solo')!} tone="ink" />
        </div>

        {/* promoções da semana em formato de ticket */}
        <div className="mt-14">
          <h3 className="mb-6 flex items-center gap-3 font-display text-3xl uppercase">
            <CalendarClock className="text-ember" /> Toda semana
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {weeklyDeals.map((d, i) => {
              const active = d.day === today;
              return (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 30, rotate: -2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className={cx('relative flex overflow-hidden rounded-2xl', active ? 'bg-ember text-ink' : 'bg-ink-700 text-cream')}
                >
                  <div className="flex-1 p-5">
                    <p className={cx('text-xs font-bold uppercase', active ? 'text-ink/70' : 'text-ember')}>Toda {dayName[d.day]} · 18h às 23h</p>
                    <p className="mt-1 font-display text-2xl uppercase">{d.title}</p>
                    <p className={cx('mt-1 text-sm', active ? 'text-ink/75' : 'text-cream/60')}>{d.text}</p>
                  </div>
                  {/* picote */}
                  <div aria-hidden className="relative w-0 border-l-2 border-dashed border-current opacity-30">
                    <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-ink-900" />
                    <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-ink-900" />
                  </div>
                  <div className="grid w-[112px] shrink-0 place-items-center p-3 text-center">
                    <span className="font-display text-lg uppercase leading-tight">{d.tag}</span>
                  </div>
                  {active && <span className="absolute right-3 top-3 h-2.5 w-2.5 animate-ping rounded-full bg-ink" aria-label="Válida hoje" />}
                </motion.div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-cream/45">
            {weeklyDeals.some((d) => d.day === today) ? 'A promoção destacada vale hoje.' : `Hoje é ${dayName[today]}: a próxima promoção semanal começa ${dayName[weeklyDeals.find((d) => d.day > today)?.day ?? weeklyDeals[0].day]}.`}
          </p>
        </div>
      </div>
    </section>
  );
}
