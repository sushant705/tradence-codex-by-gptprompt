import type { WorkflowNodeKind } from '../workflow-canvas';

export interface SimulationNode {
  id: string;
  type: WorkflowNodeKind;
  data?: Record<string, unknown>;
}

export interface SimulationEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowGraph {
  nodes: SimulationNode[];
  edges: SimulationEdge[];
}

export interface ValidationIssue {
  code: 'MISSING_INCOMING' | 'MISSING_OUTGOING' | 'CYCLE_DETECTED' | 'MISSING_START' | 'MULTIPLE_STARTS';
  message: string;
  nodeId?: string;
  edgeIds?: string[];
}

export interface ExecutionContext {
  input: Record<string, unknown>;
  state: Record<string, unknown>;
}

export interface NodeExecutionResult {
  status: 'success' | 'failed' | 'halted';
  message: string;
  output?: Record<string, unknown>;
}

export interface ExecutionLogEntry {
  step: number;
  nodeId: string;
  nodeType: WorkflowNodeKind;
  status: NodeExecutionResult['status'];
  message: string;
  startedAt: string;
  endedAt: string;
}

export interface SimulationResult {
  success: boolean;
  logs: ExecutionLogEntry[];
  validationIssues: ValidationIssue[];
  visitedNodeIds: string[];
}
