import { motion, useReducedMotion } from 'framer-motion';
import { cx } from '@/lib/format';

interface Props {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  /** anima quando entra na tela (true) ou imediatamente (false) */
  inView?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

/** Texto revelado palavra por palavra, cada uma subindo de dentro de uma máscara. */
export function SplitWords({ text, className, wordClassName, delay = 0, stagger = 0.06, inView = true, as = 'span' }: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(' ');
  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      {...(inView ? { whileInView: 'show', viewport: { once: true, amount: 0.4 } } : { animate: 'show' })}
      transition={{ staggerChildren: reduce ? 0 : stagger, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden className="-mt-[0.2em] inline-block overflow-hidden pb-[0.08em] pt-[0.2em] align-bottom">
          <motion.span
            className={cx('inline-block', wordClassName)}
            variants={{
              hidden: { y: reduce ? 0 : '110%', rotate: reduce ? 0 : 6, opacity: reduce ? 0 : 1 },
              show: { y: '0%', rotate: 0, opacity: 1, transition: { duration: reduce ? 0.2 : 0.9, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
