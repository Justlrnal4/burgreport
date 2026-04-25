'use client';

export default function SearchError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-normal text-danger">Search error</p>
      <h1 className="mt-4 text-4xl font-semibold text-cream">The search view failed to render.</h1>
      <p className="mt-4 text-sm text-muted">{error.message}</p>
      <button onClick={reset} className="mt-8 rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink">
        Try again
      </button>
    </section>
  );
}
