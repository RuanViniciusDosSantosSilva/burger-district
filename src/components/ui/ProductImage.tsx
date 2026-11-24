import { useState } from 'react';
import { cx } from '@/lib/format';

interface Props {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
}

/** Imagem com lazy loading, placeholder animado e fallback ilustrado (nunca exibe imagem quebrada). */
export function ProductImage({ src, alt, className, eager }: Props) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  return (
    <span className={cx('relative block', className)}>
      {state !== 'ok' && (
        <span aria-hidden className={cx('absolute inset-[12%] grid place-items-center rounded-full', state === 'loading' && 'animate-pulse bg-white/5')}>
          {state === 'error' && (
            <svg viewBox="0 0 120 90" className="w-2/3 opacity-60">
              <path d="M10 45c0-22 22-35 50-35s50 13 50 35z" fill="#e2561b" />
              <rect x="6" y="50" width="108" height="10" rx="5" fill="#5a2a12" />
              <path d="M8 66h104c0 8-8 14-16 14H24C16 80 8 74 8 66z" fill="#e2561b" />
            </svg>
          )}
        </span>
      )}
      {state !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          className={cx('h-full w-full object-contain transition-opacity duration-700', state === 'ok' ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </span>
  );
}
