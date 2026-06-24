import Link from 'next/link';

const examples = [
  { name: 'La Tâche', vintage: '2019' },
  { name: 'Romanée-Conti', vintage: '2018' },
  { name: 'Montrachet', vintage: '2014' },
  { name: 'Clos de la Roche', vintage: '2016' }
];

export function SearchEmptyState() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
      <p className="font-mono text-xs uppercase tracking-normal text-gold">Start with a climat</p>
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-cream">Search all 34 Grand Crus.</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
        Search a Grand Cru climat to inspect estimated, reference, and unavailable fields — each labeled by source.
      </p>
      <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-hint">
        Every result shows what we <span className="text-cream">don&apos;t</span> know too — &ldquo;unavailable&rdquo; fields and a confidence that&apos;s capped below authoritative are the point, not a bug.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {examples.map((example) => (
          <Link key={`${example.name}-${example.vintage}`} href={`/search?wine=${encodeURIComponent(example.name)}&vintage=${example.vintage}`} className="rounded-full border border-line bg-ink px-4 py-2 text-sm text-cream transition hover:border-gold/50 hover:text-gold">
            {example.name} <span className="font-mono text-gold">{example.vintage}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
