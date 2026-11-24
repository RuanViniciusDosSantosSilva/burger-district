import { useEffect } from 'react';

let locks = 0;
/** Trava a rolagem do body enquanto modais/painéis estão abertos (suporta vários ao mesmo tempo). */
export function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks++;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    return () => {
      locks--;
      if (locks === 0) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };
  }, [active]);
}
