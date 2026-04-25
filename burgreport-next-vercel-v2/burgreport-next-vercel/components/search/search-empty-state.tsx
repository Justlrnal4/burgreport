import Link from 'next/link';

const examples = ['La Tâche', 'Romanée-Conti', 'Chambertin', 'Montrachet'];

export function SearchEmptyState() {
  return (
    <div className="rounded-[2rem] border border-line bg-surface p-8 text-center shadow-card">
      <p className="font-mono text-xs uppercase tracking-normal text-gold">Start with a climat</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-normal text-cream">Search all 33 Grand Crus.</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted">
        Enter a Grand Cru name and optional vintage. The result page separates backend-returned values, reference context, and unavailable fields.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {examples.map((example) => (
          <Link key={example} href={`/search?wine=${encodeURIComponent(example)}&vintage=2019`} className="rounded-full border border-line bg-ink px-4 py-2 text-sm text-cream transition hover:border-gold/50 hover:text-gold">
            {example}
          </Link>
        ))}
      </div>
    </div>
  );
}
