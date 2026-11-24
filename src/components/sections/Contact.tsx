import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Instagram, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { SplitWords } from '@/components/ui/SplitWords';
import { site } from '@/config/site';
import { cx } from '@/lib/format';
import { whatsappLink } from '@/lib/whatsapp';

type Form = { name: string; contact: string; subject: string; message: string };
const subjects = ['Dúvida sobre pedido', 'Eventos e encomendas', 'Elogio ou sugestão', 'Trabalhe conosco'];

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().length < 2) e.name = 'Informe seu nome.';
  const digits = f.contact.replace(/\D/g, '');
  const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.contact.trim());
  if (!isMail && digits.length < 10) e.contact = 'Informe um e-mail válido ou telefone com DDD.';
  if (f.message.trim().length < 10) e.message = 'Escreva pelo menos 10 caracteres.';
  return e;
}

/** Contato: formulário validado que gera a mensagem pronta para o WhatsApp (sem backend). */
export function Contact() {
  const [f, setF] = useState<Form>({ name: '', contact: '', subject: subjects[0], message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate(f);
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(`ct-${Object.keys(er)[0]}`)?.focus();
      return;
    }
    setSent(`Olá, ${site.name}! Sou ${f.name.trim()} (${f.contact.trim()}).\nAssunto: ${f.subject}\n\n${f.message.trim()}`);
  };

  const copy = async () => {
    if (!sent) return;
    try {
      await navigator.clipboard.writeText(sent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const field = (k: keyof Form) => ({
    id: `ct-${k}`,
    value: f[k],
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `ct-${k}-err` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setF((x) => ({ ...x, [k]: e.target.value }));
      if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
    },
  });
  const err = (k: keyof Form) => errors[k] && <p id={`ct-${k}-err`} className="mt-1.5 text-sm text-red-300">{errors[k]}</p>;

  const channels = [
    { icon: MessageCircle, label: 'WhatsApp', value: site.whatsappDisplay, href: `https://wa.me/${site.whatsapp}` },
    { icon: Phone, label: 'Telefone', value: site.phoneDisplay, href: site.phoneHref },
    { icon: Instagram, label: 'Instagram', value: site.instagram, href: site.instagramUrl },
    { icon: Mail, label: 'E-mail', value: site.email, href: `mailto:${site.email}` },
  ];

  return (
    <section id="contato" className="relative overflow-hidden bg-ink py-24 md:py-32" aria-labelledby="ct-title">
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 h-[60vmin] w-[60vmin] rounded-full bg-ember/15 blur-[130px]" />
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-5">Contato</p>
          <h2 id="ct-title" className="display text-[clamp(3rem,7vw,6.4rem)]">
            <SplitWords text="Bora" className="block" />
            <SplitWords text="conversar?" className="block text-ember" delay={0.15} />
          </h2>
          <p className="mt-6 max-w-[28rem] text-cream/60">Eventos, encomendas para a firma, sugestões ou aquele elogio para a cozinha. A gente responde rápido.</p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {channels.map((c) => (
              <li key={c.label}>
                <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-2xl border border-cream/10 p-4 transition hover:border-ember hover:bg-ember/5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cream/5 text-ember transition group-hover:bg-ember group-hover:text-ink">
                    <c.icon size={20} />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-xs font-semibold text-cream/50">{c.label}</span>
                    <span className="block truncate font-semibold">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-cream/40">Contatos demonstrativos.</p>
        </div>

        <div className="relative rounded-[30px] border border-cream/10 bg-ink-800 p-6 sm:p-9">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex h-full flex-col">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-ink">
                  <Check size={28} strokeWidth={3} />
                </span>
                <h3 className="display mt-6 text-4xl">Mensagem pronta!</h3>
                <p className="mt-2 text-cream/60">Este site é uma demonstração e não possui servidor de e-mail. Sua mensagem foi preparada para envio pelo WhatsApp:</p>
                <pre className="mt-5 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl bg-ink p-4 font-sans text-sm text-cream/80">{sent}</pre>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={whatsappLink(sent)} target="_blank" rel="noreferrer" className="btn-primary btn-shine">
                    <MessageCircle size={18} /> Abrir no WhatsApp
                  </a>
                  <button type="button" onClick={copy} className="btn-ghost">
                    {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copiado' : 'Copiar texto'}
                  </button>
                  <button type="button" onClick={() => { setSent(null); setF({ name: '', contact: '', subject: subjects[0], message: '' }); }} className="btn text-cream/60 hover:text-cream">
                    Nova mensagem
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} onSubmit={submit} noValidate className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ct-name" className="label">Nome</label>
                    <input {...field('name')} autoComplete="name" className={cx('field', errors.name && '!border-red-400')} placeholder="Seu nome" />
                    {err('name')}
                  </div>
                  <div>
                    <label htmlFor="ct-contact" className="label">E-mail ou WhatsApp</label>
                    <input {...field('contact')} autoComplete="email" className={cx('field', errors.contact && '!border-red-400')} placeholder="voce@email.com" />
                    {err('contact')}
                  </div>
                </div>
                <div>
                  <label htmlFor="ct-subject" className="label">Assunto</label>
                  <select {...field('subject')} className="field appearance-none">
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ct-message" className="label">Mensagem</label>
                  <textarea {...field('message')} rows={5} className={cx('field resize-none', errors.message && '!border-red-400')} placeholder="Conta pra gente…" />
                  {err('message')}
                </div>
                <button type="submit" className="btn-primary btn-shine group w-full sm:w-auto sm:justify-self-start">
                  Enviar mensagem <Send size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
