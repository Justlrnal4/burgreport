const cards = [
  {
    eyebrow: 'Search',
    title: 'Search any climat',
    body: 'Autocomplete handles accents, monopoles, red/white distinctions, and shareable search URLs.',
    className: ''
  },
  {
    eyebrow: 'Pricing',
    title: 'Price context without guesswork',
    body: 'Average, low, high, and source labels appear only when credible data is available.',
    className: ''
  },
  {
    eyebrow: 'Guide',
    title: 'Every Grand Cru has a reference page',
    body: 'Village, Côte, grape, size, monopole status, and producer context in one place.',
    className: ''
  },
  {
    eyebrow: 'Trust',
    title: 'Data quality is visible',
    body: 'Live, estimated, reference, and unavailable fields are clearly separated.',
    className: ''
  }
];

export function ValueGrid() {
  return (
    <section id="features" className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-normal text-gold">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-cream md:text-5xl">Burgundy pricing intelligence, built for trust.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {cards.map((card, index) => (
            <article key={card.title} className={`rounded-2xl border border-line bg-surface p-5 shadow-card ${card.className}`}>
              <div className="flex items-start justify-between gap-6">
                <p className="font-mono text-xs uppercase tracking-normal text-gold">{card.eyebrow}</p>
                <span className="font-mono text-sm text-hint">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-cream">{card.title}</h3>
              <p className="mt-4 text-sm leading-6 text-muted">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
