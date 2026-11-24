import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useUI } from '@/context/UIContext';

/** Notificações de feedback (ex.: item adicionado). */
export function Toasts() {
  const { toasts, dismiss } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6 md:left-auto md:right-6 md:items-end" aria-live="polite" role="status">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-[380px] items-center gap-3 rounded-2xl border border-cream/10 bg-ink-700/95 p-3 pr-2 shadow-deep backdrop-blur-xl"
          >
            {t.image && <img src={t.image} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-ember object-contain p-1" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{t.title}</p>
              {t.text && <p className="truncate text-sm text-cream/60">{t.text}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream/50 hover:bg-cream/10" aria-label="Fechar aviso">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
