import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Tela de carregamento curta com contador — some assim que fontes e página estão prontas. */
export function Preloader() {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  const [done, setDone] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    let ready = false;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    Promise.race([fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]).then(() => (ready = true));
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const v = Math.min(ready ? 100 : 92, Math.round((1 - Math.pow(1 - Math.min(t, 1), 3)) * 100));
      setN(v);
      if (v >= 100) setTimeout(() => setDone(true), 200);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // garantia: nunca segura o visitante por mais de 3 s
    const failsafe = window.setTimeout(() => setDone(true), 3000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col justify-between bg-ember p-6 text-ink sm:p-10"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <span className="font-display text-xl uppercase">Burger District</span>
          <div className="flex items-end justify-between">
            <span className="font-mark text-2xl sm:text-3xl">esquentando a chapa…</span>
            <span className="font-display text-[22vw] leading-[0.8] tabular-nums sm:text-[14vw]">{n}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
