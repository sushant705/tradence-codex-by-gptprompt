import { memo, useMemo } from 'react';
import {
  Handle,
  Position,
  ReactFlowProvider,
  type NodeProps,
  type NodeTypes,
} from 'reactflow';

import { DynamicNodeConfigForm, createDefaultNodeFormSchemaRegistry } from './modules/node-config-form';
import { WorkflowApiProvider, createWorkflowApi, useAutomations, useSimulation } from './modules/workflow-api';
import { WorkflowCanvas, useWorkflowCanvas } from './modules/workflow-canvas';
import type { WorkflowNodeData } from './modules/workflow-canvas';
import { simulateWorkflow } from './modules/workflow-simulation';

const registry = createDefaultNodeFormSchemaRegistry();

const workflowGraph = {
  nodes: [
    { id: 'n1', type: 'Start' as const },
    { id: 'n2', type: 'Task' as const, data: { label: 'Review request' } },
    { id: 'n3', type: 'End' as const },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' },
    { id: 'e2', source: 'n2', target: 'n3' },
  ],
};

const NODE_ACCENT: Record<WorkflowNodeData['kind'], string> = {
  Start: '#3b82f6',
  Task: '#8b5cf6',
  Approval: '#10b981',
  Automated: '#f59e0b',
  End: '#ef4444',
};

const DesignerNode = memo(({ data }: NodeProps<WorkflowNodeData>) => {
  const accent = NODE_ACCENT[data.kind] ?? '#3b82f6';

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <article className="designer-node" style={{ borderColor: accent }}>
        <p className="designer-node__kind" style={{ color: accent }}>{data.kind}</p>
        <h4>{data.label}</h4>
        <p className="designer-node__meta">Automations • Metrics • Status</p>
      </article>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

const nodeTypes: NodeTypes = {
  designer: DesignerNode,
};

const Dashboard = () => {
  const canvas = useWorkflowCanvas({
    initialNodes: [
      {
        id: 'start',
        type: 'designer',
        position: { x: 120, y: 70 },
        data: { label: 'User Initialization', kind: 'Start' },
      },
      {
        id: 'task-1',
        type: 'designer',
        position: { x: 450, y: 180 },
        data: { label: 'Data Collection', kind: 'Task' },
      },
      {
        id: 'task-2',
        type: 'designer',
        position: { x: 450, y: 360 },
        data: { label: 'Validation', kind: 'Automated' },
      },
      {
        id: 'approval',
        type: 'designer',
        position: { x: 760, y: 260 },
        data: { label: 'Manager Approval', kind: 'Approval' },
      },
      {
        id: 'end',
        type: 'designer',
        position: { x: 1050, y: 260 },
        data: { label: 'Action Complete', kind: 'End' },
      },
    ],
    initialEdges: [
      { id: 'start-task1', source: 'start', target: 'task-1', animated: true, style: { stroke: '#3b82f6' } },
      { id: 'task1-task2', source: 'task-1', target: 'task-2', animated: true, style: { stroke: '#8b5cf6' } },
      { id: 'task2-approval', source: 'task-2', target: 'approval', animated: true, style: { stroke: '#10b981' } },
      { id: 'approval-end', source: 'approval', target: 'end', animated: true, style: { stroke: '#ef4444' } },
    ],
  });

  const { automations, loading: loadingAutomations } = useAutomations();
  const { simulate, loading: runningSimulation, lastRun } = useSimulation();

  const simulationPreview = useMemo(
    () =>
      simulateWorkflow(workflowGraph, {
        input: { approved: true },
      }),
    [],
  );

  return (
    <main className="designer-layout">
      <aside className="left-rail panel">
        <h2 className="panel-title">CodeAuto</h2>
        <nav>
          <button type="button" className="rail-link rail-link--active">Dashboard</button>
          <button type="button" className="rail-link">Templates</button>
          <button type="button" className="rail-link">Scheduler</button>
          <button type="button" className="rail-link">Analytics</button>
          <button type="button" className="rail-link">Messages</button>
        </nav>
      </aside>

      <section className="workspace panel">
        <header className="workspace-header">
          <div>
            <h1>Workflow Analytics Studio</h1>
            <p>Design, simulate, and monitor automation workflows.</p>
          </div>
          <div className="toolbar-actions">
            <button type="button" className="ghost-btn">Share</button>
            <button type="button">Deploy</button>
          </div>
        </header>

        <div className="canvas-shell">
          <WorkflowCanvas state={canvas} nodeTypes={nodeTypes} />
        </div>
      </section>

      <aside className="right-rail panel">
        <section className="insight-card">
          <h3>Automation Coverage</h3>
          <p>{loadingAutomations ? 'Loading…' : `${automations.length} active workflows`}</p>
          <button
            type="button"
            disabled={runningSimulation}
            onClick={() =>
              void simulate({
                automationId: automations[0]?.id ?? 'aut_001',
                input: { actor: 'demo-user' },
              })
            }
          >
            {runningSimulation ? 'Running...' : 'Run /simulate'}
          </button>
        </section>

        <section className="insight-card">
          <h3>Node Configuration</h3>
          <DynamicNodeConfigForm
            schema={registry.get('Task')}
            onSubmit={(values) => {
              console.log('Saved node config:', values);
            }}
          />
        </section>

        <section className="insight-card">
          <h3>Simulation Output</h3>
          <pre>{JSON.stringify(lastRun ?? simulationPreview, null, 2)}</pre>
        </section>
      </aside>
    </main>
  );
};

export const App = () => {
  const api = useMemo(() => createWorkflowApi({ mode: 'mock' }), []);

  return (
    <WorkflowApiProvider api={api}>
      <ReactFlowProvider>
        <Dashboard />
      </ReactFlowProvider>
    </WorkflowApiProvider>
  );
};
