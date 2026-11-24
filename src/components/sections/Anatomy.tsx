import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { isMobile, useStage } from '@/components/three/useStage';
import { ProductImage } from '@/components/ui/ProductImage';
import { anatomy } from '@/data/content';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BurgerModel } from '@/three/burger';
import { anatomyLayers } from '@/three/signature';

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** Curva de explosão ao longo do scroll: monta → explode → segura → remonta. */
function explodeAt(p: number) {
  if (p < 0.08) return 0;
  if (p < 0.4) return smooth((p - 0.08) / 0.32);
  if (p < 0.66) return 1;
  if (p < 0.92) return 1 - smooth((p - 0.66) / 0.26);
  return 0;
}

const phases = [
  { at: 0, title: 'Anatomia de um', accent: 'District Prime', text: 'Role a página e veja cada camada se separar.' },
  { at: 0.3, title: 'Oito camadas,', accent: 'nenhuma por acaso', text: 'Cada ingrediente tem função: estrutura, suculência, frescor ou crocância.' },
  { at: 0.7, title: 'Tudo volta', accent: 'para o lugar', text: 'Montado na ordem certa para o molho não encharcar o pão.' },
  { at: 0.93, title: 'Pronto.', accent: 'Agora é com você.', text: 'Monte o seu, camada por camada, no personalizador.' },
];

/**
 * Seção pinada com vista explodida 3D guiada pelo scroll.
 * Os rótulos HTML acompanham a posição projetada de cada camada.
 */
export function Anatomy() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const lines = useRef<(SVGLineElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [phase, setPhase] = useState(0);
  const reduced = useReducedMotion();

  const { failed } = useStage(canvas, { maxPixelRatio: isMobile() ? 1.4 : 1.75, fov: 26 }, (stage) => {
    const burger = new BurgerModel(anatomyLayers, 8);
    burger.gap = 0.78;
    const pivot = new THREE.Group();
    pivot.add(burger.group);
    stage.root.add(pivot);
    const v = new THREE.Vector3();
    let cam = 10;

    stage.onFrame = () => {
      const p = progress.current;
      const e = explodeAt(p);
      const mobile = (canvas.current?.clientWidth ?? 1000) < 700;
      burger.explode = e;
      burger.update();
      pivot.rotation.y = 0.5 + p * Math.PI * 1.3;
      pivot.rotation.x = 0.12 + e * 0.1;
      pivot.position.x = mobile ? -0.55 * (0.4 + e * 0.6) : 0.35;
      stage.setGround(-burger.height / 2 - (burger.layers.length - 1) * burger.gap * e * 0.5 - 0.05, 3.2 + e);
      const target = mobile ? 11.5 + e * 14 : 10 + e * 11.5;
      cam += (target - cam) * 0.12;
      stage.camera.position.set(0, 1.4 + e * 0.6, cam);
      stage.camera.lookAt(0, -0.25 * e, 0);
      stage.camera.updateMatrixWorld();
      pivot.updateMatrixWorld(true);

      const W = canvas.current?.clientWidth ?? 0;
      burger.layers.forEach((_, i) => {
        const el = labels.current[i];
        const ln = lines.current[i];
        if (!el || !ln) return;
        const pt = stage.project(burger.layerWorldCenter(i, v));
        const colX = mobile ? W - 12 : W / 2 + Math.min(300, W * 0.22) + (i % 2) * 40;
        const op = clamp((e - 0.25 - (i % 4) * 0.04) * 2.4);
        el.style.opacity = String(op);
        el.style.transform = `translate(${mobile ? colX - el.offsetWidth : colX}px, ${pt.y - el.offsetHeight / 2}px)`;
        const lx = mobile ? colX - el.offsetWidth - 8 : colX - 10;
        ln.setAttribute('x1', String(pt.x));
        ln.setAttribute('y1', String(pt.y));
        ln.setAttribute('x2', String(lx));
        ln.setAttribute('y2', String(pt.y));
        ln.style.opacity = String(op * 0.8);
      });
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (headRef.current) headRef.current.style.opacity = mobile ? String(Math.max(0, 1 - e * 1.6)) : '1';
    };
    return () => burger.dispose();
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * (reduced ? 1.6 : 2.8)}`,
        pin: pin.current,
        scrub: reduced ? true : 0.6,
        onUpdate: (s) => {
          progress.current = s.progress;
          let ph = 0;
          phases.forEach((x, i) => s.progress >= x.at && (ph = i));
          setPhase((cur) => (cur === ph ? cur : ph));
        },
      });
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  const P = phases[phase];

  return (
    <section ref={section} id="anatomia" className="relative bg-ink" aria-labelledby="anatomia-title">
      <div ref={pin} className="relative h-[100svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(226,86,27,.28)_0%,rgba(11,9,7,0)_60%)]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(243,233,216,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(243,233,216,.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

        <div className="absolute inset-0">
          {failed ? (
            <ProductImage src="renders/anatomy.webp" alt="District Prime: brioche, maionese de ervas, alface, tomate, blend angus, queijo prato e cebola roxa" className="mx-auto h-full max-w-[680px]" />
          ) : (
            <canvas ref={canvas} className="h-full w-full" role="img" aria-label="Vista explodida 3D do District Prime, com as camadas se separando conforme a rolagem" />
          )}
          {!failed && (
            <>
              <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
                {anatomyLayers.map((_, i) => (
                  <line key={i} ref={(el) => (lines.current[i] = el)} stroke="#e2561b" strokeWidth="1.2" strokeDasharray="3 4" style={{ opacity: 0 }} />
                ))}
              </svg>
              <div className="pointer-events-none absolute inset-0">
                {anatomyLayers.map((l, i) => {
                  const info = anatomy[l.type];
                  return (
                    <div key={i} ref={(el) => (labels.current[i] = el)} className="absolute left-0 top-0 max-w-[150px] opacity-0 will-change-transform sm:max-w-[240px]">
                      <span className="flex items-center gap-2 font-display text-[15px] uppercase leading-tight text-cream sm:text-xl">
                        <span className="hidden h-2 w-2 shrink-0 rounded-full bg-ember sm:inline-block" />
                        {info.name}
                      </span>
                      <span className="mt-0.5 hidden text-[13px] leading-snug text-cream/55 sm:block">{info.note}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* texto narrativo */}
        <div className="wrap pointer-events-none relative flex h-full flex-col justify-between pb-8 pt-[96px]">
          <div ref={headRef}>
          <div key={phase} className="max-w-[440px] animate-[fadeUp_.7s_ease_both]">
            <p className="eyebrow mb-4">A anatomia</p>
            <h2 id="anatomia-title" className="display text-[clamp(2.2rem,4.4vw,4rem)]">
              {P.title} <span className="block text-ember">{P.accent}</span>
            </h2>
            <p className="mt-4 max-w-[28rem] text-cream/65">{P.text}</p>
          </div>
          </div>
          <div className="flex items-end justify-between gap-6">
            <div className="w-full max-w-[280px]">
              <div className="mb-2 flex justify-between text-xs font-semibold text-cream/50">
                <span>Montado</span>
                <span>Explodido</span>
                <span>Montado</span>
              </div>
              <div className="h-[3px] overflow-hidden rounded-full bg-cream/10">
                <div ref={bar} className="h-full origin-left scale-x-0 bg-ember" />
              </div>
            </div>
            <a href="#monte" className={`btn-primary pointer-events-auto transition-all duration-500 ${phase === 3 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`} tabIndex={phase === 3 ? 0 : -1}>
              Montar o meu <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
