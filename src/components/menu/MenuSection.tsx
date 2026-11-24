import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownWideNarrow, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SplitWords } from '@/components/ui/SplitWords';
import { categories, products } from '@/data/products';
import { cx, normalize } from '@/lib/format';
import type { CategoryId, Product } from '@/types';
import { ProductCard } from './ProductCard';

type Sort = 'relevancia' | 'populares' | 'menor' | 'maior' | 'az';
const sorts: { id: Sort; label: string }[] = [
  { id: 'relevancia', label: 'Ordem da casa' },
  { id: 'populares', label: 'Mais pedidos' },
  { id: 'menor', label: 'Menor preço' },
  { id: 'maior', label: 'Maior preço' },
  { id: 'az', label: 'A – Z' },
];

function sortList(list: Product[], s: Sort) {
  const l = [...list];
  if (s === 'populares') l.sort((a, b) => a.rank - b.rank);
  if (s === 'menor') l.sort((a, b) => a.price - b.price);
  if (s === 'maior') l.sort((a, b) => b.price - a.price);
  if (s === 'az') l.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return l;
}

/** Cardápio digital: filtros por categoria, busca sem acento, ordenação e grupos com identidade própria. */
export function MenuSection() {
  const [cat, setCat] = useState<CategoryId | 'todos'>('todos');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('relevancia');

  const groups = useMemo(() => {
    const term = normalize(q);
    const match = (p: Product) =>
      !term || normalize([p.name, p.tagline, p.description, ...p.ingredients].join(' ')).includes(term);
    return categories
      .filter((c) => cat === 'todos' || c.id === cat)
      .map((c) => ({ cat: c, items: sortList(products.filter((p) => p.category === c.id && match(p)), sort) }))
      .filter((g) => g.items.length);
  }, [cat, q, sort]);

  const total = groups.reduce((t, g) => t + g.items.length, 0);

  return (
    <section id="cardapio" className="relative bg-ink py-24 md:py-32" aria-labelledby="cardapio-title">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-5">Cardápio digital</p>
            <h2 id="cardapio-title" className="display text-[clamp(3rem,8vw,7rem)]">
              <SplitWords text="Escolha seu" className="block" />
              <SplitWords text="próximo vício." className="block text-ember" delay={0.15} />
            </h2>
          </div>
          <p className="max-w-[26rem] text-cream/60">
            {products.length} itens feitos na hora. Toque em um produto para ver ingredientes, personalizar e adicionar ao pedido.
          </p>
        </div>

        {/* barra de filtros */}
        <div className="sticky top-[72px] z-30 -mx-5 mt-12 border-b border-cream/10 bg-ink/85 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:mx-0 lg:rounded-2xl lg:border lg:px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div role="tablist" aria-label="Categorias" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 lg:flex-1">
              {[{ id: 'todos' as const, label: 'Todos' }, ...categories].map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={cat === c.id}
                  onClick={() => setCat(c.id)}
                  className={cx('chip relative shrink-0 whitespace-nowrap', cat === c.id ? 'border-transparent text-ink' : 'text-cream/70 hover:border-cream/40 hover:text-cream')}
                >
                  {cat === c.id && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-ember" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <label className="relative flex-1 lg:w-64 lg:flex-none">
                <span className="sr-only">Buscar no cardápio</span>
                <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40" />
                <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Buscar: bacon, cheddar…" className="field !rounded-full !py-2.5 !pl-10 !pr-9" />
                {q && (
                  <button type="button" onClick={() => setQ('')} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-cream/60 hover:bg-cream/10" aria-label="Limpar busca">
                    <X size={15} />
                  </button>
                )}
              </label>
              <label className="relative">
                <span className="sr-only">Ordenar</span>
                <ArrowDownWideNarrow size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40" />
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field h-full min-h-[44px] appearance-none !rounded-full !py-2 !pl-10 !pr-4 text-sm font-semibold">
                  {sorts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">{total} produtos encontrados</p>

        <AnimatePresence mode="popLayout">
          {groups.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-16 rounded-[28px] border border-dashed border-cream/15 p-12 text-center">
              <p className="display text-4xl">Nada por aqui.</p>
              <p className="mt-2 text-cream/60">Nenhum item com “{q}”. Tente “bacon”, “cheddar” ou “batata”.</p>
              <button type="button" className="btn-ghost mt-6" onClick={() => { setQ(''); setCat('todos'); }}>
                Ver cardápio completo
              </button>
            </motion.div>
          ) : (
            groups.map(({ cat: c, items }) => (
              <motion.div key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-16 md:mt-20">
                {/* cabeçalho com identidade da categoria */}
                <div className="relative mb-6 overflow-hidden rounded-[28px] p-7 md:mb-8 md:flex md:items-end md:justify-between md:gap-10 md:p-10" style={{ backgroundColor: c.bg, color: c.fg }}>
                  <span aria-hidden className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[180px] uppercase leading-none opacity-10">{c.label.split(' ')[0]}</span>
                  <div className="relative">
                    <p className="text-sm font-bold" style={{ color: c.accent }}>{c.label}</p>
                    <h3 className="display mt-2 max-w-[16ch] text-[clamp(2rem,4.4vw,3.6rem)]">{c.headline}</h3>
                  </div>
                  <p className="relative mt-3 max-w-[24rem] text-[15px] opacity-80 md:mt-0">{c.blurb}</p>
                </div>
                {/* celular: carrossel com snap · desktop: grade */}
                <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((p, i) => (
                      <div key={p.id} className="w-[78%] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none">
                        <ProductCard p={p} index={i} />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
