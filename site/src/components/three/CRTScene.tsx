import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { CRTMonitor } from './CRTMonitor';
import { DustParticles } from './DustParticles';
import { PostFX } from './PostFX';
import { prefersReducedMotion } from '@/lib/webgl';

export function CRTScene() {
  const [degraded, setDegraded] = useState(false);
  const reduced = prefersReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 38 }}
      dpr={degraded ? 1 : Math.min(window.devicePixelRatio, 2)}
      gl={{ antialias: !degraded, alpha: false }}
      style={{ background: '#0a0606' }}
    >
      <PerformanceMonitor
        onDecline={() => setDegraded(true)}
        flipflops={2}
        bounds={() => [25, 60]}
      />

      <ambientLight intensity={0.15} color="#1a0f00" />
      <pointLight position={[2, 2, 4]} intensity={1.2} color="#ffb000" />
      <pointLight position={[-3, -1, 2]} intensity={0.3} color="#ff6700" />

      <Suspense fallback={null}>
        <CRTMonitor rotate={!reduced} />
        {!degraded && <DustParticles count={reduced ? 0 : 200} />}
      </Suspense>

      {!degraded && <PostFX reduced={reduced} />}
    </Canvas>
  );
}

export default CRTScene;
