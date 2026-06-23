'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

// Dependency-free scroll reveal: a tasteful fade + rise as content enters the
// viewport, with optional stagger via `delay`. Respects prefers-reduced-motion
// (renders fully visible, no transition). Server-component children pass through.
export function Reveal({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setShown(true);
      return;
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
  }, []);

  return (
    <div ref={ref} style={delay ? { transitionDelay: `${delay}ms` } : undefined} className={cn('reveal', shown && 'reveal-in', className)}>
      {children}
    </div>
  );
}
