import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Banknote, Check, Copy, CreditCard, MessageCircle, QrCode, Store, Truck, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { site } from '@/config/site';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useLockScroll } from '@/hooks/useLockScroll';
import { cx, money } from '@/lib/format';
import { load, save } from '@/lib/storage';
import { buildOrderMessage, paymentLabel, whatsappLink, type CheckoutData } from '@/lib/whatsapp';

const CUSTOMER_KEY = 'bd-customer-v1';
const steps = ['Entrega', 'Pagamento', 'Revisão'];

const empty: CheckoutData = { name: '', phone: '', mode: 'entrega', address: '', complement: '', payment: 'pix', change: '', notes: '' };

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Checkout demonstrativo em 3 etapas. Não processa pagamentos:
 * gera um número de pedido local e a mensagem estruturada para o WhatsApp da loja.
 */
export function Checkout() {
  const { checkoutOpen, setCheckoutOpen } = useUI();
  useLockScroll(checkoutOpen);
  return <AnimatePresence>{checkoutOpen && <Flow onClose={() => setCheckoutOpen(false)} />}</AnimatePresence>;
}

function Flow({ onClose }: { onClose: () => void }) {
  const { items, subtotal, deliveryFee, clear, setOpen } = useCart();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<CheckoutData>(() => ({ ...empty, ...load<Partial<CheckoutData>>(CUSTOMER_KEY, {}), notes: '', change: '' }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ id: string; message: string; total: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const fee = deliveryFee(d.mode);
  const total = subtotal + fee;
  const set = <K extends keyof CheckoutData>(k: K, v: CheckoutData[K]) => {
    setD((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  useEffect(() => {
    box.current?.focus();
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [onClose]);

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (d.name.trim().length < 2) e.name = 'Informe seu nome.';
      if (d.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone com DDD.';
      if (d.mode === 'entrega' && d.address.trim().length < 8) e.address = 'Informe rua, número e bairro.';
    }
    if (s === 1 && d.payment === 'dinheiro' && d.change) {
      const v = parseFloat(d.change.replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
      if (!Number.isFinite(v)) e.change = 'Ex.: 100 ou 100,00';
      else if (v < total) e.change = `O troco precisa ser para um valor acima de ${money(total)}.`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step < 2) setStep(step + 1);
    else confirm();
  };

  const confirm = () => {
    const id = `#BD${Date.now().toString().slice(-6)}`;
    const message = buildOrderMessage(id, items, d, { subtotal, fee, total });
    save(CUSTOMER_KEY, { name: d.name, phone: d.phone, mode: d.mode, address: d.address, complement: d.complement, payment: d.payment });
    setDone({ id, message, total });
    clear();
  };

  const copy = async () => {
    if (!done) return;
    try {
      await navigator.clipboard.writeText(done.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* área de transferência indisponível */
    }
  };

  const eta = useMemo(() => (d.mode === 'entrega' ? `${site.delivery.etaMinutes[0]}–${site.delivery.etaMinutes[1]} min` : '15–20 min'), [d.mode]);

  const err = (k: string) => errors[k] && <p className="mt-1.5 text-sm text-red-300">{errors[k]}</p>;
  const choice = (on: boolean) => cx('flex min-h-[64px] items-center gap-3 rounded-2xl border p-4 text-left transition', on ? 'border-ember bg-ember/10' : 'border-cream/10 hover:border-cream/30');

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center md:items-center md:p-6">
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="co-title"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="relative flex max-h-[94svh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[28px] bg-ink-800 outline-none md:rounded-[30px]"
      >
        <header className="flex items-center justify-between gap-4 border-b border-cream/10 px-6 py-5">
          <div className="flex items-center gap-3">
            {step > 0 && !done && (
              <button type="button" onClick={() => setStep(step - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-cream/15" aria-label="Etapa anterior">
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 id="co-title" className="font-display text-2xl uppercase sm:text-3xl">{done ? 'Pedido gerado' : 'Finalizar pedido'}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 hover:border-ember" aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {!done && (
          <ol className="flex gap-2 px-6 pt-5" aria-label="Etapas">
            {steps.map((s, i) => (
              <li key={s} className="flex-1">
                <div className="h-1 overflow-hidden rounded-full bg-cream/10">
                  <motion.div className="h-full bg-ember" animate={{ width: i <= step ? '100%' : '0%' }} />
                </div>
                <span className={cx('mt-2 block text-xs font-semibold', i === step ? 'text-cream' : 'text-cream/40')} aria-current={i === step ? 'step' : undefined}>{s}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="flex items-center gap-4">
                <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }} className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-emerald-500 text-ink">
                  <Check size={32} strokeWidth={3} />
                </motion.span>
                <div>
                  <p className="font-display text-4xl leading-none">{done.id}</p>
                  <p className="mt-1 text-cream/60">Total {money(done.total)} · previsão {eta}</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-mustard/30 bg-mustard/10 p-4 text-sm text-cream/80">
                <strong className="text-mustard">Simulação de checkout.</strong> Nenhum pagamento foi processado e nenhum pedido real foi feito. Em um site de produção, o botão abaixo envia o pedido para o WhatsApp da loja.
              </div>
              <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-cream/45">Mensagem que será enviada</h3>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-ink p-4 font-sans text-sm leading-relaxed text-cream/85">{done.message}</pre>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="grid gap-5">
                {step === 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" className={choice(d.mode === 'entrega')} onClick={() => set('mode', 'entrega')} aria-pressed={d.mode === 'entrega'}>
                        <Truck className="shrink-0 text-ember" />
                        <span><span className="block font-semibold">Entrega</span><span className="block text-xs text-cream/50">{site.delivery.etaMinutes[0]}–{site.delivery.etaMinutes[1]} min</span></span>
                      </button>
                      <button type="button" className={choice(d.mode === 'retirada')} onClick={() => set('mode', 'retirada')} aria-pressed={d.mode === 'retirada'}>
                        <Store className="shrink-0 text-ember" />
                        <span><span className="block font-semibold">Retirada</span><span className="block text-xs text-cream/50">Sem taxa</span></span>
                      </button>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="co-name" className="label">Nome</label>
                        <input id="co-name" autoComplete="name" value={d.name} onChange={(e) => set('name', e.target.value)} className={cx('field', errors.name && '!border-red-400')} />
                        {err('name')}
                      </div>
                      <div>
                        <label htmlFor="co-phone" className="label">Telefone / WhatsApp</label>
                        <input id="co-phone" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} placeholder="(11) 90000-0000" className={cx('field', errors.phone && '!border-red-400')} />
                        {err('phone')}
                      </div>
                    </div>
                    {d.mode === 'entrega' ? (
                      <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
                        <div>
                          <label htmlFor="co-address" className="label">Endereço</label>
                          <input id="co-address" autoComplete="street-address" value={d.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua, número, bairro" className={cx('field', errors.address && '!border-red-400')} />
                          {err('address')}
                        </div>
                        <div>
                          <label htmlFor="co-comp" className="label">Complemento</label>
                          <input id="co-comp" value={d.complement} onChange={(e) => set('complement', e.target.value)} placeholder="Apto, bloco…" className="field" />
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-2xl bg-cream/5 p-4 text-sm text-cream/70">Retire no balcão: {site.address.street}, {site.address.district}.</p>
                    )}
                  </>
                )}

                {step === 1 && (
                  <>
                    <p className="text-sm text-cream/60">O pagamento é combinado na entrega ou retirada. Nada é cobrado neste site.</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {([
                        ['pix', QrCode],
                        ['cartao', CreditCard],
                        ['dinheiro', Banknote],
                      ] as const).map(([k, Icon]) => (
                        <button key={k} type="button" className={choice(d.payment === k)} onClick={() => set('payment', k)} aria-pressed={d.payment === k}>
                          <Icon className="shrink-0 text-ember" />
                          <span className="font-semibold">{paymentLabel[k]}</span>
                        </button>
                      ))}
                    </div>
                    {d.payment === 'dinheiro' && (
                      <div>
                        <label htmlFor="co-change" className="label">Troco para quanto? (opcional)</label>
                        <input id="co-change" inputMode="decimal" value={d.change} onChange={(e) => set('change', e.target.value)} placeholder="Ex.: 100,00" className={cx('field', errors.change && '!border-red-400')} />
                        {err('change')}
                      </div>
                    )}
                    <div>
                      <label htmlFor="co-notes" className="label">Observações do pedido (opcional)</label>
                      <textarea id="co-notes" rows={3} value={d.notes} onChange={(e) => set('notes', e.target.value.slice(0, 200))} placeholder="Ex.: interfone quebrado, ligar ao chegar" className="field resize-none" />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <ul className="divide-y divide-cream/10 rounded-2xl bg-ink p-4">
                      {items.map((it) => (
                        <li key={it.key} className="flex justify-between gap-4 py-2.5 text-sm">
                          <span className="min-w-0">
                            <span className="font-semibold">{it.qty}× {it.name}</span>
                            {it.details.length > 0 && <span className="block text-cream/50">{it.details.join(' · ')}</span>}
                            {it.notes && <span className="block italic text-mustard/90">“{it.notes}”</span>}
                          </span>
                          <span className="whitespace-nowrap tabular-nums">{money(it.unitPrice * it.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <dl className="grid gap-1.5 text-sm">
                      <div className="flex justify-between text-cream/70"><dt>Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
                      <div className="flex justify-between text-cream/70"><dt>{d.mode === 'entrega' ? 'Entrega' : 'Retirada'}</dt><dd className="tabular-nums">{fee === 0 ? 'Grátis' : money(fee)}</dd></div>
                      <div className="mt-2 flex justify-between border-t border-cream/10 pt-3 font-display text-2xl"><dt>Total</dt><dd className="text-ember">{money(total)}</dd></div>
                    </dl>
                    <p className="text-sm text-cream/60">
                      {d.name} · {d.phone} · {d.mode === 'entrega' ? d.address : 'Retirada no balcão'} · {paymentLabel[d.payment]}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <footer className="safe-bottom border-t border-cream/10 px-6 pt-4 md:pb-6">
          {done ? (
            <div className="flex flex-wrap gap-3">
              <a href={whatsappLink(done.message)} target="_blank" rel="noreferrer" className="btn-primary btn-shine flex-1">
                <MessageCircle size={18} /> Enviar pelo WhatsApp
              </a>
              <button type="button" onClick={copy} className="btn-ghost">
                {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button type="button" onClick={() => { onClose(); setOpen(false); }} className="btn w-full text-cream/60 hover:text-cream sm:w-auto">
                Voltar ao site
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="pb-2 text-center text-cream/60">Seu carrinho está vazio.</p>
          ) : (
            <button type="button" onClick={next} className="btn-primary btn-shine w-full justify-between">
              {step < 2 ? 'Continuar' : 'Confirmar pedido'}
              <span className="font-display text-lg tracking-normal">{money(total)}</span>
            </button>
          )}
        </footer>
      </motion.div>
    </div>
  );
}
