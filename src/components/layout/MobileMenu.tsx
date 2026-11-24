import { AnimatePresence, motion } from 'framer-motion';
import { Instagram, MessageCircle, Phone, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Logo } from '@/components/ui/Logo';
import { nav, site } from '@/config/site';
import { useUI } from '@/context/UIContext';
import { useLockScroll } from '@/hooks/useLockScroll';

/** Menu em tela cheia (tablet e celular) com todas as seções. */
export function MobileMenu() {
  const { menuOpen, setMenuOpen } = useUI();
  const closeRef = useRef<HTMLButtonElement>(null);
  useLockScroll(menuOpen);

  useEffect(() => {
    if (!menuOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, setMenuOpen]);

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-ink"
          initial={{ clipPath: 'circle(0% at calc(100% - 44px) 36px)' }}
          animate={{ clipPath: 'circle(150% at calc(100% - 44px) 36px)' }}
          exit={{ clipPath: 'circle(0% at calc(100% - 44px) 36px)' }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="pointer-events-none absolute -right-40 top-1/3 h-[480px] w-[480px] rounded-full bg-ember/20 blur-[120px]" />
          <div className="wrap flex h-[72px] shrink-0 items-center justify-between">
            <Logo />
            <button ref={closeRef} type="button" onClick={() => setMenuOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-cream/20" aria-label="Fechar menu">
              <X size={20} />
            </button>
          </div>
          <nav className="wrap flex-1 py-6" aria-label="Seções">
            <ul className="grid gap-1 sm:grid-cols-2 sm:gap-x-10">
              {nav.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                  <a
                    href={`#${l.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-baseline gap-3 border-b border-cream/10 py-3 font-display text-[clamp(2rem,8vw,3.2rem)] uppercase leading-none transition-colors hover:text-ember"
                  >
                    <span className="font-sans text-xs font-bold text-cream/40 group-hover:text-ember">{String(i + 1).padStart(2, '0')}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className="wrap flex flex-wrap gap-3 pb-8 pt-2">
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="chip hover:border-ember">
              <MessageCircle size={16} /> WhatsApp {site.whatsappDisplay}
            </a>
            <a href={site.phoneHref} className="chip hover:border-ember">
              <Phone size={16} /> {site.phoneDisplay}
            </a>
            <a href={site.instagramUrl} target="_blank" rel="noreferrer" className="chip hover:border-ember">
              <Instagram size={16} /> {site.instagram}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
