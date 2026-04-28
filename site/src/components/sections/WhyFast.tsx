const CARDS = [
  {
    title: 'mtime + size cache',
    quote: "Per-file fingerprint. We don't re-read what hasn't changed.",
    stat: 'cold 0.9s · warm 80ms',
  },
  {
    title: 'streaming dedup',
    quote: 'Each API call writes 2-7 JSONL entries. We dedupe by message.id.',
    stat: '1.0× counted, never inflated',
  },
  {
    title: 'substring prefilter',
    quote: "Skip JSON.parse on lines that can't match. 50× faster.",
    stat: '~50× scan speedup',
  },
];

export function WhyFast() {
  return (
    <section className="tx-ledger border-t border-amber-dim/20 px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="section-divider">
        <span className="section-locator">
          <span className="sl-mark">§</span>
          <span>03</span>
          <span className="sl-divider">/</span>
          <span>benchmark.log</span>
        </span>
      </div>
      <h2 className="font-mono text-sm uppercase tracking-widest text-amber-dim">
        // Why it&apos;s fast
      </h2>
      <p className="mt-2 max-w-2xl text-amber-cream">
        Other tools re-scan the entire ~/.claude/projects tree every render. ccwatch caches
        per-file. Three techniques compound.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {CARDS.map((card, i) => (
          <article
            key={card.title}
            className="group relative border border-amber-dim/30 bg-black/40 p-6 transition-all hover:border-amber-primary hover:shadow-[0_0_24px_rgba(255,176,0,0.15)]"
          >
            <span className="card-tab">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-4 font-mono text-amber-primary">{card.title}</h3>
            <p className="mt-3 text-amber-cream/85 leading-relaxed">{card.quote}</p>
            <div className="mt-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber-glow">
              <span aria-hidden="true">→</span>
              <span>{card.stat}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
