import { memo } from 'react';

import type { FieldSchema, NodeConfigValue } from './types';

export interface FieldRendererProps {
  field: FieldSchema;
  value: NodeConfigValue;
  error?: string;
  options?: { label: string; value: string }[];
  loadingOptions?: boolean;
  onValueChange: (fieldId: string, value: NodeConfigValue) => void;
}

const toStringValue = (value: NodeConfigValue): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
};

const FieldRendererComponent = ({
  field,
  value,
  error,
  options,
  loadingOptions,
  onValueChange,
}: FieldRendererProps) => {
  const fieldId = `node-config-${field.id}`;

  return (
    <div>
      <label htmlFor={fieldId}>{field.label}</label>
      {field.description ? <p>{field.description}</p> : null}

      {field.type === 'text' || field.type === 'textarea' ? (
        field.type === 'textarea' ? (
          <textarea
            id={fieldId}
            value={toStringValue(value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            onChange={(event) => onValueChange(field.id, event.target.value)}
          />
        ) : (
          <input
            id={fieldId}
            type="text"
            value={toStringValue(value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            onChange={(event) => onValueChange(field.id, event.target.value)}
          />
        )
      ) : null}

      {field.type === 'number' ? (
        <input
          id={fieldId}
          type="number"
          step={field.step}
          value={typeof value === 'number' ? value : 0}
          placeholder={field.placeholder}
          disabled={field.disabled}
          onChange={(event) => onValueChange(field.id, Number(event.target.value))}
        />
      ) : null}

      {field.type === 'toggle' ? (
        <input
          id={fieldId}
          type="checkbox"
          checked={Boolean(value)}
          disabled={field.disabled}
          onChange={(event) => onValueChange(field.id, event.target.checked)}
        />
      ) : null}

      {field.type === 'select' ? (
        <select
          id={fieldId}
          value={toStringValue(value)}
          disabled={field.disabled || loadingOptions}
          onChange={(event) => onValueChange(field.id, event.target.value)}
        >
          <option value="">Select an option</option>
          {(options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {loadingOptions ? <p>Loading options...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
};

export const FieldRenderer = memo(FieldRendererComponent);
