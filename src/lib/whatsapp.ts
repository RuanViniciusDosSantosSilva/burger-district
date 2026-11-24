import { site } from '@/config/site';
import type { CartItem } from '@/types';
import { money } from './format';

export interface CheckoutData {
  name: string;
  phone: string;
  mode: 'entrega' | 'retirada';
  address: string;
  complement: string;
  payment: 'pix' | 'cartao' | 'dinheiro';
  change: string;
  notes: string;
}

export const paymentLabel = { pix: 'Pix', cartao: 'Cartão na entrega', dinheiro: 'Dinheiro' } as const;

/** Monta a mensagem de pedido no formato pronto para o WhatsApp. */
export function buildOrderMessage(orderId: string, items: CartItem[], data: CheckoutData, totals: { subtotal: number; fee: number; total: number }) {
  const lines: string[] = [];
  lines.push(`*Pedido ${orderId} — ${site.name}*`);
  lines.push('_(pedido de demonstração)_');
  lines.push('');
  items.forEach((it) => {
    lines.push(`*${it.qty}× ${it.name}* — ${money(it.unitPrice * it.qty)}`);
    it.details.forEach((d) => lines.push(`   • ${d}`));
    if (it.notes) lines.push(`   📝 ${it.notes}`);
  });
  lines.push('');
  lines.push(`Subtotal: ${money(totals.subtotal)}`);
  if (data.mode === 'entrega') lines.push(`Entrega: ${totals.fee === 0 ? 'grátis' : money(totals.fee)}`);
  lines.push(`*Total: ${money(totals.total)}*`);
  lines.push('');
  lines.push(`Cliente: ${data.name}`);
  lines.push(`Telefone: ${data.phone}`);
  lines.push(data.mode === 'entrega' ? `Entrega em: ${data.address}${data.complement ? ` (${data.complement})` : ''}` : 'Retirada no balcão');
  lines.push(`Pagamento: ${paymentLabel[data.payment]}${data.payment === 'dinheiro' && data.change ? ` (troco para ${data.change})` : ''}`);
  if (data.notes) lines.push(`Observações: ${data.notes}`);
  return lines.join('\n');
}

export const whatsappLink = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
