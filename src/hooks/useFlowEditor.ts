import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type NodeDragHandler,
} from '@xyflow/react';
import { nanoid } from 'nanoid';

import { fetchScenario, saveScenario } from '../api/scenarios';
import type { NodeData, NodeType, Scenario } from '../types';
import { distToSegment } from '../utils/geometry';
import { getHelperLines } from '../utils/getHelperLines';
import { reconnectEdgesOnDelete } from '../utils/reconnectEdges';

const EDGE_SNAP_DISTANCE = 50;

export function useFlowEditor(scenarioId: string | undefined) {
  const { getNodes, getEdges } = useReactFlow();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [helperH, setHelperH] = useState<number | null>(null);
  const [helperV, setHelperV] = useState<number | null>(null);

  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  // --- загрузка ---
  useEffect(() => {
    if (!scenarioId) return;
    setLoading(true);
    fetchScenario(scenarioId)
      .then((data) => {
        if (!data) {
          setError('Сценарий не найден');
          return;
        }
        setScenario(data);
        setTitle(data.title);
        setNodes(
          data.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: { label: n.label } satisfies NodeData,
          })),
        );
        setEdges(
          data.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
          })),
        );
      })
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [scenarioId, setNodes, setEdges]);

  // --- snap-направляющие + удаление с пересоединением ---
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const patched = changes.map((change) => {
        if (change.type !== 'position' || !change.position) return change;

        const allNodes = getNodes();
        const current = allNodes.find((n) => n.id === change.id);
        if (!current) return change;

        const virtual = { ...current, position: change.position };
        const { horizontal, vertical, snapX, snapY } = getHelperLines(virtual, allNodes);

        if (change.dragging) {
          setHelperH(horizontal);
          setHelperV(vertical);
        }

        if (snapX !== null || snapY !== null) {
          return {
            ...change,
            position: {
              x: snapX ?? change.position.x,
              y: snapY ?? change.position.y,
            },
          };
        }
        return change;
      });

      const dragEnded = patched.some(
        (c) => c.type === 'position' && c.dragging === false,
      );
      if (dragEnded) {
        setHelperH(null);
        setHelperV(null);
      }

      for (const change of patched) {
        if (change.type === 'remove') {
          setEdges((eds) => reconnectEdgesOnDelete(change.id, eds));
        }
      }

      onNodesChange(patched);
    },
    [onNodesChange, setEdges, getNodes],
  );

  // --- соединение ---
  const handleConnect = useCallback(
    (conn: Connection) => {
      setEdges((prev) => {
        const next = addEdge({ ...conn, id: `e-${nanoid(6)}` }, prev);

        // убираем прямое ребро, если появился обходной путь
        const redundant = new Set<string>();
        for (const edge of next) {
          const siblings = next.filter(
            (e) => e.id !== edge.id && e.source === edge.source,
          );
          for (const first of siblings) {
            if (next.some(
              (e) => e.id !== edge.id && e.source === first.target && e.target === edge.target,
            )) {
              redundant.add(edge.id);
            }
          }
        }

        return redundant.size > 0
          ? next.filter((e) => !redundant.has(e.id))
          : next;
      });
    },
    [setEdges],
  );

  // --- удаление ребра ---
  const handleEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges],
  );

  // --- drag: вставка узла в ребро ---
  const handleNodeDragStart: NodeDragHandler = useCallback((_event, node) => {
    dragStartPos.current = { ...node.position };
  }, []);

  const handleNodeDragStop: NodeDragHandler = useCallback(
    (_event, draggedNode) => {
      setHelperH(null);
      setHelperV(null);

      const startPos = dragStartPos.current;
      dragStartPos.current = null;

      if (startPos) {
        const moved = Math.hypot(
          draggedNode.position.x - startPos.x,
          draggedNode.position.y - startPos.y,
        );
        if (moved < 5) return;
      }

      const allNodes = getNodes();
      const currentEdges = getEdges();
      const cx = draggedNode.position.x + 60;
      const cy = draggedNode.position.y + 20;

      let closestEdge: Edge | null = null;
      let closestDist = EDGE_SNAP_DISTANCE;

      for (const edge of currentEdges) {
        if (edge.source === draggedNode.id || edge.target === draggedNode.id) continue;

        const src = allNodes.find((n) => n.id === edge.source);
        const tgt = allNodes.find((n) => n.id === edge.target);
        if (!src || !tgt) continue;

        const dist = distToSegment(
          cx, cy,
          src.position.x + 60, src.position.y + 40,
          tgt.position.x + 60, tgt.position.y,
        );
        if (dist < closestDist) {
          closestDist = dist;
          closestEdge = edge;
        }
      }

      if (closestEdge) {
        const old = closestEdge;
        const nodeId = draggedNode.id;
        setEdges((eds) => [
          ...eds.filter((e) => e.id !== old.id),
          {
            id: `e-${nanoid(6)}`,
            source: old.source,
            sourceHandle: old.sourceHandle,
            target: nodeId,
            targetHandle: 'top',
          },
          {
            id: `e-${nanoid(6)}`,
            source: nodeId,
            sourceHandle: 'bottom',
            target: old.target,
            targetHandle: old.targetHandle,
          },
        ]);
      }
    },
    [getNodes, getEdges, setEdges],
  );

  // --- добавление узла ---
  const addNode = useCallback(
    (type: NodeType) => {
      const label = type === 'action' ? 'Новое действие' : 'Условие';
      const newNode: Node = {
        id: `n-${nanoid(6)}`,
        type,
        position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: { label } satisfies NodeData,
      };
      setNodes((prev) => [...prev, newNode]);
    },
    [setNodes],
  );

  // --- сохранение ---
  const handleSave = useCallback(async () => {
    if (!scenario) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const updated: Scenario = {
        ...scenario,
        title,
        updatedAt: new Date().toISOString(),
        nodes: nodes.map((n) => ({
          id: n.id,
          type: (n.type ?? 'action') as NodeType,
          label: (n.data as NodeData).label,
          position: n.position,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label as string | undefined,
        })),
      };
      await saveScenario(updated);
      setSaveMsg('Сохранено!');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch {
      setSaveMsg('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  }, [scenario, title, nodes, edges]);

  return {
    // данные
    nodes,
    edges,
    title,
    setTitle,
    loading,
    error,
    saving,
    saveMsg,
    helperH,
    helperV,

    // обработчики для ReactFlow
    handleNodesChange,
    onEdgesChange,
    handleConnect,
    handleEdgeDoubleClick,
    handleNodeDragStart,
    handleNodeDragStop,

    // действия
    addNode,
    handleSave,
  };
}
