import { Text } from '@react-three/drei';
import { useWizardStore } from '@/lib/store';
import { computeLayout } from '@/lib/statusline-mock';
import type { CellKey, SessionMock } from '@/types';

const AMBER = '#ffb000';
const AMBER_DIM = '#806000';
const AMBER_CREAM = '#fff8e1';

export function CRTScreen() {
  const enabledCells = useWizardStore((s) => s.enabledCells);
  const breakpoint = useWizardStore((s) => s.breakpoint);
  const sessionMock = useWizardStore((s) => s.sessionMock);

  const rows = computeLayout(enabledCells, breakpoint + 1, breakpoint);

  if (rows.length === 0) {
    return (
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.15}
        color={AMBER_DIM}
        anchorX="center"
        anchorY="middle"
      >
        no cells enabled
      </Text>
    );
  }

  const rowHeight = 0.45;
  const totalHeight = rows.length * rowHeight;
  const startY = totalHeight / 2 - rowHeight / 2;

  return (
    <group>
      {rows.map((row, rowIdx) => {
        const y = startY - rowIdx * rowHeight;
        const cellWidth = 3 / row.length;
        const startX = -1.5 + cellWidth / 2;
        return (
          <group key={rowIdx} position={[0, y, 0]}>
            {row.map((cellKey, cellIdx) => {
              const x = startX + cellIdx * cellWidth;
              return (
                <CellGroup
                  key={cellKey}
                  cellKey={cellKey}
                  session={sessionMock}
                  position={[x, 0, 0]}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

interface CellGroupProps {
  cellKey: CellKey;
  session: SessionMock;
  position: [number, number, number];
}

function CellGroup({ cellKey, session, position }: CellGroupProps) {
  switch (cellKey) {
    case '5h':
      return (
        <BarGroup
          label="5h"
          pct={session.quota5hUsedPct}
          suffix="2h 14m"
          position={position}
        />
      );
    case '7d':
      return (
        <BarGroup
          label="7d"
          pct={session.quota7dUsedPct}
          suffix="3d 02h"
          position={position}
        />
      );
    case 'ctxbar':
      return (
        <BarGroup
          label="ctx"
          pct={session.contextPct}
          suffix={`${session.contextPct}%`}
          position={position}
        />
      );
    case 'session':
      return (
        <CellGroupText
          label="session"
          value={`$${session.cost.toFixed(2)} · $${session.burnRatePerHour.toFixed(2)}/h`}
          position={position}
        />
      );
    case 'today':
      return (
        <CellGroupText
          label="today"
          value={`$${session.cost.toFixed(2)}`}
          position={position}
        />
      );
    case 'history':
      return <CellGroupText label="week" value="$12.40" position={position} />;
    case 'total':
      return <CellGroupText label="total" value="$248.55" position={position} />;
    case 'model':
      return (
        <CellGroupText
          label={`${session.contextPct}%`}
          value="sonnet-4-6"
          position={position}
        />
      );
  }
}

function CellGroupText({
  label,
  value,
  position,
}: {
  label: string;
  value: string;
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <Text
        position={[0, 0.1, 0.01]}
        fontSize={0.08}
        color={AMBER_DIM}
        anchorX="center"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>
      <Text
        position={[0, -0.05, 0.01]}
        fontSize={0.13}
        color={AMBER}
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  );
}

function BarGroup({
  label,
  pct,
  suffix,
  position,
}: {
  label: string;
  pct: number;
  suffix: string;
  position: [number, number, number];
}) {
  const barColor = pct < 50 ? AMBER : pct < 80 ? '#ff6700' : '#ff3030';
  const fillWidth = (Math.min(100, Math.max(0, pct)) / 100) * 1.0;
  return (
    <group position={position}>
      <Text
        position={[-0.5, 0.12, 0.01]}
        fontSize={0.08}
        color={AMBER_DIM}
        anchorX="left"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>
      <Text
        position={[0.5, 0.12, 0.01]}
        fontSize={0.08}
        color={AMBER_CREAM}
        anchorX="right"
        anchorY="middle"
      >
        {suffix}
      </Text>
      <mesh position={[0, -0.05, 0.01]}>
        <planeGeometry args={[1.0, 0.06]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[-0.5 + fillWidth / 2, -0.05, 0.02]}>
        <planeGeometry args={[fillWidth, 0.05]} />
        <meshBasicMaterial color={barColor} toneMapped={false} />
      </mesh>
    </group>
  );
}
