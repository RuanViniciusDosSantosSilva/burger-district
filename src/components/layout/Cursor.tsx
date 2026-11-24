import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useMedia, useReducedMotion } from '@/hooks/useReducedMotion';

/** Cursor personalizado (somente mouse): ponto + anel que cresce sobre elementos interativos. */
export function Cursor() {
  const fine = useMedia('(pointer: fine)');
  const reduced = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 500, damping: 40 });
  const ry = useSpring(y, { stiffness: 500, damping: 40 });
  const [mode, setMode] = useState<'default' | 'link' | 'label'>('default');
  const [label, setLabel] = useState('');
  const [hidden, setHidden] = useState(true);
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-cursor');
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const t = e.target as HTMLElement;
      const lab = t.closest<HTMLElement>('[data-cursor]');
      if (lab) {
        setMode('label');
        setLabel(lab.dataset.cursor ?? '');
      } else if (t.closest('a,button,input,textarea,select,label,[role="tab"]')) setMode('link');
      else setMode('default');
    };
    const leave = () => setHidden(true);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const size = mode === 'label' ? 84 : mode === 'link' ? 54 : 34;
  return (
    <>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[200] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember" style={{ x, y, opacity: hidden ? 0 : 1 }} />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[199] grid place-items-center rounded-full border border-ember/70 mix-blend-difference"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%', opacity: hidden ? 0 : 1 }}
        animate={{ width: size, height: size, backgroundColor: mode === 'label' ? 'rgba(226,86,27,1)' : 'rgba(226,86,27,0)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        {mode === 'label' && <span className="font-display text-sm uppercase text-cream">{label}</span>}
      </motion.div>
    </>
  );
}
