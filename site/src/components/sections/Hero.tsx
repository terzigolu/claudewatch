import { Suspense, lazy, useEffect, useState } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlitchText } from '@/components/ui/GlitchText';
import { TerminalCursor } from '@/components/ui/TerminalCursor';
import { hasWebGL } from '@/lib/webgl';
import { CRTFrame } from './CRTFrame';
import { StatuslineMock } from '@/components/ui/StatuslineMock';

const CRTScene = lazy(() => import('@/components/three/CRTScene'));

function ScenePlaceholder({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-amber-dim">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-widest">{message}</div>
        <div className="mt-2 text-amber-primary/40">▢</div>
      </div>
    </div>
  );
}

export function Hero() {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20">
      <div className="grid gap-8 lg:gap-12 lg:grid-cols-[55%_45%]">
        {/* Left: CSS vintage monitor body wrapping a live 3D scene (or HTML fallback) */}
        <div className="aspect-[4/3] flex items-center justify-center">
          <CRTFrame>
            {webglOk === null ? (
              <ScenePlaceholder message="[ initializing ]" />
            ) : webglOk ? (
              <Suspense fallback={<ScenePlaceholder message="[ loading 3D ]" />}>
                <CRTScene />
              </Suspense>
            ) : (
              <StatuslineMock />
            )}
          </CRTFrame>
        </div>

        {/* Right: copy + CTAs */}
        <div className="flex flex-col justify-center">
          <span className="section-locator self-start">
            <span className="sl-mark">§</span>
            <span>01</span>
            <span className="sl-divider">/</span>
            <span>ccwatch v1.0.1</span>
          </span>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            <GlitchText>watch the meter,</GlitchText>
            <br />
            <GlitchText>not the bill</GlitchText>
            <TerminalCursor className="ml-2" />
          </h1>
          <p className="mt-6 max-w-md text-amber-cream/90">
            Fast cost &amp; quota statusline for Claude Code. Cached transcript scanning. Zero deps.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <NeonButton
              onClick={() => navigator.clipboard.writeText('npx @terzigolu/ccwatch')}
            >
              <span className="text-amber-primary">$</span>
              <span>npx @terzigolu/ccwatch</span>
            </NeonButton>
            <NeonButton
              variant="ghost"
              onClick={() => window.open('https://github.com/terzigolu/ccwatch', '_blank')}
            >
              View on GitHub →
            </NeonButton>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-amber-dim">
            <span>~80ms warm render</span>
            <span>·</span>
            <span>1163 LOC compiled</span>
            <span>·</span>
            <span>0 runtime deps</span>
          </div>
        </div>
      </div>
    </section>
  );
}
