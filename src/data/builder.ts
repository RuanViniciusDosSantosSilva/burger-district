import type { BunVariant, CheeseVariant, LayerSpec, PattyVariant, SauceVariant } from '@/types';

/** Opções e preços do "Monte seu burger" (valores demonstrativos). */

export const BUILDER_BASE = 12; // montagem + embalagem

export const buns: { id: BunVariant; label: string; note: string; price: number }[] = [
  { id: 'brioche', label: 'Brioche', note: 'Amanteigado, selado na chapa', price: 0 },
  { id: 'australiano', label: 'Australiano', note: 'Escuro, levemente adocicado', price: 2 },
  { id: 'batata', label: 'Pão de batata', note: 'Macio e dourado', price: 2 },
];

export const meats: { id: PattyVariant; label: string; note: string; price: number }[] = [
  { id: 'smash', label: 'Smash 80 g', note: 'Crosta rendada', price: 9 },
  { id: 'angus', label: 'Angus 180 g', note: 'Alto e suculento', price: 18 },
  { id: 'frango', label: 'Frango crocante', note: 'Sobrecoxa empanada', price: 13 },
  { id: 'vegetal', label: 'Vegetal da casa', note: 'Grão-de-bico e cogumelos', price: 13 },
];

export const cheeses: { id: CheeseVariant; label: string; price: number }[] = [
  { id: 'cheddar', label: 'Cheddar', price: 4 },
  { id: 'americano', label: 'Americano', price: 4 },
  { id: 'prato', label: 'Prato', price: 4 },
  { id: 'pepperjack', label: 'Pepper jack', price: 5 },
  { id: 'gorgonzola', label: 'Gorgonzola', price: 6 },
];

export const sauces: { id: SauceVariant; label: string; price: number }[] = [
  { id: 'district', label: 'Molho District', price: 2 },
  { id: 'barbecue', label: 'Barbecue defumado', price: 2 },
  { id: 'ervas', label: 'Maionese de ervas', price: 2 },
  { id: 'chipotle', label: 'Maionese de chipotle', price: 2 },
  { id: 'cheddar', label: 'Creme de cheddar', price: 3 },
];

export type ExtraId = 'lettuce' | 'tomato' | 'onion' | 'caramelized' | 'pickles' | 'egg' | 'jalapeno';
export const extras: { id: ExtraId; label: string; price: number }[] = [
  { id: 'lettuce', label: 'Alface', price: 0 },
  { id: 'tomato', label: 'Tomate', price: 0 },
  { id: 'onion', label: 'Cebola roxa', price: 0 },
  { id: 'pickles', label: 'Picles', price: 1 },
  { id: 'caramelized', label: 'Cebola caramelizada', price: 4 },
  { id: 'egg', label: 'Ovo na chapa', price: 4 },
  { id: 'jalapeno', label: 'Jalapeño', price: 3 },
];

export const BACON_PRICE = 6;
export const MAX_MEATS = 4;
export const MAX_BACON = 3;
export const MAX_SAUCES = 2;
export const MAX_CHEESES = 2;

export interface BuilderState {
  bun: BunVariant;
  meat: PattyVariant;
  meatQty: number;
  cheeses: CheeseVariant[];
  bacon: number;
  sauces: SauceVariant[];
  extras: ExtraId[];
}

export const defaultBuild: BuilderState = {
  bun: 'brioche',
  meat: 'smash',
  meatQty: 2,
  cheeses: ['cheddar'],
  bacon: 1,
  sauces: ['district'],
  extras: ['lettuce', 'pickles'],
};

export function builderPrice(s: BuilderState) {
  const bun = buns.find((b) => b.id === s.bun)!.price;
  const meat = meats.find((m) => m.id === s.meat)!.price * s.meatQty;
  const cheese = s.cheeses.reduce((t, c) => t + cheeses.find((x) => x.id === c)!.price, 0);
  const sauce = s.sauces.reduce((t, c) => t + sauces.find((x) => x.id === c)!.price, 0);
  const extra = s.extras.reduce((t, c) => t + extras.find((x) => x.id === c)!.price, 0);
  return BUILDER_BASE + bun + meat + cheese + sauce + extra + s.bacon * BACON_PRICE;
}

/** Converte as escolhas em camadas 3D, na ordem real de montagem. */
export function builderLayers(s: BuilderState): LayerSpec[] {
  const L: LayerSpec[] = [{ type: 'bun-bottom', variant: s.bun }];
  if (s.sauces[0]) L.push({ type: 'sauce', variant: s.sauces[0] });
  if (s.extras.includes('lettuce')) L.push({ type: 'lettuce' });
  if (s.extras.includes('tomato')) L.push({ type: 'tomato' });
  for (let i = 0; i < s.meatQty; i++) {
    L.push({ type: 'patty', variant: s.meat });
    const c = s.cheeses[i];
    if (c) L.push({ type: 'cheese', variant: c });
  }
  for (let i = 0; i < s.bacon; i++) L.push({ type: 'bacon' });
  if (s.extras.includes('egg')) L.push({ type: 'egg' });
  if (s.extras.includes('caramelized')) L.push({ type: 'caramelized' });
  if (s.extras.includes('onion')) L.push({ type: 'onion' });
  if (s.extras.includes('pickles')) L.push({ type: 'pickles' });
  if (s.extras.includes('jalapeno')) L.push({ type: 'jalapeno' });
  if (s.sauces[1]) L.push({ type: 'sauce', variant: s.sauces[1] });
  L.push({ type: 'bun-top', variant: s.bun });
  return L;
}

export function builderDetails(s: BuilderState): string[] {
  const d: string[] = [];
  d.push(`Pão ${buns.find((b) => b.id === s.bun)!.label}`);
  d.push(`${s.meatQty}× ${meats.find((m) => m.id === s.meat)!.label}`);
  if (s.cheeses.length) d.push(`Queijo: ${s.cheeses.map((c) => cheeses.find((x) => x.id === c)!.label).join(', ')}`);
  else d.push('Sem queijo');
  if (s.bacon) d.push(`${s.bacon}× bacon`);
  if (s.sauces.length) d.push(`Molhos: ${s.sauces.map((c) => sauces.find((x) => x.id === c)!.label).join(', ')}`);
  if (s.extras.length) d.push(`Extras: ${s.extras.map((c) => extras.find((x) => x.id === c)!.label).join(', ')}`);
  return d;
}
