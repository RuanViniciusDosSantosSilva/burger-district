const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formata valores em reais (R$ 34,90). */
export const money = (v: number) => brl.format(v).replace(/ /g, ' ');

/** Remove acentos e caixa para busca. */
export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
