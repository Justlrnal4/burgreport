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
      <h2 className="mt-3 text-3xl font-semibold tracking-normal text-cream">Search all 33 Grand Crus.</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted">
        Search a Grand Cru climat to inspect live, reference, estimated, and unavailable fields.
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
