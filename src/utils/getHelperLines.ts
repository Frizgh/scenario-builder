import type { Node } from '@xyflow/react';

const SNAP_THRESHOLD = 6;
const FALLBACK_W = 120;
const FALLBACK_H = 40;

export interface HelperLinesResult {
  horizontal: number | null;
  vertical: number | null;
  snapX: number | null;
  snapY: number | null;
}

function getSize(node: Node) {
  return {
    w: node.measured?.width ?? FALLBACK_W,
    h: node.measured?.height ?? FALLBACK_H,
  };
}

/**
 * Для перетаскиваемого узла ищет выравнивание
 * по центру, левому/правому и верхнему/нижнему краю
 * относительно остальных узлов.
 */
export function getHelperLines(
  dragged: Node,
  others: Node[],
): HelperLinesResult {
  const result: HelperLinesResult = {
    horizontal: null,
    vertical: null,
    snapX: null,
    snapY: null,
  };

  const d = getSize(dragged);
  const dCx = dragged.position.x + d.w / 2;
  const dCy = dragged.position.y + d.h / 2;
  const dLeft = dragged.position.x;
  const dRight = dragged.position.x + d.w;
  const dTop = dragged.position.y;
  const dBottom = dragged.position.y + d.h;

  let minDx = SNAP_THRESHOLD;
  let minDy = SNAP_THRESHOLD;

  for (const node of others) {
    if (node.id === dragged.id) continue;

    const n = getSize(node);
    const nCx = node.position.x + n.w / 2;
    const nCy = node.position.y + n.h / 2;
    const nLeft = node.position.x;
    const nRight = node.position.x + n.w;
    const nTop = node.position.y;
    const nBottom = node.position.y + n.h;

    const xChecks = [
      { drag: dCx, target: nCx, snap: nCx - d.w / 2 },
      { drag: dLeft, target: nLeft, snap: nLeft },
      { drag: dRight, target: nRight, snap: nRight - d.w },
      { drag: dLeft, target: nRight, snap: nRight },
      { drag: dRight, target: nLeft, snap: nLeft - d.w },
    ];

    for (const { drag, target, snap } of xChecks) {
      const dist = Math.abs(drag - target);
      if (dist < minDx) {
        minDx = dist;
        result.vertical = target;
        result.snapX = snap;
      }
    }

    const yChecks = [
      { drag: dCy, target: nCy, snap: nCy - d.h / 2 },
      { drag: dTop, target: nTop, snap: nTop },
      { drag: dBottom, target: nBottom, snap: nBottom - d.h },
      { drag: dTop, target: nBottom, snap: nBottom },
      { drag: dBottom, target: nTop, snap: nTop - d.h },
    ];

    for (const { drag, target, snap } of yChecks) {
      const dist = Math.abs(drag - target);
      if (dist < minDy) {
        minDy = dist;
        result.horizontal = target;
        result.snapY = snap;
      }
    }
  }

  return result;
}
