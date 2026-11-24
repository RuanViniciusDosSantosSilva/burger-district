/** Textos institucionais da marca fictícia Burger District. */

export const storyText =
  'Tudo começou em 2019, numa chapa de ferro de segunda mão instalada num food truck estacionado na esquina da Vila Madalena. Três amigos, um blend testado à exaustão e uma regra simples: nada sai da cozinha se a gente não pediria de novo.';

export const timeline = [
  { year: '2019', title: 'O food truck', text: 'Uma chapa, um blend e fila dobrando a esquina às sextas.' },
  { year: '2021', title: 'A primeira loja', text: 'Endereço fixo, cozinha aberta e o primeiro brioche da casa.' },
  { year: '2023', title: 'O smash virou assinatura', text: 'O Bacon Rush entra no cardápio e nunca mais sai.' },
  { year: 'Hoje', title: 'O distrito', text: 'Salão, delivery próprio e a mesma chapa de ferro, agora restaurada.' },
];

export const pillars = [
  { icon: 'Beef', title: 'Blend próprio', text: 'Peito, acém e fraldinha moídos todos os dias na própria cozinha.' },
  { icon: 'Wheat', title: 'Pão da casa', text: 'Brioche com fermentação lenta de 18 horas, assado toda manhã.' },
  { icon: 'Flame', title: 'Chapa a 280 °C', text: 'Temperatura alta para selar, caramelizar e criar crosta de verdade.' },
  { icon: 'HeartHandshake', title: 'Feito para repetir', text: 'Cada receita só entra no cardápio depois de aprovada pela equipe inteira.' },
] as const;

/** Rótulos da vista explodida do District Prime (ordem de baixo para cima). */
export const anatomy: Record<string, { name: string; note: string }> = {
  'bun-bottom': { name: 'Brioche (base)', note: 'Selado na manteiga para segurar o molho' },
  sauce: { name: 'Maionese de ervas', note: 'Salsinha, cebolinha e limão-siciliano' },
  lettuce: { name: 'Alface americana', note: 'Crocante, lavada e gelada' },
  tomato: { name: 'Tomate italiano', note: 'Fatias firmes, levemente salgadas' },
  patty: { name: 'Blend angus 180 g', note: 'Moído no dia, selado a 280 °C' },
  cheese: { name: 'Queijo prato', note: 'Derretido sob a tampa da chapa' },
  onion: { name: 'Cebola roxa', note: 'Em anéis finos, para frescor' },
  'bun-top': { name: 'Brioche com gergelim', note: 'Fermentação lenta de 18 h' },
};

export const stats = [
  { value: 12, suffix: ' min', label: 'tempo médio entre o pedido e a chapa' },
  { value: 280, suffix: ' °C', label: 'temperatura da chapa no smash' },
  { value: 18, suffix: ' h', label: 'de fermentação do nosso brioche' },
  { value: 100, suffix: '%', label: 'do blend moído na própria cozinha' },
];

export const differentials = [
  { icon: 'Leaf', title: 'Ingredientes selecionados', text: 'Fornecedores locais, carne refrigerada (nunca congelada) e hortifrúti entregue diariamente.' },
  { icon: 'Timer', title: 'Preparado na hora', text: 'Nada fica esperando na estufa. Seu burger começa quando o pedido entra.' },
  { icon: 'Sparkles', title: 'Combinações exclusivas', text: 'Molhos, conservas e geleias desenvolvidos na casa. Você não encontra em outro lugar.' },
  { icon: 'MessageCircleHeart', title: 'Atendimento próximo', text: 'Quem atende conhece o cardápio de cor e ajusta o pedido do seu jeito.' },
  { icon: 'UtensilsCrossed', title: 'Experiência completa', text: 'Cozinha aberta, trilha sonora escolhida a dedo e mesa coletiva no salão.' },
] as const;

/** Depoimentos FICTÍCIOS para demonstração. Não são avaliações reais. */
export const reviews = [
  { name: 'Marina A.', rating: 5, text: 'O Bacon Rush é absurdo. A crosta do smash faz barulho quando você morde.', when: 'Cliente ilustrativa' },
  { name: 'Rafael T.', rating: 5, text: 'Montei meu próprio burger com três carnes e gorgonzola. Chegou exatamente como eu pedi.', when: 'Cliente ilustrativo' },
  { name: 'Júlia M.', rating: 5, text: 'A batata cheddar & bacon virou meu prato principal. Sem vergonha nenhuma.', when: 'Cliente ilustrativa' },
  { name: 'Diego S.', rating: 4, text: 'Fila grande na sexta, mas a cozinha aberta faz a espera passar rápido.', when: 'Cliente ilustrativo' },
  { name: 'Camila R.', rating: 5, text: 'O Green Block é o melhor burger vegetariano que já comi em São Paulo.', when: 'Cliente ilustrativa' },
  { name: 'Bruno L.', rating: 5, text: 'Pedi pelo WhatsApp, chegou quente e bem embalado. O shake de doce de leite fecha a noite.', when: 'Cliente ilustrativo' },
  { name: 'Patrícia V.', rating: 5, text: 'O District Prime tem equilíbrio. Dá para sentir cada ingrediente.', when: 'Cliente ilustrativa' },
  { name: 'Lucas F.', rating: 4, text: 'Hot Corner arde na medida certa. Voltaria só pelo molho de chipotle.', when: 'Cliente ilustrativo' },
];

/** Promoções semanais fictícias, com regra fixa (sem contagem regressiva falsa). */
export const weeklyDeals = [
  { day: 2, title: 'Terça do Smash', text: 'O segundo Classic Smash sai pela metade do preço.', tag: '2º com 50% off' },
  { day: 3, title: 'Quarta da Batata', text: 'Qualquer batata grande pelo preço da individual.', tag: 'Grande = individual' },
  { day: 4, title: 'Quinta do Shake', text: 'Na compra de um burger artesanal, o shake sai por R$ 12,90.', tag: 'Shake R$ 12,90' },
] as const;
