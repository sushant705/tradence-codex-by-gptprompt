export type AutomationStatus = 'draft' | 'published' | 'archived';

export interface AutomationSummary {
  id: string;
  name: string;
  version: number;
  status: AutomationStatus;
  updatedAt: string;
}

export interface AutomationsResponse {
  items: AutomationSummary[];
  total: number;
}

export interface SimulateRequest {
  automationId: string;
  input: Record<string, unknown>;
}

export type SimulationStepStatus = 'success' | 'failed' | 'skipped';

export interface SimulationStep {
  nodeId: string;
  nodeType: string;
  status: SimulationStepStatus;
  startedAt: string;
  endedAt: string;
  message?: string;
}

export interface SimulateResponse {
  runId: string;
  automationId: string;
  startedAt: string;
  endedAt: string;
  status: 'success' | 'failed';
  output: Record<string, unknown>;
  steps: SimulationStep[];
}
