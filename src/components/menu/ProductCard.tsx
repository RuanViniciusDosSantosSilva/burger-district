import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Plus, Users } from 'lucide-react';
import { useRef } from 'react';
import { ProductBadges } from '@/components/ui/Badge';
import { ProductImage } from '@/components/ui/ProductImage';
import { categoryById } from '@/data/products';
import { useUI } from '@/context/UIContext';
import { useQuickAdd } from '@/hooks/useAddToCart';
import { money } from '@/lib/format';
import type { Product } from '@/types';

/** Card de produto com inclinação 3D pelo cursor, imagem grande e adição rápida. */
export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const cat = categoryById(p.category);
  const { openProduct } = useUI();
  const quickAdd = useQuickAdd();
  const ref = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const glareX = useTransform(ry, [-8, 8], ['0%', '100%']);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      data-cursor="Ver"
      className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-cream/10 bg-ink-800 transition-shadow duration-500 hover:shadow-deep"
    >
      <button type="button" onClick={() => openProduct(p)} className="absolute inset-0 z-[1] rounded-[26px]" aria-label={`Ver detalhes de ${p.name}`} />
      <div className="relative aspect-[5/4] overflow-hidden" style={{ backgroundColor: cat.bg }}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(255,255,255,.22),transparent_60%)]" />
        <span aria-hidden className="absolute -bottom-6 left-3 select-none font-display text-[110px] uppercase leading-none opacity-[0.12]" style={{ color: cat.fg }}>
          {p.name.split(' ')[0]}
        </span>
        <div ref={imgRef} className="absolute inset-[6%] transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-[1.07] group-hover:-rotate-2">
          <ProductImage src={p.image} alt={p.name} className="h-full w-full drop-shadow-[0_24px_24px_rgba(0,0,0,.45)]" />
        </div>
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: useTransform(glareX, (x) => `radial-gradient(circle at ${x} 0%, rgba(255,255,255,.25), transparent 50%)`) }} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <ProductBadges p={p} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[26px] uppercase leading-none">{p.name}</h3>
        <p className="mt-2 line-clamp-2 text-[14.5px] leading-snug text-cream/60">{p.tagline} {p.ingredients.slice(0, 3).join(', ')}.</p>
        {p.serves && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cream/50">
            <Users size={14} /> Serve {p.serves}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <span className="whitespace-nowrap font-display text-[28px] leading-none text-ember">{money(p.price)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              quickAdd(p, imgRef.current);
            }}
            className="relative z-[2] grid h-12 w-12 place-items-center rounded-full bg-cream text-ink transition-all duration-300 hover:rotate-90 hover:bg-ember active:scale-90"
            aria-label={`Adicionar ${p.name} ao pedido`}
          >
            <Plus size={22} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
