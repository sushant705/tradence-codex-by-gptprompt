import type { AutomationsResponse, SimulateRequest, SimulateResponse } from './types';

export interface WorkflowApi {
  getAutomations(): Promise<AutomationsResponse>;
  simulateAutomation(request: SimulateRequest): Promise<SimulateResponse>;
}

export interface WorkflowApiFactoryOptions {
  mode: 'mock' | 'http';
  baseUrl?: string;
}
