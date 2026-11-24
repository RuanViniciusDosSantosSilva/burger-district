import { AnimatePresence, motion } from 'framer-motion';
import { Check, Users, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductBadges } from '@/components/ui/Badge';
import { ProductImage } from '@/components/ui/ProductImage';
import { Stepper } from '@/components/ui/Stepper';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { categoryById } from '@/data/products';
import { useLockScroll } from '@/hooks/useLockScroll';
import { flyToCart } from '@/lib/fly';
import { cx, money } from '@/lib/format';
import type { Product } from '@/types';

/** Experiência de detalhes do produto: foto ampliada, ingredientes, personalização, quantidade e preço ao vivo. */
export function ProductModal() {
  const { product, closeProduct } = useUI();
  useLockScroll(!!product);
  return <AnimatePresence>{product && <Sheet key={product.id} p={product} onClose={closeProduct} />}</AnimatePresence>;
}

function initialSelection(p: Product) {
  const sel: Record<string, string[]> = {};
  (p.options ?? []).forEach((g) => {
    if (g.type === 'single' && g.required) {
      const rec = g.choices.find((c) => c.label.includes('recomendado')) ?? g.choices[0];
      sel[g.id] = [rec.id];
    } else sel[g.id] = [];
  });
  return sel;
}

function Sheet({ p, onClose }: { p: Product; onClose: () => void }) {
  const cat = categoryById(p.category);
  const { add } = useCart();
  const { toast } = useUI();
  const [sel, setSel] = useState(() => initialSelection(p));
  const [removed, setRemoved] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>('button, input, textarea, select, a[href]');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  const unit = useMemo(
    () =>
      p.price +
      (p.options ?? []).reduce((t, g) => t + g.choices.filter((c) => sel[g.id]?.includes(c.id)).reduce((s, c) => s + c.price, 0), 0),
    [p, sel],
  );

  const toggle = (gid: string, cid: string, single: boolean, max?: number) =>
    setSel((s) => {
      const cur = s[gid] ?? [];
      if (single) return { ...s, [gid]: [cid] };
      if (cur.includes(cid)) return { ...s, [gid]: cur.filter((x) => x !== cid) };
      if (max && cur.length >= max) return s;
      return { ...s, [gid]: [...cur, cid] };
    });

  const missing = (p.options ?? []).filter((g) => g.required && !(sel[g.id]?.length));

  const submit = () => {
    if (missing.length) return;
    const details: string[] = [];
    (p.options ?? []).forEach((g) => {
      g.choices.filter((c) => sel[g.id]?.includes(c.id)).forEach((c) => details.push(c.price ? `${c.label} (+${money(c.price)})` : c.label));
    });
    removed.forEach((r) => details.push(`Sem ${r.toLowerCase()}`));
    add({ productId: p.id, name: p.name, image: p.image, unitPrice: unit, details, notes: notes.trim(), qty });
    flyToCart(p.image, imgRef.current?.getBoundingClientRect() ?? null);
    toast({ title: `${qty}× ${p.name} no pedido`, text: details.length ? details.slice(0, 3).join(' · ') : 'Do jeito da casa', image: p.image });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6">
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-title"
        tabIndex={-1}
        initial={{ y: '100%', opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="relative grid max-h-[94svh] w-full max-w-[1080px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-t-[28px] bg-ink-800 outline-none md:max-h-[88vh] md:grid-cols-[1fr_1.05fr] md:grid-rows-[1fr_auto] md:rounded-[32px]"
      >
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-ink/70 text-cream backdrop-blur transition hover:bg-ember hover:text-ink" aria-label="Fechar detalhes">
          <X size={20} />
        </button>

        {/* foto ampliada */}
        <div className="relative h-[34svh] min-h-[220px] overflow-hidden md:row-span-2 md:h-auto" style={{ backgroundColor: cat.bg }}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,.28),transparent_62%)]" />
          <span aria-hidden className="absolute bottom-[-0.15em] left-4 select-none font-display text-[22vw] uppercase leading-none opacity-[0.12] md:text-[150px]" style={{ color: cat.fg }}>
            {p.name.split(' ')[0]}
          </span>
          <motion.div ref={imgRef} initial={{ scale: 0.7, rotate: -8, y: 30 }} animate={{ scale: 1, rotate: 0, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }} className="absolute inset-[4%] md:inset-[8%]">
            <ProductImage src={p.image} alt={p.name} eager className="h-full w-full drop-shadow-[0_30px_30px_rgba(0,0,0,.45)]" />
          </motion.div>
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            <ProductBadges p={p} max={3} />
          </div>
        </div>

        {/* detalhes */}
        <div className="min-h-0 overflow-y-auto overscroll-contain p-6 md:col-start-2 md:p-9">
          <p className="text-sm font-bold text-ember">{cat.label}</p>
          <h2 id="pm-title" className="display mt-1 text-[clamp(2.4rem,5vw,3.6rem)]">{p.name}</h2>
          <p className="mt-3 leading-relaxed text-cream/70">{p.description}</p>
          {p.serves && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cream/60">
              <Users size={16} /> Serve {p.serves}
            </p>
          )}

          <h3 className="mt-7 text-xs font-bold uppercase tracking-wider text-cream/45">Ingredientes</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.ingredients.map((i) => (
              <li key={i} className="rounded-full bg-cream/5 px-3 py-1.5 text-sm text-cream/80">{i}</li>
            ))}
          </ul>

          {(p.options ?? []).map((g) => (
            <fieldset key={g.id} className="mt-8">
              <legend className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-cream/45">
                {g.label}
                <span className={cx('rounded-full px-2 py-0.5 text-[10px] normal-case tracking-normal', g.required ? 'bg-ember/15 text-ember' : 'bg-cream/5 text-cream/50')}>
                  {g.required ? 'Obrigatório' : g.max ? `Até ${g.max}` : 'Opcional'}
                </span>
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {g.choices.map((c) => {
                  const on = sel[g.id]?.includes(c.id);
                  return (
                    <label key={c.id} className={cx('flex min-h-[52px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-2.5 transition-colors', on ? 'border-ember bg-ember/10' : 'border-cream/10 hover:border-cream/30')}>
                      <input type={g.type === 'single' ? 'radio' : 'checkbox'} name={`${p.id}-${g.id}`} checked={!!on} onChange={() => toggle(g.id, c.id, g.type === 'single', g.max)} className="sr-only" />
                      <span className={cx('grid h-5 w-5 shrink-0 place-items-center border-2 transition', g.type === 'single' ? 'rounded-full' : 'rounded-md', on ? 'border-ember bg-ember text-ink' : 'border-cream/30')}>
                        {on && <Check size={13} strokeWidth={3.5} />}
                      </span>
                      <span className="flex-1 text-[15px] font-medium">{c.label}</span>
                      {c.price > 0 && <span className="whitespace-nowrap text-sm font-semibold text-cream/60">+{money(c.price)}</span>}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {!!p.removable?.length && (
            <fieldset className="mt-8">
              <legend className="text-xs font-bold uppercase tracking-wider text-cream/45">Retirar ingredientes</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.removable.map((r) => {
                  const on = removed.includes(r);
                  return (
                    <button key={r} type="button" aria-pressed={on} onClick={() => setRemoved((l) => (on ? l.filter((x) => x !== r) : [...l, r]))} className={cx('chip', on ? 'border-red-400/60 bg-red-500/10 text-red-200 line-through' : 'text-cream/80 hover:border-cream/40')}>
                      Sem {r.toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <label className="mt-8 block">
            <span className="text-xs font-bold uppercase tracking-wider text-cream/45">Observações</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 140))} rows={2} placeholder="Ex.: cortar ao meio, molho à parte…" className="field mt-3 resize-none" />
            <span className="mt-1 block text-right text-xs text-cream/35">{notes.length}/140</span>
          </label>
        </div>

        {/* rodapé fixo */}
        <div className="safe-bottom flex items-center gap-3 border-t border-cream/10 bg-ink-800 px-6 pt-4 md:col-start-2 md:px-9 md:pb-6">
          <Stepper value={qty} onChange={setQty} min={1} max={20} label="quantidade" />
          <button type="button" onClick={submit} disabled={missing.length > 0} className="btn-primary btn-shine flex-1 justify-between !px-5">
            <span>Adicionar</span>
            <motion.span key={unit * qty} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="whitespace-nowrap font-display text-lg tracking-normal">
              {money(unit * qty)}
            </motion.span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
