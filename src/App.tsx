import { useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';

import { DynamicNodeConfigForm, createDefaultNodeFormSchemaRegistry } from './modules/node-config-form';
import { WorkflowApiProvider, createWorkflowApi, useAutomations, useSimulation } from './modules/workflow-api';
import { WorkflowCanvas, useWorkflowCanvas } from './modules/workflow-canvas';
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

const Dashboard = () => {
  const canvas = useWorkflowCanvas({
    initialNodes: [
      { id: 'start', type: 'default', position: { x: 50, y: 120 }, data: { label: 'Start', kind: 'Start' } },
      { id: 'task', type: 'default', position: { x: 260, y: 120 }, data: { label: 'Task', kind: 'Task' } },
      { id: 'end', type: 'default', position: { x: 470, y: 120 }, data: { label: 'End', kind: 'End' } },
    ],
    initialEdges: [
      { id: 'start-task', source: 'start', target: 'task' },
      { id: 'task-end', source: 'task', target: 'end' },
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
    <main className="app-shell">
      <header className="app-header">
        <h1>Workflow Designer System</h1>
        <p>Runnable scaffold wired to existing modules (canvas, forms, API, simulation).</p>
      </header>

      <section className="card">
        <h2>Workflow Canvas</h2>
        <div className="canvas-wrap">
          <WorkflowCanvas state={canvas} />
        </div>
      </section>

      <section className="grid-two">
        <article className="card">
          <h2>Dynamic Node Config Form</h2>
          <DynamicNodeConfigForm
            schema={registry.get('Task')}
            onSubmit={(values) => {
              console.log('Saved node config:', values);
            }}
          />
        </article>

        <article className="card">
          <h2>Mock API</h2>
          <p>Automations loaded: {loadingAutomations ? 'Loading...' : automations.length}</p>
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
          {lastRun ? <pre>{JSON.stringify(lastRun, null, 2)}</pre> : null}
        </article>
      </section>

      <section className="card">
        <h2>Local Simulation Engine</h2>
        <pre>{JSON.stringify(simulationPreview, null, 2)}</pre>
      </section>
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
