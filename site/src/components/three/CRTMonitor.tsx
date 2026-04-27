import { CRTScreen } from './CRTScreen';

/**
 * Inside the CSS CRTFrame (vintage beige body), we no longer need 3D bezel/glass/stand
 * meshes — the CSS frame provides all that physical detail.
 *
 * This component now renders ONLY the glowing screen content: a dark backplate +
 * the live <CRTScreen> primitives (text, bars) read from the zustand store.
 *
 * Post-processing (bloom + glitch + vignette) from <PostFX /> still applies via
 * EffectComposer in CRTScene.
 */
export function CRTMonitor() {
  return (
    <group>
      {/* Dark amber-tinted backplate so phosphor glow stands out */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[5, 4]} />
        <meshBasicMaterial color="#0a0500" />
      </mesh>

      {/* Live screen content (text + bars) */}
      <CRTScreen />
    </group>
  );
}
