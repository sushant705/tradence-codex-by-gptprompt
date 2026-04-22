import type { WorkflowApi } from './contracts';
import type { AutomationSummary, AutomationsResponse, SimulateRequest, SimulateResponse } from './types';

const BASE_DELAY_MS = 250;
const RANDOM_DELAY_RANGE_MS = 550;

const nowIso = (): string => new Date().toISOString();

const randomDelayMs = (): number => BASE_DELAY_MS + Math.floor(Math.random() * RANDOM_DELAY_RANGE_MS);

const wait = async (durationMs: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });
};

const mockAutomations: AutomationSummary[] = [
  {
    id: 'aut_001',
    name: 'Employee Onboarding',
    version: 6,
    status: 'published',
    updatedAt: '2026-04-18T08:12:00.000Z',
  },
  {
    id: 'aut_002',
    name: 'Invoice Approval',
    version: 3,
    status: 'draft',
    updatedAt: '2026-04-21T13:45:00.000Z',
  },
  {
    id: 'aut_003',
    name: 'Customer Escalation',
    version: 12,
    status: 'published',
    updatedAt: '2026-04-20T16:03:00.000Z',
  },
];

const buildSimulation = (request: SimulateRequest): SimulateResponse => {
  const startedAt = nowIso();
  const endedAt = nowIso();

  return {
    runId: `sim_${Math.random().toString(36).slice(2, 10)}`,
    automationId: request.automationId,
    startedAt,
    endedAt,
    status: 'success',
    output: {
      receivedInput: request.input,
      result: 'Simulation completed successfully',
    },
    steps: [
      {
        nodeId: 'node_start',
        nodeType: 'Start',
        status: 'success',
        startedAt,
        endedAt,
      },
      {
        nodeId: 'node_task',
        nodeType: 'Task',
        status: 'success',
        startedAt,
        endedAt,
      },
      {
        nodeId: 'node_end',
        nodeType: 'End',
        status: 'success',
        startedAt,
        endedAt,
      },
    ],
  };
};

export class MockWorkflowApi implements WorkflowApi {
  async getAutomations(): Promise<AutomationsResponse> {
    await wait(randomDelayMs());

    return {
      items: mockAutomations,
      total: mockAutomations.length,
    };
  }

  async simulateAutomation(request: SimulateRequest): Promise<SimulateResponse> {
    await wait(randomDelayMs());

    return buildSimulation(request);
  }
}
