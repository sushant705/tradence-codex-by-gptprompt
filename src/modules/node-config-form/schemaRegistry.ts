import type { WorkflowNodeKind } from '../workflow-canvas';
import type { NodeFormSchema } from './types';

type NodeSchemaFactory = () => NodeFormSchema;

export class NodeFormSchemaRegistry {
  private readonly schemaFactories = new Map<WorkflowNodeKind, NodeSchemaFactory>();

  register(nodeType: WorkflowNodeKind, factory: NodeSchemaFactory): void {
    this.schemaFactories.set(nodeType, factory);
  }

  get(nodeType: WorkflowNodeKind): NodeFormSchema {
    const factory = this.schemaFactories.get(nodeType);

    if (!factory) {
      throw new Error(`No form schema registered for node type: ${nodeType}`);
    }

    return factory();
  }
}

export const createDefaultNodeFormSchemaRegistry = (): NodeFormSchemaRegistry => {
  const registry = new NodeFormSchemaRegistry();

  registry.register('Start', () => ({
    nodeType: 'Start',
    fields: [
      {
        id: 'trigger',
        type: 'select',
        label: 'Trigger',
        defaultValue: 'manual',
        options: {
          type: 'static',
          options: [
            { label: 'Manual', value: 'manual' },
            { label: 'Schedule', value: 'schedule' },
            { label: 'Event', value: 'event' },
          ],
        },
        validation: { required: true },
      },
      {
        id: 'scheduleCron',
        type: 'text',
        label: 'Cron Expression',
        placeholder: '0 * * * *',
        visibleWhen: (values) => values.trigger === 'schedule',
        validation: {
          custom: (value, values) => {
            if (values.trigger !== 'schedule') {
              return null;
            }

            if (!value || String(value).trim() === '') {
              return 'Cron expression is required for schedule trigger.';
            }

            return null;
          },
        },
      },
    ],
  }));

  registry.register('Task', () => ({
    nodeType: 'Task',
    fields: [
      {
        id: 'title',
        type: 'text',
        label: 'Task Title',
        validation: { required: true },
      },
      {
        id: 'instructions',
        type: 'textarea',
        label: 'Instructions',
      },
      {
        id: 'priority',
        type: 'select',
        label: 'Priority',
        defaultValue: 'medium',
        options: {
          type: 'static',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ],
        },
      },
    ],
  }));

  registry.register('Approval', () => ({
    nodeType: 'Approval',
    fields: [
      {
        id: 'mode',
        type: 'select',
        label: 'Approval Mode',
        defaultValue: 'single',
        options: {
          type: 'static',
          options: [
            { label: 'Single Approver', value: 'single' },
            { label: 'All Approvers', value: 'all' },
            { label: 'Majority', value: 'majority' },
          ],
        },
        validation: { required: true },
      },
      {
        id: 'minApprovals',
        type: 'number',
        label: 'Minimum Approvals',
        defaultValue: 1,
        visibleWhen: (values) => values.mode === 'majority',
        validation: {
          min: 1,
          custom: (value, values) => {
            if (values.mode !== 'majority') {
              return null;
            }
            if (typeof value !== 'number' || value < 1) {
              return 'Minimum approvals must be at least 1 for majority mode.';
            }
            return null;
          },
        },
      },
    ],
  }));

  registry.register('Automated', () => ({
    nodeType: 'Automated',
    fields: [
      {
        id: 'actionType',
        type: 'select',
        label: 'Action Type',
        defaultValue: 'http',
        options: {
          type: 'static',
          options: [
            { label: 'HTTP', value: 'http' },
            { label: 'Integration', value: 'integration' },
          ],
        },
        validation: { required: true },
      },
      {
        id: 'timeoutMs',
        type: 'number',
        label: 'Timeout (ms)',
        defaultValue: 30000,
        step: 100,
        validation: { min: 100, required: true },
      },
    ],
    dynamicFieldResolvers: [
      {
        id: 'integration-params',
        load: async (context) => {
          if (context.values.actionType !== 'integration') {
            return [];
          }

          return [
            {
              id: 'integrationProvider',
              type: 'select',
              label: 'Provider',
              options: {
                type: 'async',
                load: async () => [
                  { label: 'Slack', value: 'slack' },
                  { label: 'Salesforce', value: 'salesforce' },
                ],
              },
              validation: { required: true },
            },
            {
              id: 'operation',
              type: 'text',
              label: 'Operation',
              placeholder: 'create_record',
              validation: { required: true },
            },
          ];
        },
      },
    ],
  }));

  registry.register('End', () => ({
    nodeType: 'End',
    fields: [
      {
        id: 'terminalStatus',
        type: 'select',
        label: 'Terminal Status',
        defaultValue: 'completed',
        options: {
          type: 'static',
          options: [
            { label: 'Completed', value: 'completed' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Failed', value: 'failed' },
          ],
        },
        validation: { required: true },
      },
    ],
  }));

  return registry;
};
