import { useState } from 'react';

const TABS = [
  {
    id: 'npx' as const,
    label: 'npx (one-line)',
    code: 'npx @terzigolu/ccwatch',
  },
  {
    id: 'plugin' as const,
    label: 'Claude Code plugin',
    code: '/plugin marketplace add https://github.com/terzigolu/ccwatch\n/plugin install ccwatch\n/setup',
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

  return (
    <section className="border-t border-amber-dim/20 px-8 py-20">
      <h2 className="font-mono text-sm uppercase tracking-widest text-amber-dim">
        // Install
      </h2>

      <div className="mt-8 max-w-3xl">
        {/* Tab buttons */}
        <div className="flex border-b border-amber-dim/30">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-mono text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-amber-primary text-amber-primary -mb-px'
                  : 'text-amber-dim hover:text-amber-cream'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="relative mt-4 border border-amber-dim/30 bg-black/60">
          <pre className="overflow-x-auto p-5 font-mono text-sm text-amber-cream">
            {active.code}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 border border-amber-dim/40 bg-black/50 px-3 py-1 font-mono text-xs text-amber-dim hover:border-amber-primary hover:text-amber-primary"
          >
            {copied ? '✓ copied' : 'copy'}
          </button>
        </div>

        {/* Slash commands */}
        <div className="mt-10">
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-dim">
            Slash commands
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
