export function Footer() {
  return (
    <footer className="border-t border-amber-dim/30 px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-amber-dim">
            Built by
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-amber-primary">
            <a
              href="https://github.com/yajinn"
              className="hover:text-amber-cream hover:underline"
            >
              yajinn
            </a>
            <span className="text-amber-dim">+</span>
            <a
              href="https://github.com/terzigolu"
              className="hover:text-amber-cream hover:underline"
            >
              terzigolu
            </a>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs">
            <a
              href="https://github.com/terzigolu/ccwatch"
              className="text-amber-dim hover:text-amber-primary"
            >
              github →
            </a>
            <a
              href="https://www.npmjs.com/package/@terzigolu/ccwatch"
              className="text-amber-dim hover:text-amber-primary"
            >
              npm →
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-amber-dim">
          <span>MIT 2026 · ccwatch</span>
          <span className="eof-mark">eof</span>
        </div>
      </div>
    </footer>
  );
}
