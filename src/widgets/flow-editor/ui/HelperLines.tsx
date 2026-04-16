import { useStore, type ReactFlowState } from '@xyflow/react';

interface HelperLinesProps {
  horizontal: number | null;
  vertical: number | null;
}

// берём viewport для корректного позиционирования линий
const viewportSelector = (state: ReactFlowState) => ({
  x: state.transform[0],
  y: state.transform[1],
  zoom: state.transform[2],
});

export default function HelperLines({ horizontal, vertical }: HelperLinesProps) {
  const { x, y, zoom } = useStore(viewportSelector);

  if (horizontal === null && vertical === null) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {horizontal !== null && (
        <line
          x1={0}
          x2="100%"
          y1={horizontal * zoom + y}
          y2={horizontal * zoom + y}
          stroke="#4f46e5"
          strokeWidth={1}
          strokeDasharray="6 3"
          opacity={0.7}
        />
      )}
      {vertical !== null && (
        <line
          x1={vertical * zoom + x}
          x2={vertical * zoom + x}
          y1={0}
          y2="100%"
          stroke="#4f46e5"
          strokeWidth={1}
          strokeDasharray="6 3"
          opacity={0.7}
        />
      )}
    </svg>
  );
}
