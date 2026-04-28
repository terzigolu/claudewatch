import { useState } from 'react';

const TABS = [
  {
    id: 'npx' as const,
    label: 'npx (one-line)',
    code: 'npx @terzigolu/ccwatch',
    provides: ['statusline binary'],
    note: 'Wire it manually in ~/.claude/settings.json under statusLine.command. No slash commands.',
  },
  {
    id: 'plugin' as const,
    label: 'Claude Code plugin',
    code: '/plugin marketplace add https://github.com/terzigolu/ccwatch\n/plugin install ccwatch\n/setup',
    provides: ['statusline binary', '4 slash commands', 'auto-update'],
    note: '/setup writes statusLine.command for you. /doctor diagnoses drift.',
  },
];

const COMMANDS = [
  { name: '/ccwatch', desc: 'interactive visibility wizard' },
  { name: '/setup', desc: 'wire statusLine.command if it drifts' },
  { name: '/configure', desc: 'edit config JSON directly' },
  { name: '/doctor', desc: 'diagnose plugin install + statusline wiring' },
];

export function Install() {
  const [activeTab, setActiveTab] = useState<'npx' | 'plugin'>('npx');
  const [copied, setCopied] = useState(false);
  const active = TABS.find((t) => t.id === activeTab) ?? TABS[0]!;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = active.code.split('\n');

  return (
    <section className="border-t border-amber-dim/20 px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="section-divider">
        <span className="section-locator">
          <span className="sl-mark">§</span>
          <span>05</span>
          <span className="sl-divider">/</span>
          <span>boot.sequence</span>
        </span>
      </div>
      <h2 className="boot-prompt text-sm uppercase tracking-widest text-amber-dim">
        <span className="bp-glyph">$</span>
        <span>./install</span>
      </h2>

      <div className="mt-8 max-w-3xl">
        {/* Tab buttons */}
        <div className="flex border-b border-amber-dim/30">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-mono text-sm transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-b-2 border-amber-primary text-amber-primary -mb-px'
                  : 'text-amber-dim hover:text-amber-cream'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Provides badges — what you actually get from this install path */}
        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
          <span className="text-amber-dim">provides:</span>
          {active.provides.map((feat) => (
            <span
              key={feat}
              className="border border-amber-primary/50 bg-amber-primary/10 px-2 py-0.5 text-amber-primary"
            >
              {feat}
            </span>
          ))}
        </div>

        {/* Code block — line-numbered listing */}
        <div className="relative mt-3 border border-amber-dim/30 bg-black/60">
          <div className="code-listing">
            <div className="code-listing-gutter" aria-hidden="true">
              {lines.map((_, i) => String(i + 1).padStart(2, '0')).join('\n')}
            </div>
            <pre className="code-listing-content">{active.code}</pre>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 border border-amber-dim/40 bg-black/50 px-3 py-1 font-mono text-xs text-amber-dim hover:border-amber-primary hover:text-amber-primary cursor-pointer"
          >
            {copied ? '✓ copied' : 'copy'}
          </button>
        </div>

        {/* Per-tab note explaining the trade-off */}
        <p className="mt-3 font-mono text-xs leading-relaxed text-amber-dim">
          <span className="text-amber-glow">›</span> {active.note}
        </p>

        {/* Slash commands */}
        <div className="mt-10">
          <h3 className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-dim">
            <span>Slash commands</span>
            <span className="border border-amber-glow/50 bg-amber-glow/10 px-1.5 py-0.5 text-[9px] tracking-widest text-amber-glow">
              plugin only
            </span>
          </h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {COMMANDS.map((cmd) => (
              <div key={cmd.name} className="flex gap-3">
                <dt className="font-mono text-amber-primary">{cmd.name}</dt>
                <dd className="text-amber-cream/80">{cmd.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
