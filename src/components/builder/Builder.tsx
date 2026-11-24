import { animate, motion, useReducedMotion } from 'framer-motion';
import { Check, Hand, RotateCcw, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BuilderViewer } from '@/components/three/BuilderViewer';
import { SplitWords } from '@/components/ui/SplitWords';
import { Stepper } from '@/components/ui/Stepper';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import {
  BACON_PRICE, builderDetails, builderLayers, builderPrice, buns, cheeses, defaultBuild, extras, MAX_BACON, MAX_CHEESES, MAX_MEATS, MAX_SAUCES, meats, sauces,
  type BuilderState,
} from '@/data/builder';
import { flyToCart } from '@/lib/fly';
import { cx, money } from '@/lib/format';
import type { LayerSpec } from '@/types';

/* cores do resumo visual 2D (uma barra por camada) */
const layerColor: Record<string, string> = {
  'bun-top': '#c7731f', 'bun-bottom': '#d9902f', patty: '#5a2c14', cheese: '#f2a01c', sauce: '#e47b49', bacon: '#b2402c', lettuce: '#4c9a26',
  tomato: '#d8331f', onion: '#b5578a', caramelized: '#8b4514', pickles: '#7f9a34', egg: '#fbf3dc', jalapeno: '#3e8526',
};
const layerName: Record<string, string> = {
  'bun-top': 'Pão (topo)', 'bun-bottom': 'Pão (base)', patty: 'Carne', cheese: 'Queijo', sauce: 'Molho', bacon: 'Bacon', lettuce: 'Alface',
  tomato: 'Tomate', onion: 'Cebola roxa', caramelized: 'Cebola caramelizada', pickles: 'Picles', egg: 'Ovo', jalapeno: 'Jalapeño',
};

function Price({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const c = animate(prev.current, value, { duration: 0.5, ease: 'easeOut', onUpdate: (v) => (el.textContent = money(v)) });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return <span ref={ref}>{money(value)}</span>;
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="rounded-[24px] border border-cream/10 bg-ink-800 p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="flex items-baseline gap-3 font-display text-2xl uppercase">
          <span className="text-base text-ember">{n}.</span>
          {title}
        </h3>
        {hint && <span className="text-xs font-semibold text-cream/45">{hint}</span>}
      </div>
      {children}
    </motion.div>
  );
}

function Option({ on, onClick, label, sub, price, disabled }: { on: boolean; onClick: () => void; label: string; sub?: string; price?: number; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled && !on}
      onClick={onClick}
      className={cx(
        'flex min-h-[56px] w-full scroll-mt-[52svh] items-center gap-3 rounded-2xl border px-4 py-2.5 text-left transition-all lg:scroll-mt-28 duration-200 active:scale-[0.98] disabled:opacity-35',
        on ? 'border-ember bg-ember/10' : 'border-cream/10 hover:border-cream/30',
      )}
    >
      <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition', on ? 'border-ember bg-ember text-ink' : 'border-cream/30')}>{on && <Check size={13} strokeWidth={3.5} />}</span>
      <span className="flex-1">
        <span className="block text-[15px] font-semibold leading-tight">{label}</span>
        {sub && <span className="block text-xs text-cream/50">{sub}</span>}
      </span>
      {price !== undefined && <span className="whitespace-nowrap text-sm font-semibold text-cream/60">{price ? `+${money(price)}` : 'incluso'}</span>}
    </button>
  );
}

/** Monte seu burger: escolhas → camadas 3D ao vivo, preço automático e resumo visual. */
export function Builder() {
  const [s, setS] = useState<BuilderState>(defaultBuild);
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const reduced = !!useReducedMotion();
  const { add } = useCart();
  const { toast } = useUI();
  const viewerRef = useRef<HTMLDivElement>(null);

  const layers = useMemo<LayerSpec[]>(() => builderLayers(s), [s]);
  const price = builderPrice(s);
  const set = <K extends keyof BuilderState>(k: K, v: BuilderState[K]) => setS((x) => ({ ...x, [k]: v }));
  const toggleIn = <T extends string>(list: T[], v: T, max = 99) => (list.includes(v) ? list.filter((x) => x !== v) : list.length >= max ? list : [...list, v]);

  const addToCart = () => {
    const label = name.trim() ? `Meu burger: ${name.trim()}` : 'Burger personalizado';
    add({ productId: 'custom', name: label, image: 'renders/hero.webp', unitPrice: price, details: builderDetails(s), notes: '', qty });
    flyToCart('renders/hero.webp', viewerRef.current?.getBoundingClientRect() ?? null);
    toast({ title: `${label} no pedido`, text: `${layers.length} camadas · ${money(price)}`, image: 'renders/hero.webp' });
  };

  return (
    <section id="monte" className="relative bg-ink py-24 md:py-32" aria-labelledby="monte-title">
      <div aria-hidden className="pointer-events-none absolute left-[-10%] top-40 h-[60vmin] w-[60vmin] rounded-full bg-ember/15 blur-[130px]" />
      <div className="wrap">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="eyebrow mb-5">Personalizador</p>
            <h2 id="monte-title" className="display text-[clamp(3rem,8vw,7rem)]">
              <SplitWords text="Monte seu" className="block" />
              <SplitWords text="burger." className="block text-ember" delay={0.15} />
            </h2>
          </div>
          <p className="max-w-[24rem] text-cream/60">Cada escolha aparece na hora na pilha em 3D. O preço é recalculado automaticamente.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* visualização */}
          <div className="sticky top-[72px] z-20 self-start -mx-5 bg-ink/90 px-5 pb-3 pt-2 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:top-24 lg:mx-0 lg:h-[min(76svh,720px)] lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div ref={viewerRef} className="relative h-[34svh] min-h-[220px] overflow-hidden rounded-[28px] border border-cream/10 bg-[radial-gradient(circle_at_50%_60%,#3a1a0c,#0b0907_70%)] lg:h-full">
              <BuilderViewer layers={layers} reduced={reduced} />
              <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-semibold text-cream/70 backdrop-blur">
                <Hand size={14} /> Arraste para girar
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div className="rounded-2xl bg-ink/75 px-4 py-2 backdrop-blur">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-cream/50">{layers.length} camadas</span>
                  <span className="font-display text-3xl leading-none text-ember lg:text-4xl" aria-live="polite">
                    <Price value={price} />
                  </span>
                </div>
                <button type="button" onClick={() => { setS(defaultBuild); setName(''); }} className="pointer-events-auto flex h-11 items-center gap-2 rounded-full bg-ink/75 px-4 text-sm font-semibold backdrop-blur transition hover:bg-cream hover:text-ink">
                  <RotateCcw size={15} /> Recomeçar
                </button>
              </div>
            </div>
          </div>

          {/* passos */}
          <div className="grid gap-4">
            <Step n={1} title="Pão">
              <div className="grid gap-2">
                {buns.map((b) => (
                  <Option key={b.id} on={s.bun === b.id} onClick={() => set('bun', b.id)} label={b.label} sub={b.note} price={b.price} />
                ))}
              </div>
            </Step>

            <Step n={2} title="Carne" hint={`Até ${MAX_MEATS} unidades`}>
              <div className="grid gap-2 sm:grid-cols-2">
                {meats.map((m) => (
                  <Option key={m.id} on={s.meat === m.id} onClick={() => set('meat', m.id)} label={m.label} sub={`${m.note} · ${money(m.price)} cada`} />
                ))}
              </div>
              <div className="mt-4 flex scroll-mt-[52svh] items-center justify-between rounded-2xl bg-cream/5 px-4 py-3 lg:scroll-mt-28">
                <span className="text-sm font-semibold">Quantidade de carnes</span>
                <Stepper value={s.meatQty} onChange={(v) => setS((x) => ({ ...x, meatQty: v, cheeses: x.cheeses.slice(0, Math.min(MAX_CHEESES, v)) }))} min={1} max={MAX_MEATS} label="carnes" size="sm" />
              </div>
            </Step>

            <Step n={3} title="Queijo" hint={`Até ${Math.min(MAX_CHEESES, s.meatQty)}, uma fatia por carne`}>
              <div className="grid gap-2 sm:grid-cols-2">
                {cheeses.map((c) => (
                  <Option key={c.id} on={s.cheeses.includes(c.id)} disabled={s.cheeses.length >= Math.min(MAX_CHEESES, s.meatQty)} onClick={() => set('cheeses', toggleIn(s.cheeses, c.id, Math.min(MAX_CHEESES, s.meatQty)))} label={c.label} price={c.price} />
                ))}
              </div>
            </Step>

            <Step n={4} title="Bacon" hint={`${money(BACON_PRICE)} por porção`}>
              <div className="flex scroll-mt-[52svh] items-center justify-between rounded-2xl bg-cream/5 px-4 py-3 lg:scroll-mt-28">
                <span className="text-sm font-semibold">{s.bacon === 0 ? 'Sem bacon' : `${s.bacon} ${s.bacon === 1 ? 'porção' : 'porções'} de bacon crocante`}</span>
                <Stepper value={s.bacon} onChange={(v) => set('bacon', v)} min={0} max={MAX_BACON} label="porções de bacon" size="sm" />
              </div>
            </Step>

            <Step n={5} title="Molhos" hint={`Até ${MAX_SAUCES}`}>
              <div className="grid gap-2 sm:grid-cols-2">
                {sauces.map((c) => (
                  <Option key={c.id} on={s.sauces.includes(c.id)} disabled={s.sauces.length >= MAX_SAUCES} onClick={() => set('sauces', toggleIn(s.sauces, c.id, MAX_SAUCES))} label={c.label} price={c.price} />
                ))}
              </div>
            </Step>

            <Step n={6} title="Extras e vegetais" hint="Adicione ou retire">
              <div className="grid gap-2 sm:grid-cols-2">
                {extras.map((c) => (
                  <Option key={c.id} on={s.extras.includes(c.id)} onClick={() => set('extras', toggleIn(s.extras, c.id))} label={c.label} price={c.price} />
                ))}
              </div>
            </Step>

            {/* resumo */}
            <div className="rounded-[24px] bg-cream p-5 text-ink sm:p-7">
              <h3 className="font-display text-3xl uppercase">Seu burger</h3>
              <div className="mt-5 grid gap-6 sm:grid-cols-[150px_1fr]">
                <ol className="flex flex-col-reverse items-center gap-[3px]" aria-label="Camadas, de baixo para cima">
                  {layers.map((l, i) => {
                    const bun = l.type === 'bun-top' || l.type === 'bun-bottom';
                    return (
                      <motion.li
                        key={`${l.type}-${i}`}
                        layout
                        initial={{ opacity: 0, scaleX: 0.4 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        title={layerName[l.type]}
                        className={cx('w-full', l.type === 'bun-top' ? 'h-7 rounded-t-[40px] rounded-b-md' : bun ? 'h-4 rounded-b-xl rounded-t-sm' : l.type === 'patty' ? 'h-4 rounded-md' : 'h-2 rounded-full')}
                        style={{ backgroundColor: layerColor[l.type], width: l.type === 'cheese' || l.type === 'lettuce' ? '108%' : undefined }}
                      >
                        <span className="sr-only">{layerName[l.type]}</span>
                      </motion.li>
                    );
                  })}
                </ol>
                <ul className="space-y-1.5 text-[15px]">
                  {builderDetails(s).map((d) => (
                    <li key={d} className="flex gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-ember-600" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
              <label className="mt-6 block">
                <span className="mb-1.5 block text-sm font-semibold text-ink/70">Dê um nome (opcional)</span>
                <input value={name} onChange={(e) => setName(e.target.value.slice(0, 28))} placeholder="Ex.: O Brabo da Madalena" className="w-full rounded-xl border border-ink/15 bg-white/60 px-4 py-3 text-ink placeholder:text-ink/35 focus:border-ember focus:outline-none" />
              </label>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-ink text-cream">
                  <Stepper value={qty} onChange={setQty} min={1} max={10} label="quantidade" />
                </div>
                <button type="button" onClick={addToCart} className="btn-primary btn-shine flex-1 justify-between !shadow-none">
                  <span className="flex items-center gap-2"><ShoppingBag size={18} /> Adicionar</span>
                  <span className="font-display text-lg tracking-normal">{money(price * qty)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
