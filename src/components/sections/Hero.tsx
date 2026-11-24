import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, Clock, Flame, Wheat } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { HeroBurger3D, type HeroControl } from '@/components/three/HeroBurger3D';
import { Magnetic } from '@/components/ui/Magnetic';
import { SplitWords } from '@/components/ui/SplitWords';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { INTRO_DELAY } from '@/config/site';

/** Elementos gráficos flutuantes com profundidades diferentes (parallax pelo mouse). */
function Floaters() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, [mx, my]);
  const layer = (depth: number) => ({ x: useTransform(sx, (v) => v * depth), y: useTransform(sy, (v) => v * depth) });
  const near = layer(-60);
  const mid = layer(-30);
  const far = layer(18);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
      {/* sementes de gergelim */}
      <motion.div style={near} className="absolute left-[8%] top-[22%] hidden md:block">
        <svg width="28" height="14" viewBox="0 0 28 14" className="animate-floaty"><ellipse cx="14" cy="7" rx="13" ry="6" fill="#f3e9d8" transform="rotate(-20 14 7)" /></svg>
      </motion.div>
      <motion.div style={mid} className="absolute right-[6%] top-[18%]">
        <svg width="22" height="11" viewBox="0 0 28 14" className="animate-floaty [animation-delay:-2s]"><ellipse cx="14" cy="7" rx="13" ry="6" fill="#f3e9d8" transform="rotate(30 14 7)" /></svg>
      </motion.div>
      <motion.div style={near} className="absolute bottom-[26%] right-[44%] hidden lg:block">
        <svg width="18" height="9" viewBox="0 0 28 14" className="animate-floaty [animation-delay:-4s]"><ellipse cx="14" cy="7" rx="13" ry="6" fill="#f2b33d" /></svg>
      </motion.div>
      {/* pimenta */}
      <motion.div style={far} className="absolute right-[12%] bottom-[18%] hidden md:block">
        <svg width="64" height="64" viewBox="0 0 64 64" className="animate-floaty [animation-delay:-1s]">
          <path d="M14 46c10 4 30-2 38-20 2-5-3-8-6-4-8 11-18 16-30 17-5 1-6 5-2 7z" fill="#c22a12" />
          <path d="M48 20c1-5 4-8 8-9" stroke="#3f8a26" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </motion.div>
      {/* folha */}
      <motion.div style={mid} className="absolute left-[44%] top-[14%] hidden lg:block">
        <svg width="54" height="54" viewBox="0 0 54 54" className="animate-floaty [animation-delay:-3s]">
          <path d="M6 48C8 22 24 6 48 6c0 24-16 40-42 42z" fill="#4c9a26" />
          <path d="M8 46 44 10" stroke="#c4df72" strokeWidth="2" />
        </svg>
      </motion.div>
      {/* selo giratório */}
      <motion.div style={mid} className="absolute right-[4%] top-[58%] hidden sm:block lg:right-[40%] lg:top-[68%]">
        <svg viewBox="0 0 120 120" className="h-24 w-24 animate-spinslow lg:h-28 lg:w-28">
          <defs>
            <path id="circ" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
          </defs>
          <circle cx="60" cy="60" r="58" fill="#e2561b" />
          <text fontFamily="Anton, Impact, sans-serif" fontSize="13.5" letterSpacing="3.2" fill="#0b0907">
            <textPath href="#circ">FEITO NA CHAPA • DESDE 2019 • SP •</textPath>
          </text>
          <path d="M44 62c0-9 7-14 16-14s16 5 16 14z" fill="#0b0907" />
          <rect x="43" y="64" width="34" height="4" rx="2" fill="#0b0907" />
          <path d="M44 71h32c0 4-3 6-7 6H51c-4 0-7-2-7-6z" fill="#0b0907" />
        </svg>
      </motion.div>
    </div>
  );
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const bgWord = useRef<HTMLDivElement>(null);
  const control = useRef<HeroControl>({ progress: 0 });
  const reduced = useReducedMotion();
  const { count, setOpen } = useCart();
  const { toast } = useUI();

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (s) => (control.current.progress = s.progress),
      });
      if (!reduced) {
        gsap.to(textRef.current, { yPercent: -18, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to(bgWord.current, { xPercent: -22, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true } });
      }
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  const order = () => {
    if (count > 0) setOpen(true);
    else {
      document.getElementById('cardapio')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      toast({ title: 'Seu pedido começa aqui', text: 'Escolha um item no cardápio e toque em “Adicionar”.' });
    }
  };

  return (
    <section ref={section} id="inicio" className="grain relative isolate min-h-[100svh] overflow-hidden bg-ink pt-[72px]" aria-label="Apresentação">
      {/* brilho de brasa */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute right-[-10%] top-[10%] h-[70vmin] w-[70vmin] rounded-full bg-ember/35 blur-[120px] lg:right-[8%]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[50vmin] w-[50vmin] rounded-full bg-ember-700/30 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0b0907_100%)]" />
      </div>
      {/* palavra gigante ao fundo */}
      <div ref={bgWord} aria-hidden className="pointer-events-none absolute inset-x-0 top-[46%] -z-[5] select-none whitespace-nowrap font-display text-[34vw] uppercase leading-none text-cream/[0.035] lg:top-[30%] lg:text-[26vw]">
        District District
      </div>

      <Floaters />

      <div className="wrap relative grid min-h-[calc(100svh-72px)] grid-rows-[auto_minmax(300px,1fr)_auto] items-center gap-2 pb-10 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-1 lg:gap-0 lg:pb-16">
        {/* título */}
        <div ref={textRef} className="relative z-[3] pt-6 lg:row-start-1 lg:pt-0">
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + INTRO_DELAY, duration: 0.8 }} className="eyebrow mb-5">
            Smash &amp; artesanal · Vila Madalena
          </motion.p>
          <h1 className="display text-[clamp(2.9rem,7.4vw,7.2rem)] !leading-[1.1]">
            <SplitWords text="Não é só um" inView={false} delay={0.35 + INTRO_DELAY} className="block" />
            <SplitWords text="hambúrguer." inView={false} delay={0.5 + INTRO_DELAY} className="block" />
            <SplitWords text="É outro nível." inView={false} delay={0.75 + INTRO_DELAY} className="block text-ember" />
          </h1>

          <div className="hidden lg:block">
            <HeroCopy onOrder={order} />
          </div>
        </div>

        {/* hambúrguer 3D */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.15 + INTRO_DELAY, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-[2] h-full min-h-[300px] w-full lg:absolute lg:inset-y-0 lg:right-[-4%] lg:w-[62%]"
        >
          <HeroBurger3D control={control} reduced={reduced} />
        </motion.div>

        <div className="relative z-[3] lg:hidden">
          <HeroCopy onOrder={order} />
        </div>
      </div>

      <a href="#historia" className="absolute bottom-6 left-1/2 z-[3] hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold text-cream/50 transition hover:text-cream md:flex" aria-label="Rolar para a próxima seção">
        Role para descobrir
        <ArrowDown size={16} className="animate-bounce" />
      </a>
    </section>
  );
}

function HeroCopy({ onOrder }: { onOrder: () => void }) {
  return (
    <>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 + INTRO_DELAY, duration: 0.8 }} className="mt-6 max-w-[30rem] text-[17px] leading-relaxed text-cream/70">
        Blend moído todo dia, brioche de fermentação lenta e uma chapa de ferro a 280&nbsp;°C. Burgers feitos na hora para quem leva sabor a sério.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + INTRO_DELAY, duration: 0.8 }} className="mt-8 flex flex-wrap gap-3">
        <Magnetic>
          <a href="#cardapio" className="btn-primary btn-shine group">
            Explorar cardápio
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </Magnetic>
        <Magnetic>
          <button type="button" onClick={onOrder} className="btn-ghost">
            Fazer meu pedido
          </button>
        </Magnetic>
      </motion.div>
      <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 + INTRO_DELAY, duration: 1 }} className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-cream/60">
        <li className="flex items-center gap-2"><Flame size={16} className="text-ember" /> Chapa a 280 °C</li>
        <li className="flex items-center gap-2"><Wheat size={16} className="text-ember" /> Brioche da casa</li>
        <li className="flex items-center gap-2"><Clock size={16} className="text-ember" /> Pronto em ~12 min</li>
      </motion.ul>
    </>
  );
}
