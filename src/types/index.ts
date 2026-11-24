/** Tipos centrais do domínio Burger District. */

export type CategoryId = 'smash' | 'artesanal' | 'combos' | 'batatas' | 'sobremesas' | 'bebidas';

/* ---------- Modelos 3D (usados no motor e nos renders de produto) ---------- */

export type BunVariant = 'brioche' | 'australiano' | 'batata';
export type PattyVariant = 'smash' | 'angus' | 'frango' | 'vegetal';
export type CheeseVariant = 'cheddar' | 'americano' | 'prato' | 'gorgonzola' | 'pepperjack';
export type SauceVariant = 'district' | 'barbecue' | 'ervas' | 'chipotle' | 'cheddar';

export type LayerSpec =
  | { type: 'bun-bottom'; variant?: BunVariant }
  | { type: 'bun-top'; variant?: BunVariant }
  | { type: 'patty'; variant?: PattyVariant }
  | { type: 'cheese'; variant?: CheeseVariant }
  | { type: 'sauce'; variant?: SauceVariant }
  | { type: 'bacon' }
  | { type: 'lettuce' }
  | { type: 'tomato' }
  | { type: 'onion' }
  | { type: 'caramelized' }
  | { type: 'pickles' }
  | { type: 'egg' }
  | { type: 'jalapeno' };

export type LayerType = LayerSpec['type'];

export type SideVariant = 'classica' | 'cheddar-bacon' | 'rustica' | 'onion-rings';
export type DrinkVariant = 'lata' | 'limonada' | 'soda' | 'mate';
export type DessertVariant = 'brownie' | 'shake' | 'churros';

export type ModelSpec =
  | { kind: 'burger'; layers: LayerSpec[] }
  | { kind: 'side'; variant: SideVariant }
  | { kind: 'drink'; variant: DrinkVariant }
  | { kind: 'dessert'; variant: DessertVariant }
  | { kind: 'combo'; burgers: LayerSpec[][]; sides: SideVariant[]; drinks: number }
  | { kind: 'griddle' };

/* ---------- Cardápio ---------- */

export interface OptionChoice {
  id: string;
  label: string;
  price: number;
}

export interface OptionGroup {
  id: string;
  label: string;
  /** single = escolha única (rádio); multi = várias (checkbox) */
  type: 'single' | 'multi';
  required?: boolean;
  max?: number;
  choices: OptionChoice[];
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  tagline: string;
  description: string;
  price: number;
  ingredients: string[];
  /** Ingredientes que o cliente pode retirar no detalhe do produto. */
  removable?: string[];
  popular?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  spicy?: boolean;
  serves?: string;
  /** Posição de popularidade (menor = mais pedido). */
  rank: number;
  /**
   * Caminho da imagem. Por padrão aponta para o render 3D do estúdio.
   * Para usar fotografia real, coloque o arquivo em /public/images e troque o caminho aqui.
   */
  image: string;
  model: ModelSpec;
  options?: OptionGroup[];
}

export interface Category {
  id: CategoryId;
  label: string;
  headline: string;
  blurb: string;
  /** Cores da identidade própria de cada categoria. */
  bg: string;
  fg: string;
  accent: string;
}

/* ---------- Carrinho ---------- */

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  /** Descrição legível das escolhas (adicionais, remoções, sabores). */
  details: string[];
  notes: string;
}

export type CartItemInput = Omit<CartItem, 'key' | 'qty'> & { qty?: number };
