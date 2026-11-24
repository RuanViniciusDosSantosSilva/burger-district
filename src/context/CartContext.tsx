import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { site } from '@/config/site';
import { load, save } from '@/lib/storage';
import type { CartItem, CartItemInput } from '@/types';

const STORAGE_KEY = 'bd-cart-v1';

type Action =
  | { type: 'add'; item: CartItemInput }
  | { type: 'qty'; key: string; qty: number }
  | { type: 'notes'; key: string; notes: string }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

const itemKey = (i: CartItemInput) => `${i.productId}|${i.details.join(',')}|${i.notes.trim()}|${i.unitPrice}`;

function reducer(state: CartItem[], a: Action): CartItem[] {
  switch (a.type) {
    case 'add': {
      const key = itemKey(a.item);
      const qty = a.item.qty ?? 1;
      const hit = state.find((i) => i.key === key);
      if (hit) return state.map((i) => (i.key === key ? { ...i, qty: Math.min(99, i.qty + qty) } : i));
      return [...state, { ...a.item, key, qty }];
    }
    case 'qty':
      return a.qty <= 0 ? state.filter((i) => i.key !== a.key) : state.map((i) => (i.key === a.key ? { ...i, qty: Math.min(99, a.qty) } : i));
    case 'notes':
      return state.map((i) => (i.key === a.key ? { ...i, notes: a.notes } : i));
    case 'remove':
      return state.filter((i) => i.key !== a.key);
    case 'clear':
      return [];
  }
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: CartItemInput) => void;
  setQty: (key: string, qty: number) => void;
  setNotes: (key: string, notes: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  deliveryFee: (mode: 'entrega' | 'retirada') => number;
  /** incrementa a cada adição — usado para animar o ícone do carrinho */
  bump: number;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, undefined, () => {
    const saved = load<CartItem[]>(STORAGE_KEY, []);
    return Array.isArray(saved) ? saved.filter((i) => i && typeof i.key === 'string' && i.qty > 0) : [];
  });
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => save(STORAGE_KEY, items), [items]);

  const add = useCallback((item: CartItemInput) => {
    dispatch({ type: 'add', item });
    setBump((b) => b + 1);
  }, []);

  const value = useMemo<CartCtx>(() => {
    const subtotal = items.reduce((t, i) => t + i.unitPrice * i.qty, 0);
    return {
      items,
      count: items.reduce((t, i) => t + i.qty, 0),
      subtotal,
      open,
      setOpen,
      add,
      setQty: (key, qty) => dispatch({ type: 'qty', key, qty }),
      setNotes: (key, notes) => dispatch({ type: 'notes', key, notes }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
      deliveryFee: (mode) => (mode === 'retirada' || subtotal >= site.delivery.freeAbove || subtotal === 0 ? 0 : site.delivery.fee),
      bump,
    };
  }, [items, open, add, bump]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart deve ser usado dentro de <CartProvider>');
  return c;
}
