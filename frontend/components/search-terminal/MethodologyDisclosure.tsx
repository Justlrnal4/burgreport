import Link from 'next/link';

export function MethodologyDisclosure() {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <p className="font-mono text-xs uppercase tracking-normal text-gold">Methodology</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        BurgReport separates backend-returned data, static reference context, estimated fields, example previews, and unavailable fields. Missing values are shown rather than filled with synthetic market data.
      </p>
      <Link href="/methodology" className="mt-3 inline-flex rounded-lg border border-line px-3 py-2 text-sm font-semibold text-cream transition hover:border-gold/60 hover:text-gold">
        Read methodology
      </Link>
    </section>
  );
}
