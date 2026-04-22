import { memo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type EdgeTypes,
  type FitViewOptions,
  type NodeTypes,
} from 'reactflow';

import type { UseWorkflowCanvasResult } from './types';

const DEFAULT_FIT_VIEW_OPTIONS: FitViewOptions = {
  padding: 0.2,
};

export interface WorkflowCanvasProps {
  state: UseWorkflowCanvasResult;
  fitView?: boolean;
  nodeTypes?: NodeTypes;
  edgeTypes?: EdgeTypes;
}

const WorkflowCanvasComponent = ({
  state,
  fitView = true,
  nodeTypes,
  edgeTypes,
}: WorkflowCanvasProps) => (
  <ReactFlow
    nodes={state.nodes}
    edges={state.edges}
    nodeTypes={nodeTypes}
    edgeTypes={edgeTypes}
    onNodesChange={state.onNodesChange}
    onEdgesChange={state.onEdgesChange}
    onConnect={state.onConnect}
    onNodesDelete={state.onNodesDelete}
    onEdgesDelete={state.onEdgesDelete}
    fitView={fitView}
    fitViewOptions={DEFAULT_FIT_VIEW_OPTIONS}
    deleteKeyCode={['Backspace', 'Delete']}
  >
    <MiniMap pannable zoomable />
    <Controls />
    <Background gap={24} />
  </ReactFlow>
);

export const WorkflowCanvas = memo(WorkflowCanvasComponent);
