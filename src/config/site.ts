/**
 * Configuração central da marca.
 * Todos os dados abaixo são DEMONSTRATIVOS — troque aqui para usar em um cliente real.
 */
export const site = {
  name: 'Burger District',
  slogan: 'Não é só um hambúrguer. É outro nível.',
  founded: 2019,
  demoNotice: 'Projeto demonstrativo de portfólio. Marca, endereço, contatos e preços são fictícios.',

  address: {
    street: 'Rua das Brasas, 120',
    district: 'Vila Madalena',
    city: 'São Paulo',
    state: 'SP',
    zip: '05433-000',
    reference: 'Esquina com a Travessa do Carvão',
  },
  /** Coordenadas usadas no link "Como chegar". */
  geo: { lat: -23.5568, lng: -46.6908 },
  /** Para incorporar um mapa real, cole aqui a URL de embed do Google Maps (iframe). */
  mapEmbedUrl: '',

  phoneDisplay: '(11) 4002-0000',
  phoneHref: 'tel:+551140020000',
  /** Número no formato internacional, apenas dígitos (usado no wa.me). */
  whatsapp: '5511999990000',
  whatsappDisplay: '(11) 99999-0000',
  instagram: '@burgerdistrict.demo',
  instagramUrl: 'https://instagram.com/',
  email: 'contato@burgerdistrict.demo',

  /** 0 = domingo … 6 = sábado. Horários no fuso de São Paulo. */
  hours: [
    { day: 0, label: 'Domingo', open: '18:00', close: '23:00' },
    { day: 1, label: 'Segunda', open: null, close: null },
    { day: 2, label: 'Terça', open: '18:00', close: '23:00' },
    { day: 3, label: 'Quarta', open: '18:00', close: '23:00' },
    { day: 4, label: 'Quinta', open: '18:00', close: '23:30' },
    { day: 5, label: 'Sexta', open: '18:00', close: '00:30' },
    { day: 6, label: 'Sábado', open: '12:00', close: '00:30' },
  ] as { day: number; label: string; open: string | null; close: string | null }[],

  delivery: {
    fee: 7.9,
    freeAbove: 120,
    etaMinutes: [35, 50] as [number, number],
  },
} as const;

export const nav = [
  { id: 'inicio', label: 'Início' },
  { id: 'historia', label: 'Nossa história' },
  { id: 'cardapio', label: 'Cardápio' },
  { id: 'favoritos', label: 'Mais pedidos' },
  { id: 'monte', label: 'Monte seu burger' },
  { id: 'promocoes', label: 'Promoções' },
  { id: 'experiencia', label: 'Experiência' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'localizacao', label: 'Localização' },
  { id: 'contato', label: 'Contato' },
] as const;

/** Atraso (s) das animações de entrada do hero, para começarem quando o preloader sai. */
export const INTRO_DELAY = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1.15;
