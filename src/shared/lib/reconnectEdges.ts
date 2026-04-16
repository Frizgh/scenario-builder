import { nanoid } from 'nanoid';
import type { Edge } from '@xyflow/react';

/**
 * Удаляет узел из графа рёбер и пересоединяет цепочку:
 * A→удаляемый→C становится A→C.
 *
 * Поддерживает несколько входящих/исходящих —
 * каждый вход соединяется с каждым выходом.
 */
export function reconnectEdgesOnDelete(nodeId: string, edges: Edge[]): Edge[] {
  const incoming = edges.filter((e) => e.target === nodeId);
  const outgoing = edges.filter((e) => e.source === nodeId);
  const rest = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);

  const bridges: Edge[] = [];
  for (const inc of incoming) {
    for (const out of outgoing) {
      if (inc.source === out.target) continue;
      const exists = rest.some(
        (e) => e.source === inc.source && e.target === out.target,
      );
      if (exists) continue;

      bridges.push({
        id: `e-${nanoid(6)}`,
        source: inc.source,
        sourceHandle: inc.sourceHandle,
        target: out.target,
        targetHandle: out.targetHandle,
      });
    }
  }

  return [...rest, ...bridges];
}
