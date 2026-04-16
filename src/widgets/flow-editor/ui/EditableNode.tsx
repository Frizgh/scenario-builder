import { useState, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import type { NodeData, NodeType } from '@/entities/scenario';
import { reconnectEdgesOnDelete } from '@/shared/lib';
import s from './nodes.module.css';

interface Props extends NodeProps {
  variant: NodeType;
}

export default function EditableNode({ id, data, variant }: Props) {
  const { setNodes, setEdges } = useReactFlow();
  const { label } = data as NodeData;

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(label);
  }, [label]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commitRename = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== label) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label: trimmed } } : n,
        ),
      );
    } else {
      setText(label);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') {
      setText(label);
      setEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => reconnectEdgesOnDelete(id, eds));
  };

  return (
    <div className={`${s.nodeBase} ${s[variant]}`}>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />

      {editing ? (
        <input
          ref={inputRef}
          className={s.editInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className={s.label} onDoubleClick={() => setEditing(true)}>
          {label}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />

      <button className={s.deleteBtn} onClick={handleDelete} title="Удалить узел">
        ×
      </button>
    </div>
  );
}
