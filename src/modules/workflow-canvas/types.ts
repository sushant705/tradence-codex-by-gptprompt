import type {
  Connection,
  Edge,
  Node,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowInstance,
} from 'reactflow';

export type WorkflowNodeKind = 'Start' | 'Task' | 'Approval' | 'Automated' | 'End';

export interface WorkflowNodeData {
  label: string;
  kind: WorkflowNodeKind;
}

export type WorkflowCanvasNode = Node<WorkflowNodeData>;
export type WorkflowCanvasEdge = Edge;

export interface AddNodeInput {
  kind: WorkflowNodeKind;
  label: string;
  position?: { x: number; y: number };
}

export interface UseWorkflowCanvasOptions {
  initialNodes?: WorkflowCanvasNode[];
  initialEdges?: WorkflowCanvasEdge[];
}

export interface UseWorkflowCanvasResult {
  nodes: WorkflowCanvasNode[];
  edges: WorkflowCanvasEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  onNodesDelete: (deletedNodes: WorkflowCanvasNode[]) => void;
  onEdgesDelete: (deletedEdges: WorkflowCanvasEdge[]) => void;
  addNode: (input: AddNodeInput) => WorkflowCanvasNode;
  deleteNodes: (nodeIds: string[]) => void;
  deleteEdges: (edgeIds: string[]) => void;
  setNodes: ReactFlowInstance['setNodes'];
  setEdges: ReactFlowInstance['setEdges'];
}
