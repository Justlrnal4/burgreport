export default function SearchLoading() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* header */}
        <div className="h-2.5 w-40 animate-pulse rounded-full bg-elevated" />
        <div className="mt-4 h-9 w-72 animate-pulse rounded-xl bg-surface" />

        {/* search bar */}
        <div className="mt-6 h-16 animate-pulse rounded-2xl border border-line bg-surface/70" />

        {/* identity + verdict hero */}
        <div className="mt-5 h-20 animate-pulse rounded-2xl border border-line bg-surface/60" />
        <div className="mt-4 h-28 animate-pulse rounded-2xl border border-line bg-surface/70" />

        {/* panel grid mirrors the result terminal */}
        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
          <div className="grid gap-4">
            <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface/55" />
            <div className="h-40 animate-pulse rounded-2xl border border-line bg-surface/55" />
          </div>
          <div className="grid gap-4">
            <div className="h-40 animate-pulse rounded-2xl border border-line bg-surface/55" />
            <div className="h-40 animate-pulse rounded-2xl border border-line bg-surface/55" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-hint">
          <span className="h-2 w-2 animate-pulseGlow rounded-full bg-gold" aria-hidden />
          Reading public listings…
        </div>
      </div>
    </section>
  );
}
