import { useEffect, useState } from 'react';
import { nav } from '@/config/site';

/** Scrollspy: retorna o id da seção visível no meio da tela. */
export function useActiveSection() {
  const [active, setActive] = useState('inicio');
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}
