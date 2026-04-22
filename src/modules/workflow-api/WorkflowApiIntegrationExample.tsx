import { useMemo } from 'react';

import { createWorkflowApi } from './factory';
import { useAutomations, useSimulation } from './hooks';
import { WorkflowApiProvider } from './provider';

const AutomationsPanel = () => {
  const { automations, loading, error, refresh } = useAutomations();
  const { simulate, loading: simulationLoading, error: simulationError, lastRun } = useSimulation();

  const onRunSimulation = async (automationId: string): Promise<void> => {
    await simulate({
      automationId,
      input: {
        actor: 'demo-user',
        amount: 1250,
      },
    });
  };

  return (
    <section>
      <h2>Automations</h2>
      {loading ? <p>Loading automations...</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      <button type="button" onClick={() => void refresh()}>
        Refresh
      </button>

      <ul>
        {automations.map((automation) => (
          <li key={automation.id}>
            <strong>{automation.name}</strong> (v{automation.version})
            <button type="button" disabled={simulationLoading} onClick={() => void onRunSimulation(automation.id)}>
              Simulate
            </button>
          </li>
        ))}
      </ul>

      {simulationError ? <p role="alert">{simulationError}</p> : null}
      {lastRun ? <pre>{JSON.stringify(lastRun, null, 2)}</pre> : null}
    </section>
  );
};

export const WorkflowApiIntegrationExample = () => {
  const api = useMemo(() => createWorkflowApi({ mode: 'mock' }), []);

  return (
    <WorkflowApiProvider api={api}>
      <AutomationsPanel />
    </WorkflowApiProvider>
  );
};
