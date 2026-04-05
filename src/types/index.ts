export type NodeType = 'action' | 'condition';

export interface NodeData {
  label: string;
  [key: string]: unknown;
}

export interface ScenarioNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
}

export interface ScenarioEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Scenario {
  id: string;
  title: string;
  updatedAt: string;
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
}

export type ScenarioPreview = Pick<Scenario, 'id' | 'title' | 'updatedAt'>;
