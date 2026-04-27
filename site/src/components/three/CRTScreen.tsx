import { Text } from '@react-three/drei';
import { useWizardStore } from '@/lib/store';
import { computeLayout } from '@/lib/statusline-mock';
import type { CellKey, SessionMock } from '@/types';

const AMBER = '#ffb000';
const AMBER_DIM = '#806000';
const AMBER_CREAM = '#fff8e1';

// Layout constants — matched to HTML <StatuslineMock /> proportions
const TOTAL_WIDTH = 3.6;
const ROW_HEIGHT = 0.6;
const ROW_GAP_X = 0.18; // horizontal gap between cells
const LABEL_Y = 0.14; // top of cell (label + suffix)
const VALUE_Y = -0.08; // below label (value or bar)
const LABEL_FONT = 0.1;
const VALUE_FONT = 0.16;
const BAR_HEIGHT = 0.06;

export function CRTScreen() {
  const enabledCells = useWizardStore((s) => s.enabledCells);
  const breakpoint = useWizardStore((s) => s.breakpoint);
  const sessionMock = useWizardStore((s) => s.sessionMock);

  const rows = computeLayout(enabledCells, breakpoint + 1, breakpoint);

  if (rows.length === 0) {
    return (
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.13}
        color={AMBER_DIM}
        anchorX="center"
        anchorY="middle"
      >
        no cells enabled
      </Text>
    );
  }

  const totalHeight = rows.length * ROW_HEIGHT;
  const startY = totalHeight / 2 - ROW_HEIGHT / 2;

  return (
    <group>
      {rows.map((row, rowIdx) => {
        const y = startY - rowIdx * ROW_HEIGHT;
        const cellsInRow = row.length;
        const cellWidth =
          (TOTAL_WIDTH - ROW_GAP_X * (cellsInRow - 1)) / cellsInRow;
        const rowStartX = -TOTAL_WIDTH / 2;
        const isLast = rowIdx === rows.length - 1;

        return (
          <group key={rowIdx} position={[0, y, 0]}>
            {row.map((cellKey, cellIdx) => {
              const cellLeftX =
                rowStartX + cellIdx * (cellWidth + ROW_GAP_X);
              return (
                <CellGroup
                  key={cellKey}
                  cellKey={cellKey}
                  session={sessionMock}
                  cellLeftX={cellLeftX}
                  cellWidth={cellWidth}
                />
              );
            })}
            {/* Bottom divider — except last row */}
            {!isLast && (
              <mesh position={[0, -ROW_HEIGHT / 2 + 0.04, 0.005]}>
                <planeGeometry args={[TOTAL_WIDTH, 0.005]} />
                <meshBasicMaterial color={AMBER_DIM} transparent opacity={0.35} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

interface CellProps {
  cellKey: CellKey;
  session: SessionMock;
  cellLeftX: number;
  cellWidth: number;
}

function CellGroup({ cellKey, session, cellLeftX, cellWidth }: CellProps) {
  switch (cellKey) {
    case '5h':
      return (
        <BarCell
          label="5h"
          pct={session.quota5hUsedPct}
          suffix="2h 14m"
          cellLeftX={cellLeftX}
          cellWidth={cellWidth}
        />
      );
    case '7d':
      return (
        <BarCell
          label="7d"
          pct={session.quota7dUsedPct}
          suffix="3d 02h"
          cellLeftX={cellLeftX}
          cellWidth={cellWidth}
        />
      );
    case 'ctxbar':
      return (
        <BarCell
          label="ctx"
          pct={session.contextPct}
          suffix={`${session.contextPct}%`}
          cellLeftX={cellLeftX}
          cellWidth={cellWidth}
        />
      );
    case 'session':
      return (
        <TextCell
          label="session"
          value={`$${session.cost.toFixed(2)} · $${session.burnRatePerHour.toFixed(2)}/h`}
          cellLeftX={cellLeftX}
        />
      );
    case 'today':
      return (
        <TextCell
          label="today"
          value={`$${session.cost.toFixed(2)}`}
          cellLeftX={cellLeftX}
        />
      );
    case 'history':
      return <TextCell label="week" value="$12.40" cellLeftX={cellLeftX} />;
    case 'total':
      return <TextCell label="total" value="$248.55" cellLeftX={cellLeftX} />;
    case 'model':
      return (
        <TextCell
          label={`${session.contextPct}%`}
          value="sonnet-4-6"
          cellLeftX={cellLeftX}
        />
      );
  }
}

function TextCell({
  label,
  value,
  cellLeftX,
}: {
  label: string;
  value: string;
  cellLeftX: number;
}) {
  return (
    <group>
      <Text
        position={[cellLeftX, LABEL_Y, 0.01]}
        fontSize={LABEL_FONT}
        color={AMBER_DIM}
        anchorX="left"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>
      <Text
        position={[cellLeftX, VALUE_Y, 0.01]}
        fontSize={VALUE_FONT}
        color={AMBER}
        anchorX="left"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  );
}

function BarCell({
  label,
  pct,
  suffix,
  cellLeftX,
  cellWidth,
}: {
  label: string;
  pct: number;
  suffix: string;
  cellLeftX: number;
  cellWidth: number;
}) {
  const barColor = pct < 50 ? AMBER : pct < 80 ? '#ff6700' : '#ff3030';
  const fillW = (Math.min(100, Math.max(0, pct)) / 100) * cellWidth;
  return (
    <group>
      <Text
        position={[cellLeftX, LABEL_Y, 0.01]}
        fontSize={LABEL_FONT}
        color={AMBER_DIM}
        anchorX="left"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>
      <Text
        position={[cellLeftX + cellWidth, LABEL_Y, 0.01]}
        fontSize={LABEL_FONT}
        color={AMBER_CREAM}
        anchorX="right"
        anchorY="middle"
      >
        {suffix}
      </Text>
      {/* Bar background — full cell width */}
      <mesh position={[cellLeftX + cellWidth / 2, VALUE_Y, 0.01]}>
        <planeGeometry args={[cellWidth, BAR_HEIGHT]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* Bar fill — left-anchored */}
      <mesh position={[cellLeftX + fillW / 2, VALUE_Y, 0.02]}>
        <planeGeometry args={[fillW, BAR_HEIGHT * 0.85]} />
        <meshBasicMaterial color={barColor} toneMapped={false} />
      </mesh>
    </group>
  );
}
