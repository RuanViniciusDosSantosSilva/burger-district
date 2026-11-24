import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { money } from '@/lib/format';

/** Barra fixa no celular: o carrinho sempre a um toque. */
export function MobileCartBar() {
  const { count, subtotal, setOpen, bump } = useCart();
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="safe-bottom fixed inset-x-0 bottom-0 z-[60] px-4 pt-2 md:hidden">
          <button type="button" onClick={() => setOpen(true)} data-cart-target className="flex min-h-[58px] w-full items-center justify-between gap-3 rounded-full bg-ember px-5 text-ink shadow-ember active:scale-[0.98]">
            <motion.span key={bump} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="flex items-center gap-3 font-bold">
              <span className="relative">
                <ShoppingBag size={22} />
                <span className="absolute -right-2 -top-2 grid h-5 min-w-[20px] place-items-center rounded-full bg-ink px-1 text-[11px] text-cream">{count}</span>
              </span>
              Ver pedido
            </motion.span>
            <span className="font-display text-xl">{money(subtotal)}</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
