import { useCallback, useEffect, useState } from 'react';

import { useWorkflowApi } from './provider';
import type { AutomationSummary, SimulateRequest, SimulateResponse } from './types';

export interface UseAutomationsResult {
  automations: AutomationSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useAutomations = (): UseAutomationsResult => {
  const api = useWorkflowApi();
  const [automations, setAutomations] = useState<AutomationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getAutomations();
      setAutomations(response.items);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'Failed to load automations.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    automations,
    loading,
    error,
    refresh: load,
  };
};

export interface UseSimulationResult {
  simulate: (request: SimulateRequest) => Promise<SimulateResponse | null>;
  loading: boolean;
  error: string | null;
  lastRun: SimulateResponse | null;
}

export const useSimulation = (): UseSimulationResult => {
  const api = useWorkflowApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<SimulateResponse | null>(null);

  const simulate = useCallback(async (request: SimulateRequest): Promise<SimulateResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.simulateAutomation(request);
      setLastRun(response);
      return response;
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : 'Simulation failed.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    simulate,
    loading,
    error,
    lastRun,
  };
};
