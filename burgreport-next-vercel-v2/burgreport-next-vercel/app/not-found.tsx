import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-sm uppercase tracking-normal text-gold">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-normal text-cream md:text-6xl">This route is not in BurgReport.</h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted">
        The route you opened does not exist in the current BurgReport build. Return to search or browse the Grand Cru guide.
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
