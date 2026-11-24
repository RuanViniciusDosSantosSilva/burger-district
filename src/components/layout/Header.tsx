import { AnimatePresence, motion } from 'framer-motion';
import { Menu, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useActiveSection } from '@/hooks/useActiveSection';
import { cx } from '@/lib/format';
import { openStatus } from '@/lib/hours';

const desktopLinks = [
  { id: 'historia', label: 'História' },
  { id: 'cardapio', label: 'Cardápio' },
  { id: 'favoritos', label: 'Mais pedidos' },
  { id: 'monte', label: 'Monte o seu' },
  { id: 'promocoes', label: 'Promoções' },
  { id: 'contato', label: 'Contato' },
];

export function Header() {
  const { count, setOpen, bump } = useCart();
  const { setMenuOpen } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();
  const status = openStatus();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500',
        scrolled ? 'border-b border-cream/10 bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="wrap flex h-[72px] items-center justify-between gap-4">
        <a href="#inicio" className="shrink-0" aria-label="Burger District — voltar ao início">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {desktopLinks.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className={cx(
                    'relative whitespace-nowrap rounded-full px-3 py-2 text-[14px] font-semibold transition-colors',
                    active === l.id ? 'text-cream' : 'text-cream/60 hover:text-cream',
                  )}
                  aria-current={active === l.id ? 'true' : undefined}
                >
                  {active === l.id && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-cream/10" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <span className={cx('hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold 2xl:inline-flex', status.open ? 'bg-emerald-500/10 text-emerald-300' : 'bg-cream/5 text-cream/60')}>
            <span className={cx('h-2 w-2 rounded-full', status.open ? 'animate-pulse bg-emerald-400' : 'bg-cream/40')} />
            {status.label}
          </span>
          <a href="#cardapio" className="btn-primary btn-shine hidden whitespace-nowrap !min-h-[44px] !px-5 !text-[13px] md:inline-flex">
            Fazer pedido
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-cart-target
            className="relative grid h-11 w-11 place-items-center rounded-full border border-cream/15 transition hover:border-ember hover:text-ember"
            aria-label={`Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}
          >
            <motion.span key={bump} initial={{ scale: bump ? 0.6 : 1, rotate: bump ? -18 : 0 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
              <ShoppingBag size={19} />
            </motion.span>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-ember px-1 text-[11px] font-bold text-ink"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 transition hover:border-ember hover:text-ember xl:hidden"
            aria-label="Abrir menu"
            aria-haspopup="dialog"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
