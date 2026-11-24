import type { LayerSpec } from '@/types';

/** Burger-assinatura usado no hero (o mais "fotogênico" da casa). */
export const signatureLayers: LayerSpec[] = [
  { type: 'bun-bottom', variant: 'brioche' },
  { type: 'sauce', variant: 'district' },
  { type: 'lettuce' },
  { type: 'tomato' },
  { type: 'patty', variant: 'smash' },
  { type: 'cheese', variant: 'cheddar' },
  { type: 'bacon' },
  { type: 'patty', variant: 'smash' },
  { type: 'cheese', variant: 'cheddar' },
  { type: 'caramelized' },
  { type: 'bun-top', variant: 'brioche' },
];

/** Camadas do District Prime, usadas na vista explodida "Anatomia". */
export const anatomyLayers: LayerSpec[] = [
  { type: 'bun-bottom', variant: 'brioche' },
  { type: 'sauce', variant: 'ervas' },
  { type: 'lettuce' },
  { type: 'tomato' },
  { type: 'patty', variant: 'angus' },
  { type: 'cheese', variant: 'prato' },
  { type: 'onion' },
  { type: 'bun-top', variant: 'brioche' },
];
