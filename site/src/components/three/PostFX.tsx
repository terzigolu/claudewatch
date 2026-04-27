import {
  EffectComposer,
  Bloom,
  Vignette,
  Scanline,
  Glitch,
} from '@react-three/postprocessing';
import { GlitchMode, BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

interface Props {
  reduced?: boolean;
}

export function PostFX({ reduced = false }: Props) {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.6}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Scanline density={1.25} opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.3} darkness={0.7} />
      {!reduced ? (
        <Glitch
          delay={new Vector2(8, 14)}
          duration={new Vector2(0.15, 0.3)}
          strength={new Vector2(0.05, 0.1)}
          mode={GlitchMode.SPORADIC}
          ratio={0.3}
        />
      ) : (
        <></>
      )}
    </EffectComposer>
  );
}
