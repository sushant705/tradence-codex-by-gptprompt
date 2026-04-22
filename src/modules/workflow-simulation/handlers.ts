import type { ExecutionContext, NodeExecutionResult, SimulationNode } from './types';

export type NodeHandler = (node: SimulationNode, context: ExecutionContext) => NodeExecutionResult;

const executeStart: NodeHandler = () => ({
  status: 'success',
  message: 'Start node initialized workflow execution.',
});

const executeTask: NodeHandler = (node, context) => {
  const taskName = String(node.data?.label ?? node.id);
  context.state.lastTask = taskName;

  return {
    status: 'success',
    message: `Task completed: ${taskName}.`,
    output: {
      lastTask: taskName,
    },
  };
};

const executeApproval: NodeHandler = (_node, context) => {
  const approved = context.input.approved !== false;

  if (!approved) {
    return {
      status: 'halted',
      message: 'Approval rejected input, halting execution.',
    };
  }

  return {
    status: 'success',
    message: 'Approval granted.',
  };
};

const executeAutomated: NodeHandler = (node, context) => {
  const action = String(node.data?.actionType ?? 'default-action');
  context.state.lastAutomatedAction = action;

  return {
    status: 'success',
    message: `Automated node executed action: ${action}.`,
    output: {
      action,
    },
  };
};

const executeEnd: NodeHandler = () => ({
  status: 'success',
  message: 'End node reached. Workflow completed.',
});

const defaultHandler: NodeHandler = () => ({
  status: 'failed',
  message: 'No handler available for this node type.',
});

export const nodeHandlers: Record<SimulationNode['type'], NodeHandler> = {
  Start: executeStart,
  Task: executeTask,
  Approval: executeApproval,
  Automated: executeAutomated,
  End: executeEnd,
};

export const getNodeHandler = (node: SimulationNode): NodeHandler => {
  return nodeHandlers[node.type] ?? defaultHandler;
};
