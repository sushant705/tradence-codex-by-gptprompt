import { getNodeHandler } from './handlers';
import { createGraphMaps, validateWorkflowGraph } from './validation';
import type {
  ExecutionContext,
  ExecutionLogEntry,
  SimulationNode,
  SimulationResult,
  ValidationIssue,
  WorkflowGraph,
} from './types';

const nowIso = (): string => new Date().toISOString();

const buildNodeLookup = (nodes: SimulationNode[]): Map<string, SimulationNode> => {
  return new Map(nodes.map((node) => [node.id, node]));
};

const hasBlockingValidationIssue = (issues: ValidationIssue[]): boolean => {
  return issues.some((issue) => issue.code === 'CYCLE_DETECTED' || issue.code === 'MISSING_START' || issue.code === 'MULTIPLE_STARTS');
};

const seedQueue = (graph: WorkflowGraph): string[] => {
  const startNodes = graph.nodes.filter((node) => node.type === 'Start').map((node) => node.id);
  return [...startNodes];
};

export interface SimulateWorkflowOptions {
  input?: Record<string, unknown>;
}

export const simulateWorkflow = (
  graph: WorkflowGraph,
  options: SimulateWorkflowOptions = {},
): SimulationResult => {
  const validationIssues = validateWorkflowGraph(graph);

  if (hasBlockingValidationIssue(validationIssues)) {
    return {
      success: false,
      logs: [],
      validationIssues,
      visitedNodeIds: [],
    };
  }

  const nodeLookup = buildNodeLookup(graph.nodes);
  const { incomingMap, outgoingMap } = createGraphMaps(graph);
  const queue = seedQueue(graph);

  const context: ExecutionContext = {
    input: options.input ?? {},
    state: {},
  };

  const logs: ExecutionLogEntry[] = [];
  const visited = new Set<string>();
  const remainingIncoming = new Map<string, number>();

  graph.nodes.forEach((node) => {
    const incomingEdges = incomingMap.get(node.id) ?? [];
    remainingIncoming.set(node.id, incomingEdges.length);
  });

  queue.forEach((startNodeId) => {
    remainingIncoming.set(startNodeId, 0);
  });

  let step = 0;
  let halted = false;
  let failed = false;

  while (queue.length > 0 && !halted && !failed) {
    const nodeId = queue.shift();
    if (!nodeId || visited.has(nodeId)) {
      continue;
    }

    const node = nodeLookup.get(nodeId);
    if (!node) {
      continue;
    }

    const startedAt = nowIso();
    const handler = getNodeHandler(node);
    const result = handler(node, context);
    const endedAt = nowIso();

    step += 1;

    logs.push({
      step,
      nodeId: node.id,
      nodeType: node.type,
      status: result.status,
      message: result.message,
      startedAt,
      endedAt,
    });

    visited.add(node.id);

    if (result.status === 'halted') {
      halted = true;
      continue;
    }

    if (result.status === 'failed') {
      failed = true;
      continue;
    }

    const outgoingEdges = outgoingMap.get(node.id) ?? [];

    outgoingEdges.forEach((edge) => {
      const currentRemaining = remainingIncoming.get(edge.target) ?? 0;
      const nextRemaining = Math.max(currentRemaining - 1, 0);
      remainingIncoming.set(edge.target, nextRemaining);

      if (nextRemaining === 0 && !visited.has(edge.target)) {
        queue.push(edge.target);
      }
    });
  }

  return {
    success: !failed,
    logs,
    validationIssues,
    visitedNodeIds: [...visited],
  };
};
