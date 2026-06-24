import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">404 · Off the slope</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-cream md:text-6xl">This route isn&rsquo;t in BurgReport.</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
        The page you opened doesn&rsquo;t exist in the current build. Head back to the pricing terminal or browse the 34 Grand Cru climats.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/search" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-cream">
          Search Grand Crus
        </Link>
        <Link href="/" className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-cream transition hover:border-gold/60 hover:text-gold">
          Back Home
        </Link>
      </div>
    </section>
  );
}
