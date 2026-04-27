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
    <section className="border-t border-amber-dim/20 px-8 py-20">
      <h2 className="font-mono text-sm uppercase tracking-widest text-amber-dim">
        // Why it&apos;s fast
      </h2>
      <p className="mt-2 max-w-2xl text-amber-cream">
        Other tools re-scan the entire ~/.claude/projects tree every render. ccwatch caches
        per-file. Three techniques compound.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {CARDS.map((card) => (
          <article
            key={card.title}
            className="group border border-amber-dim/30 bg-black/30 p-6 transition-all hover:border-amber-primary hover:shadow-[0_0_24px_rgba(255,176,0,0.15)]"
          >
            <h3 className="font-mono text-amber-primary">{card.title}</h3>
            <p className="mt-3 text-amber-cream/85 leading-relaxed">{card.quote}</p>
            <div className="mt-4 font-mono text-xs uppercase tracking-wider text-amber-glow">
              {card.stat}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
