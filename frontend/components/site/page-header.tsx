import { Reveal } from '@/components/motion/reveal';

// Shared editorial page header: gold mono eyebrow with a hairline rule, a
// tracking-tight cream headline, and either a description below (single column)
// or an aside on the right (two columns). Reveal-animated, matching the landing.
export function PageHeader({
  eyebrow,
  title,
  description,
  aside
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <Reveal>
      {aside ? (
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow-rule font-mono text-[11px] uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-cream md:text-5xl">{title}</h1>
          </div>
          <div className="text-base leading-7 text-muted-foreground lg:max-w-xl">{aside}</div>
        </div>
      ) : (
        <div className="max-w-3xl">
          <p className="eyebrow-rule font-mono text-[11px] uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-cream md:text-5xl">{title}</h1>
          {description && <p className="mt-5 text-base leading-7 text-muted-foreground">{description}</p>}
        </div>
      )}
    </Reveal>
  );
}
