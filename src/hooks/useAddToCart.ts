import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { flyToCart } from '@/lib/fly';
import type { Product } from '@/types';

/** Adição rápida (sem personalização) com feedback visual. */
export function useQuickAdd() {
  const { add } = useCart();
  const { toast } = useUI();
  return (p: Product, fromEl?: HTMLElement | null) => {
    // Itens com escolha obrigatória usam a primeira opção como padrão na adição rápida
    const defaults = (p.options ?? []).filter((g) => g.required).map((g) => g.choices[Math.min(1, g.choices.length - 1)].label);
    const details = (p.options ?? []).some((g) => g.id === 'ponto') ? defaults : (p.options ?? []).filter((g) => g.required).map((g) => g.choices[0].label);
    add({ productId: p.id, name: p.name, image: p.image, unitPrice: p.price, details, notes: '' });
    flyToCart(p.image, fromEl?.getBoundingClientRect() ?? null);
    toast({ title: `${p.name} no pedido`, text: details.length ? details.join(' · ') : 'Toque no carrinho para revisar', image: p.image });
  };
}
