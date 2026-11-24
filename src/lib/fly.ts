/** Animação "voar para o carrinho": clona a imagem do produto e a leva até o ícone do carrinho visível. */
export function flyToCart(src: string, from: DOMRect | null) {
  if (!from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-target]'));
  const target = targets.find((t) => t.offsetParent !== null && t.getBoundingClientRect().width > 0);
  if (!target) return;
  const to = target.getBoundingClientRect();
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  const size = Math.min(140, from.width * 0.6);
  Object.assign(img.style, {
    position: 'fixed',
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: 'contain',
    zIndex: '9999',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 12px 18px rgba(0,0,0,.5))',
  });
  document.body.appendChild(img);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const anim = img.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 120}px) scale(.7) rotate(-12deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(-30deg)`, opacity: 0.4 },
    ],
    { duration: 800, easing: 'cubic-bezier(.55,.06,.45,1)' },
  );
  anim.onfinish = () => img.remove();
}
