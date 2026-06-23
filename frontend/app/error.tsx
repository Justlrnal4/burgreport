'use client';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-normal text-danger">Error</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-normal text-cream md:text-6xl">The pricing view hit an error.</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted">
        The page hit an unexpected error. Try again, or return to search while the issue is investigated.
      </p>
      {process.env.NODE_ENV !== 'production' && error?.message && (
        <p className="mt-4 max-w-xl rounded-2xl border border-line bg-surface p-4 font-mono text-xs text-hint">{error.message}</p>
      )}
      <button type="button" onClick={reset} className="mt-8 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-cream">
        Try again
      </button>
    </section>
  );
}
