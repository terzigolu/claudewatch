import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { CRTScreen } from './CRTScreen';

interface Props {
  rotate?: boolean;
}

export function CRTMonitor({ rotate = true }: Props) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (rotate && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer bezel */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[4.2, 3.2, 0.4]} />
        <meshStandardMaterial color="#0a0606" roughness={0.7} />
      </mesh>

      {/* Inner bezel */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[3.9, 2.9, 0.2]} />
        <meshStandardMaterial color="#1a0f00" roughness={0.5} />
      </mesh>

      {/* Curved glass — sphere segment */}
      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry
          args={[8, 32, 32, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.16]}
        />
        <meshPhysicalMaterial
          color="#000"
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>

      {/* Screen content */}
      <group position={[0, 0, 0.02]}>
        <mesh>
          <planeGeometry args={[3.5, 2.5]} />
          <meshBasicMaterial color="#1a0f00" />
        </mesh>
        <CRTScreen />
      </group>

      {/* Stand */}
      <mesh position={[0, -1.85, -0.1]}>
        <boxGeometry args={[1.2, 0.3, 1]} />
        <meshStandardMaterial color="#0a0606" roughness={0.8} />
      </mesh>
    </group>
  );
}
