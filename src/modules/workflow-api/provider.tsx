import { createContext, useContext, type PropsWithChildren } from 'react';

import type { WorkflowApi } from './contracts';

const WorkflowApiContext = createContext<WorkflowApi | null>(null);

export interface WorkflowApiProviderProps extends PropsWithChildren {
  api: WorkflowApi;
}

export const WorkflowApiProvider = ({ api, children }: WorkflowApiProviderProps) => (
  <WorkflowApiContext.Provider value={api}>{children}</WorkflowApiContext.Provider>
);

export const useWorkflowApi = (): WorkflowApi => {
  const api = useContext(WorkflowApiContext);

  if (!api) {
    throw new Error('useWorkflowApi must be used inside WorkflowApiProvider.');
  }

  return api;
};
