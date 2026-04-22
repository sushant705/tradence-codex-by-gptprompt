import { useCallback, useRef } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from 'reactflow';

import type {
  AddNodeInput,
  UseWorkflowCanvasOptions,
  UseWorkflowCanvasResult,
  WorkflowCanvasEdge,
  WorkflowCanvasNode,
} from './types';

const DEFAULT_NODE_POSITION = { x: 120, y: 120 } as const;

const createNodeIdFactory = () => {
  let sequence = 0;

  return () => {
    sequence += 1;
    return `node_${sequence}`;
  };
};

const createEdgeId = (source: string, target: string) => `${source}->${target}`;

export const useWorkflowCanvas = (
  options: UseWorkflowCanvasOptions = {},
): UseWorkflowCanvasResult => {
  const [nodes, setNodes] = useNodesState(options.initialNodes ?? []);
  const [edges, setEdges] = useEdgesState(options.initialEdges ?? []);
  const nextNodeIdRef = useRef<() => string>(createNodeIdFactory());

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes));
  }, [setNodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
  }, [setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) {
      return;
    }

    setEdges((currentEdges) =>
      addEdge(
        {
          ...connection,
          id: createEdgeId(connection.source, connection.target),
        },
        currentEdges,
      ),
    );
  }, [setEdges]);

  const addNode = useCallback((input: AddNodeInput): WorkflowCanvasNode => {
    const node: WorkflowCanvasNode = {
      id: nextNodeIdRef.current(),
      type: 'default',
      position: input.position ?? DEFAULT_NODE_POSITION,
      data: {
        label: input.label,
        kind: input.kind,
      },
    };

    setNodes((currentNodes) => [...currentNodes, node]);
    return node;
  }, [setNodes]);

  const deleteNodes = useCallback((nodeIds: string[]) => {
    const ids = new Set(nodeIds);
    setNodes((currentNodes) => currentNodes.filter((node) => !ids.has(node.id)));
    setEdges((currentEdges) =>
      currentEdges.filter((edge) => !ids.has(edge.source) && !ids.has(edge.target)),
    );
  }, [setEdges, setNodes]);

  const deleteEdges = useCallback((edgeIds: string[]) => {
    const ids = new Set(edgeIds);
    setEdges((currentEdges) => currentEdges.filter((edge) => !ids.has(edge.id)));
  }, [setEdges]);

  const onNodesDelete = useCallback((deletedNodes: WorkflowCanvasNode[]) => {
    deleteNodes(deletedNodes.map((node) => node.id));
  }, [deleteNodes]);

  const onEdgesDelete = useCallback((deletedEdges: WorkflowCanvasEdge[]) => {
    deleteEdges(deletedEdges.map((edge) => edge.id));
  }, [deleteEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodesDelete,
    onEdgesDelete,
    addNode,
    deleteNodes,
    deleteEdges,
    setNodes,
    setEdges,
  };
};
