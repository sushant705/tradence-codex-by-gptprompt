import { memo } from 'react';

import { FieldRenderer } from './FieldRenderer';
import { useDynamicNodeForm, type UseDynamicNodeFormOptions } from './useDynamicNodeForm';

export interface DynamicNodeConfigFormProps extends UseDynamicNodeFormOptions {
  submitLabel?: string;
}

const DynamicNodeConfigFormComponent = ({
  schema,
  initialValues,
  onSubmit,
  submitLabel = 'Save',
}: DynamicNodeConfigFormProps) => {
  const form = useDynamicNodeForm({
    schema,
    initialValues,
    onSubmit,
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {form.fields
        .filter(({ field }) => form.isFieldVisible(field))
        .map(({ field, options, loadingOptions }) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={form.values[field.id]}
            error={form.errors[field.id]}
            options={options}
            loadingOptions={loadingOptions}
            onValueChange={form.setValue}
          />
        ))}
      <button type="submit">{submitLabel}</button>
    </form>
  );
};

export const DynamicNodeConfigForm = memo(DynamicNodeConfigFormComponent);
