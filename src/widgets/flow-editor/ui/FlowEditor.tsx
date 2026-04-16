import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { NodeProps } from '@xyflow/react';

import type { NodeType } from '@/entities/scenario';
import { Button, Spinner } from '@/shared/ui';
import { useFlowEditor } from '../model/useFlowEditor';
import EditableNode from './EditableNode';
import HelperLines from './HelperLines';
import s from './FlowEditor.module.css';

// Каждый тип узла — это EditableNode с нужным вариантом стиля.
// Фабрика избавляет от двух файлов-однострочников.
function makeNodeComponent(variant: NodeType) {
  const Component = (props: NodeProps) => <EditableNode {...props} variant={variant} />;
  Component.displayName = `${variant}Node`;
  return Component;
}

const nodeTypes = {
  action: makeNodeComponent('action'),
  condition: makeNodeComponent('condition'),
};

function FlowEditorInner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const flow = useFlowEditor(id);

  const memoNodeTypes = useMemo(() => nodeTypes, []);

  if (flow.loading) return <Spinner />;
  if (flow.error) return <p style={{ padding: 40, color: '#dc2626' }}>{flow.error}</p>;

  return (
    <div className={s.wrapper}>
      <div className={s.toolbar}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← Назад
        </Button>
        <input
          className={s.scenarioTitle}
          value={flow.title}
          onChange={(e) => flow.setTitle(e.target.value)}
          placeholder="Название сценария"
        />
        <div className={s.spacer} />
        <Button variant="ghost" onClick={() => flow.addNode('action')}>
          + Действие
        </Button>
        <Button variant="ghost" onClick={() => flow.addNode('condition')}>
          + Условие
        </Button>
        <Button onClick={flow.handleSave} disabled={flow.saving}>
          {flow.saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
        {flow.saveMsg && <span className={s.saved}>{flow.saveMsg}</span>}
        <span className={s.hint}>
          2× клик — переименовать · Бросить узел на связь — вставить · 2× клик по связи — удалить
        </span>
      </div>

      <div className={s.canvas}>
        <ReactFlow
          nodes={flow.nodes}
          edges={flow.edges}
          onNodesChange={flow.handleNodesChange}
          onEdgesChange={flow.onEdgesChange}
          onConnect={flow.handleConnect}
          onEdgeDoubleClick={flow.handleEdgeDoubleClick}
          onNodeDragStart={flow.handleNodeDragStart}
          onNodeDragStop={flow.handleNodeDragStop}
          nodeTypes={memoNodeTypes}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          selectionOnDrag
          selectionMode={SelectionMode.Partial}
          panOnDrag={[1]}
          selectNodesOnDrag={false}
        >
          <HelperLines horizontal={flow.helperH} vertical={flow.helperV} />
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(n) => (n.type === 'condition' ? '#fbbf24' : '#a78bfa')}
            zoomable
            pannable
          />
          <Background gap={16} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}
