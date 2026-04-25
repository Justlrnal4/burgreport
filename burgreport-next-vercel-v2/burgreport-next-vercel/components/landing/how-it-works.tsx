const steps = [
  ['Search a climat', 'Type La Tâche, Chambertin, Montrachet, or any Grand Cru.'],
  ['Add a vintage', 'Optional vintage context is preserved in the URL and used when available.'],
  ['Review data quality', 'Live, estimated, reference, and unavailable fields are labeled before you act on price.']
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-line bg-elevated/55 p-5 shadow-card md:p-7">
        <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-normal text-gold">Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-cream md:text-5xl">Three steps from bottle name to pricing context.</h2>
          </div>
          <div className="grid gap-3">
            {steps.map(([title, body], index) => (
              <div key={title} className="grid gap-4 rounded-2xl border border-line bg-ink/80 p-4 sm:grid-cols-[56px_1fr]">
                <span className="font-mono text-2xl text-gold">0{index + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold text-cream">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
