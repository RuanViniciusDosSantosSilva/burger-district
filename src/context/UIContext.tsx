import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Product } from '@/types';

export interface Toast {
  id: number;
  title: string;
  text?: string;
  image?: string;
}

interface UICtx {
  product: Product | null;
  openProduct: (p: Product) => void;
  closeProduct: () => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

const Ctx = createContext<UICtx | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = ++seq.current;
      setToasts((list) => [...list.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      product,
      openProduct: setProduct,
      closeProduct: () => setProduct(null),
      checkoutOpen,
      setCheckoutOpen,
      menuOpen,
      setMenuOpen,
      toasts,
      toast,
      dismiss,
    }),
    [product, checkoutOpen, menuOpen, toasts, toast, dismiss],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUI() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useUI deve ser usado dentro de <UIProvider>');
  return c;
}
