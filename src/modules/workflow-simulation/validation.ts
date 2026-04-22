import type { SimulationEdge, SimulationNode, ValidationIssue, WorkflowGraph } from './types';

const buildIncomingMap = (nodes: SimulationNode[], edges: SimulationEdge[]): Map<string, SimulationEdge[]> => {
  const incoming = new Map<string, SimulationEdge[]>();

  nodes.forEach((node) => incoming.set(node.id, []));
  edges.forEach((edge) => {
    const list = incoming.get(edge.target);
    if (list) {
      list.push(edge);
    }
  });

  return incoming;
};

const buildOutgoingMap = (nodes: SimulationNode[], edges: SimulationEdge[]): Map<string, SimulationEdge[]> => {
  const outgoing = new Map<string, SimulationEdge[]>();

  nodes.forEach((node) => outgoing.set(node.id, []));
  edges.forEach((edge) => {
    const list = outgoing.get(edge.source);
    if (list) {
      list.push(edge);
    }
  });

  return outgoing;
};

const findCycles = (nodes: SimulationNode[], outgoing: Map<string, SimulationEdge[]>): ValidationIssue[] => {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const issues: ValidationIssue[] = [];

  const dfs = (nodeId: string): void => {
    if (visiting.has(nodeId)) {
      const cycleStartIndex = stack.lastIndexOf(nodeId);
      const cycleNodes = stack.slice(cycleStartIndex).concat(nodeId);
      issues.push({
        code: 'CYCLE_DETECTED',
        message: `Cycle detected: ${cycleNodes.join(' -> ')}`,
      });
      return;
    }

    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);
    stack.push(nodeId);

    const neighbors = outgoing.get(nodeId) ?? [];
    neighbors.forEach((edge) => dfs(edge.target));

    stack.pop();
    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  nodes.forEach((node) => dfs(node.id));

  return issues;
};

export const validateWorkflowGraph = (graph: WorkflowGraph): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const incoming = buildIncomingMap(graph.nodes, graph.edges);
  const outgoing = buildOutgoingMap(graph.nodes, graph.edges);

  const startNodes = graph.nodes.filter((node) => node.type === 'Start');
  if (startNodes.length === 0) {
    issues.push({
      code: 'MISSING_START',
      message: 'Workflow must include exactly one Start node.',
    });
  }

  if (startNodes.length > 1) {
    issues.push({
      code: 'MULTIPLE_STARTS',
      message: 'Workflow contains multiple Start nodes.',
    });
  }

  graph.nodes.forEach((node) => {
    const nodeIncoming = incoming.get(node.id) ?? [];
    const nodeOutgoing = outgoing.get(node.id) ?? [];

    if (node.type !== 'Start' && nodeIncoming.length === 0) {
      issues.push({
        code: 'MISSING_INCOMING',
        message: `Node ${node.id} (${node.type}) has no incoming connection.`,
        nodeId: node.id,
      });
    }

    if (node.type !== 'End' && nodeOutgoing.length === 0) {
      issues.push({
        code: 'MISSING_OUTGOING',
        message: `Node ${node.id} (${node.type}) has no outgoing connection.`,
        nodeId: node.id,
      });
    }
  });

  issues.push(...findCycles(graph.nodes, outgoing));

  return issues;
};

export const createGraphMaps = (graph: WorkflowGraph): {
  incomingMap: Map<string, SimulationEdge[]>;
  outgoingMap: Map<string, SimulationEdge[]>;
} => ({
  incomingMap: buildIncomingMap(graph.nodes, graph.edges),
  outgoingMap: buildOutgoingMap(graph.nodes, graph.edges),
});
