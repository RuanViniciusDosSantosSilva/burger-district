import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, NotebookPen, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ProductImage } from '@/components/ui/ProductImage';
import { Stepper } from '@/components/ui/Stepper';
import { site } from '@/config/site';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useLockScroll } from '@/hooks/useLockScroll';
import { money } from '@/lib/format';
import type { CartItem } from '@/types';

function Line({ it }: { it: CartItem }) {
  const { setQty, setNotes, remove } = useCart();
  const [editing, setEditing] = useState(false);
  return (
    <motion.li layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }} transition={{ duration: 0.35 }} className="border-b border-cream/10 py-5">
      <div className="flex gap-4">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-ember/90 p-1.5">
          <ProductImage src={it.image} alt="" className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl uppercase leading-tight">{it.name}</h3>
            <button type="button" onClick={() => remove(it.key)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream/50 transition hover:bg-red-500/15 hover:text-red-300" aria-label={`Remover ${it.name}`}>
              <Trash2 size={16} />
            </button>
          </div>
          {it.details.length > 0 && <p className="mt-1 text-[13px] leading-snug text-cream/55">{it.details.join(' · ')}</p>}
          {it.notes && !editing && <p className="mt-1 text-[13px] italic text-mustard/90">“{it.notes}”</p>}
          {editing && (
            <input autoFocus defaultValue={it.notes} maxLength={140} onBlur={(e) => { setNotes(it.key, e.target.value.trim()); setEditing(false); }} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} placeholder="Ex.: sem sal na batata" className="field mt-2 !py-2 text-sm" aria-label={`Observação para ${it.name}`} />
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            <Stepper value={it.qty} onChange={(v) => setQty(it.key, v)} min={0} max={99} label={`quantidade de ${it.name}`} size="sm" />
            <span className="whitespace-nowrap font-display text-xl text-ember">{money(it.unitPrice * it.qty)}</span>
          </div>
          {!editing && (
            <button type="button" onClick={() => setEditing(true)} className="mt-2 inline-flex min-h-[32px] items-center gap-1.5 text-xs font-semibold text-cream/55 hover:text-cream">
              <NotebookPen size={13} /> {it.notes ? 'Editar observação' : 'Adicionar observação'}
            </button>
          )}
        </div>
      </div>
    </motion.li>
  );
}

/** Carrinho lateral: quantidades, observações, subtotal e progresso para entrega grátis. */
export function CartDrawer() {
  const { items, open, setOpen, subtotal, count, clear } = useCart();
  const { setCheckoutOpen } = useUI();
  const panel = useRef<HTMLDivElement>(null);
  useLockScroll(open);
  const missing = Math.max(0, site.delivery.freeAbove - subtotal);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const on = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75]">
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Seu pedido"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-[460px] flex-col bg-ink-800 shadow-deep outline-none"
          >
            <header className="flex items-center justify-between border-b border-cream/10 px-6 py-5">
              <h2 className="flex items-baseline gap-3 font-display text-3xl uppercase">
                Seu pedido <span className="font-sans text-sm font-semibold text-cream/50">{count} {count === 1 ? 'item' : 'itens'}</span>
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 hover:border-ember hover:text-ember" aria-label="Fechar carrinho">
                <X size={20} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} className="grid h-24 w-24 place-items-center rounded-full bg-cream/5 text-ember">
                  <ShoppingBag size={40} />
                </motion.div>
                <p className="display mt-6 text-4xl">Carrinho vazio</p>
                <p className="mt-2 text-cream/60">A chapa está quente. Que tal começar pelo Bacon Rush?</p>
                <a href="#cardapio" onClick={() => setOpen(false)} className="btn-primary mt-8">
                  Ver cardápio <ArrowRight size={18} />
                </a>
              </div>
            ) : (
              <>
                <div className="border-b border-cream/10 px-6 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Truck size={16} className="text-ember" />
                    {missing > 0 ? <>Faltam <span className="text-ember">{money(missing)}</span> para entrega grátis</> : 'Você ganhou entrega grátis!'}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream/10">
                    <motion.div className="h-full rounded-full bg-ember" animate={{ width: `${Math.min(100, (subtotal / site.delivery.freeAbove) * 100)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                  </div>
                </div>
                <ul className="flex-1 overflow-y-auto overscroll-contain px-6">
                  <AnimatePresence initial={false}>
                    {items.map((it) => (
                      <Line key={it.key} it={it} />
                    ))}
                  </AnimatePresence>
                </ul>
                <footer className="safe-bottom border-t border-cream/10 px-6 pt-5">
                  <div className="flex items-center justify-between text-cream/70">
                    <span>Subtotal</span>
                    <span className="font-semibold tabular-nums text-cream">{money(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-cream/45">Taxa de entrega calculada na próxima etapa.</p>
                  <button type="button" onClick={() => { setOpen(false); setCheckoutOpen(true); }} className="btn-primary btn-shine mt-4 w-full justify-between">
                    Finalizar pedido <span className="font-display text-lg tracking-normal">{money(subtotal)}</span>
                  </button>
                  <button type="button" onClick={clear} className="mt-2 min-h-[44px] w-full text-sm font-semibold text-cream/45 transition hover:text-red-300">
                    Esvaziar carrinho
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
