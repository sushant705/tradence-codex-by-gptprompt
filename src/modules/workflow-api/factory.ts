import type { WorkflowApi, WorkflowApiFactoryOptions } from './contracts';
import { HttpWorkflowApi } from './httpWorkflowApi';
import { MockWorkflowApi } from './mockWorkflowApi';

export const createWorkflowApi = (options: WorkflowApiFactoryOptions): WorkflowApi => {
  if (options.mode === 'mock') {
    return new MockWorkflowApi();
  }

  if (!options.baseUrl) {
    throw new Error('baseUrl is required when mode is "http".');
  }

  return new HttpWorkflowApi(options.baseUrl);
};
