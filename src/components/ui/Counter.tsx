import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

/** Número que conta de 0 até o valor quando entra na tela. */
export function Counter({ to, suffix = '', className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    const c = animate(0, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`) });
    return () => c.stop();
  }, [inView, to, suffix, reduce]);
  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
