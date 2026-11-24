import { Flame, Leaf, Sparkles, Trophy } from 'lucide-react';
import type { Product } from '@/types';

/** Selos do produto: mais vendido, popular, novo, picante. */
export function ProductBadges({ p, max = 2 }: { p: Product; max?: number }) {
  const list: { key: string; label: string; icon: JSX.Element; cls: string }[] = [];
  if (p.bestSeller) list.push({ key: 'best', label: 'Mais vendido', icon: <Trophy size={12} />, cls: 'bg-ember text-ink' });
  else if (p.popular) list.push({ key: 'pop', label: 'Popular', icon: <Flame size={12} />, cls: 'bg-cream text-ink' });
  if (p.isNew) list.push({ key: 'new', label: 'Novidade', icon: <Sparkles size={12} />, cls: 'bg-mustard text-ink' });
  if (p.spicy) list.push({ key: 'hot', label: 'Picante', icon: <Flame size={12} />, cls: 'bg-red-600 text-white' });
  if (p.id === 'green-block') list.push({ key: 'veg', label: 'Vegetariano', icon: <Leaf size={12} />, cls: 'bg-emerald-600 text-white' });
  return (
    <>
      {list.slice(0, max).map((b) => (
        <span key={b.key} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${b.cls}`}>
          {b.icon}
          {b.label}
        </span>
      ))}
    </>
  );
}
