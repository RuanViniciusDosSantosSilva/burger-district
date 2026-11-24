import { motion } from 'framer-motion';
import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { SplitWords } from '@/components/ui/SplitWords';
import { site } from '@/config/site';
import { cx } from '@/lib/format';
import { openStatus, todayIndex } from '@/lib/hours';

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`;

/** Mapa ilustrado do bairro (substituível por um iframe real via site.mapEmbedUrl). */
function IllustratedMap() {
  return (
    <svg viewBox="0 0 800 560" className="h-full w-full" role="img" aria-label={`Mapa ilustrativo: ${site.address.street}, ${site.address.district}`}>
      <rect width="800" height="560" fill="#14100c" />
      {/* quarteirões */}
      {Array.from({ length: 8 }).map((_, r) =>
        Array.from({ length: 10 }).map((__, c) => (
          <rect key={`${r}-${c}`} x={c * 84 - 20 + (r % 2) * 18} y={r * 74 - 10} width="66" height="56" rx="6" fill="#1d1712" />
        )),
      )}
      {/* parque */}
      <path d="M520 60h190v150H560z" fill="#1f2a16" />
      <text x="600" y="140" fill="#4c6a2e" fontFamily="Archivo" fontSize="14" fontWeight="700">Praça</text>
      {/* avenidas */}
      <path d="M-10 300 C 200 270, 420 340, 820 250" stroke="#3a2a1d" strokeWidth="26" fill="none" />
      <path d="M300 -10 C 330 200, 260 380, 330 570" stroke="#3a2a1d" strokeWidth="20" fill="none" />
      <path d="M-10 300 C 200 270, 420 340, 820 250" stroke="#5a4330" strokeWidth="2" strokeDasharray="10 12" fill="none" />
      <text x="40" y="276" fill="#7a6650" fontFamily="Archivo" fontSize="13" fontWeight="700">Rua das Brasas</text>
      <text x="345" y="80" fill="#7a6650" fontFamily="Archivo" fontSize="13" fontWeight="700" transform="rotate(82 345 80)">Travessa do Carvão</text>
      {/* rota tracejada */}
      <path d="M120 500 C 160 420, 220 380, 300 360 S 380 320, 392 300" stroke="#e2561b" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 12" fill="none">
        <animate attributeName="stroke-dashoffset" values="56;0" dur="1.6s" repeatCount="indefinite" />
      </path>
      <circle cx="120" cy="500" r="7" fill="#f3e9d8" />
      {/* pino */}
      <g transform="translate(392 300)">
        <circle r="40" fill="#e2561b" opacity=".18">
          <animate attributeName="r" values="20;56;20" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".35;0;.35" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <path d="M0 0c-18-22-30-34-30-52a30 30 0 0 1 60 0c0 18-12 30-30 52z" fill="#e2561b" />
        <circle cy="-52" r="12" fill="#0b0907" />
      </g>
      <g transform="translate(430 230)">
        <rect width="170" height="44" rx="12" fill="#f3e9d8" />
        <text x="16" y="28" fill="#0b0907" fontFamily="Anton, Impact" fontSize="20">BURGER DISTRICT</text>
      </g>
    </svg>
  );
}

export function Location() {
  const today = todayIndex();
  const status = openStatus();
  const order = [2, 3, 4, 5, 6, 0, 1];
  return (
    <section id="localizacao" className="relative bg-ink-900 py-24 md:py-32" aria-labelledby="loc-title">
      <div className="wrap">
        <p className="eyebrow mb-5">Localização</p>
        <h2 id="loc-title" className="display text-[clamp(3rem,8vw,7rem)]">
          <SplitWords text="Vem pro" className="block" />
          <SplitWords text="distrito." className="block text-ember" delay={0.15} />
        </h2>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="relative aspect-[10/7] overflow-hidden rounded-[30px] border border-cream/10 lg:aspect-auto lg:min-h-[480px]">
            {site.mapEmbedUrl ? (
              <iframe title="Mapa" src={site.mapEmbedUrl} className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div className="absolute inset-0 [&_svg]:object-cover">
                <IllustratedMap />
              </div>
            )}
            <span className="absolute bottom-4 left-4 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-cream/60 backdrop-blur">Mapa ilustrativo · endereço fictício</span>
          </motion.div>

          <div className="grid gap-5">
            <div className="rounded-[30px] bg-cream p-7 text-ink">
              <MapPin className="text-ember-600" />
              <p className="mt-4 font-display text-3xl uppercase leading-none">{site.address.street}</p>
              <p className="mt-2 text-ink/70">
                {site.address.district} · {site.address.city}/{site.address.state} · CEP {site.address.zip}
                <br />
                {site.address.reference}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-dark btn-shine">
                  <Navigation size={17} /> Como chegar
                </a>
                <a href={site.phoneHref} className="btn border-2 border-ink/80 text-ink hover:bg-ink hover:text-cream">
                  <Phone size={17} /> {site.phoneDisplay}
                </a>
              </div>
            </div>

            <div className="rounded-[30px] border border-cream/10 bg-ink-800 p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 font-display text-2xl uppercase">
                  <Clock size={20} className="text-ember" /> Horários
                </p>
                <span className={cx('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold', status.open ? 'bg-emerald-500/15 text-emerald-300' : 'bg-cream/10 text-cream/70')}>
                  <span className={cx('h-2 w-2 rounded-full', status.open ? 'animate-pulse bg-emerald-400' : 'bg-cream/40')} />
                  {status.label}
                </span>
              </div>
              <table className="mt-5 w-full text-[15px]">
                <caption className="sr-only">Horário de funcionamento</caption>
                <tbody>
                  {order.map((d) => {
                    const h = site.hours.find((x) => x.day === d)!;
                    return (
                      <tr key={d} className={cx('border-b border-cream/5 last:border-0', d === today && 'text-ember')}>
                        <th scope="row" className="py-2 text-left font-semibold">
                          {h.label} {d === today && <span className="ml-1 text-xs">(hoje)</span>}
                        </th>
                        <td className="py-2 text-right tabular-nums text-cream/75">{h.open ? `${h.open} – ${h.close}` : 'Fechado'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
