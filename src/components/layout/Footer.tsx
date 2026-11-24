import { ArrowUp, Instagram, Mail, MessageCircle, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { nav, site } from '@/config/site';
import { categories } from '@/data/products';
import { Marquee } from '@/components/sections/Marquee';

export function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const open = site.hours.filter((h) => h.open);
  return (
    <footer className="relative overflow-hidden bg-ink-900 pt-0">
      <Marquee tone="cream" reverse />
      <div className="wrap pt-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-[28ch] text-cream/60">Hamburgueria urbana de smash e artesanais. Blend moído no dia, pão da casa e chapa quente desde {site.founded}.</p>
            <div className="mt-6 flex gap-2">
              {[
                { icon: Instagram, href: site.instagramUrl, label: 'Instagram' },
                { icon: MessageCircle, href: `https://wa.me/${site.whatsapp}`, label: 'WhatsApp' },
                { icon: Mail, href: `mailto:${site.email}`, label: 'E-mail' },
                { icon: Phone, href: site.phoneHref, label: 'Telefone' },
              ].map((s) => (
                <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={s.label} className="grid h-11 w-11 place-items-center rounded-full border border-cream/15 transition hover:-translate-y-1 hover:border-ember hover:bg-ember hover:text-ink">
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <nav aria-label="Rodapé">
            <h3 className="font-display text-lg uppercase text-ember">Navegação</h3>
            <ul className="mt-4 grid gap-2 text-cream/70">
              {nav.slice(0, 6).map((n) => (
                <li key={n.id}><a href={`#${n.id}`} className="transition hover:text-cream">{n.label}</a></li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="font-display text-lg uppercase text-ember">Cardápio</h3>
            <ul className="mt-4 grid gap-2 text-cream/70">
              {categories.map((c) => (
                <li key={c.id}><a href="#cardapio" className="transition hover:text-cream">{c.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg uppercase text-ember">Horários</h3>
            <ul className="mt-4 grid gap-1.5 text-sm text-cream/70">
              {open.map((h) => (
                <li key={h.day} className="flex justify-between gap-4"><span>{h.label}</span><span className="tabular-nums">{h.open}–{h.close}</span></li>
              ))}
              <li className="flex justify-between gap-4 text-cream/40"><span>Segunda</span><span>Fechado</span></li>
            </ul>
            <p className="mt-4 text-sm text-cream/60">{site.address.street} · {site.address.district}<br />{site.phoneDisplay}</p>
          </div>
        </div>

        <p aria-hidden className="mt-20 select-none whitespace-nowrap text-center font-display text-[17.5vw] uppercase leading-[0.8] text-cream/[0.06]">Burger District</p>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-cream/10 py-8 text-sm text-cream/45 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {site.name}. Todos os direitos reservados. {site.demoNotice}</p>
          <button type="button" onClick={toTop} className="group inline-flex min-h-[44px] items-center gap-2 font-semibold text-cream transition hover:text-ember">
            Voltar ao topo
            <span className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 transition group-hover:-translate-y-1 group-hover:border-ember">
              <ArrowUp size={17} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
