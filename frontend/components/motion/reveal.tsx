'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

// Dependency-free scroll reveal: a tasteful fade + rise as content enters the
// viewport, with optional stagger via `delay`. Respects prefers-reduced-motion
// (renders fully visible, no transition). Server-component children pass through.
//
// Pass `immediate` for above-the-fold content (e.g. the hero): it reveals on
// mount via rAF instead of waiting for an IntersectionObserver, so the first
// thing a visitor sees is never gated on a scroll event.
export function Reveal({
  children,
  className,
  delay = 0,
  immediate = false
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (immediate || reduceMotion) {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  return (
    <div ref={ref} style={delay ? { transitionDelay: `${delay}ms` } : undefined} className={cn('reveal', shown && 'reveal-in', className)}>
      {children}
    </div>
  );
}
