import type { WorkflowApi } from './contracts';
import type { AutomationsResponse, SimulateRequest, SimulateResponse } from './types';

export class HttpWorkflowApi implements WorkflowApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAutomations(): Promise<AutomationsResponse> {
    const response = await fetch(`${this.baseUrl}/automations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch automations: ${response.status}`);
    }

    return response.json() as Promise<AutomationsResponse>;
  }

  async simulateAutomation(request: SimulateRequest): Promise<SimulateResponse> {
    const response = await fetch(`${this.baseUrl}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to simulate automation: ${response.status}`);
    }

    return response.json() as Promise<SimulateResponse>;
  }
}
