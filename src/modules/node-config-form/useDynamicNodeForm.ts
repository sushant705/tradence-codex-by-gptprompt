import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import type {
  FieldSchema,
  FormFieldState,
  NodeConfigValue,
  NodeConfigValues,
  NodeFormSchema,
  ValidationErrors,
} from './types';

const coerceDefaultValue = (field: FieldSchema): NodeConfigValue => {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  switch (field.type) {
    case 'toggle':
      return false;
    case 'number':
      return 0;
    default:
      return '';
  }
};

const resolveFieldError = (field: FieldSchema, value: NodeConfigValue, values: NodeConfigValues): string | null => {
  const rules = field.validation;

  if (!rules) {
    return null;
  }

  if (rules.required) {
    const isEmptyString = typeof value === 'string' && value.trim().length === 0;
    if (value === null || value === undefined || isEmptyString) {
      return `${field.label} is required.`;
    }
  }

  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `${field.label} must be greater than or equal to ${rules.min}.`;
    }
    if (rules.max !== undefined && value > rules.max) {
      return `${field.label} must be less than or equal to ${rules.max}.`;
    }
  }

  if (typeof value === 'string' && rules.pattern && !rules.pattern.test(value)) {
    return `${field.label} has an invalid format.`;
  }

  if (rules.custom) {
    return rules.custom(value, values);
  }

  return null;
};

export interface UseDynamicNodeFormOptions {
  schema: NodeFormSchema;
  initialValues?: NodeConfigValues;
  onSubmit?: (values: NodeConfigValues) => void;
}

export interface UseDynamicNodeFormResult {
  values: NodeConfigValues;
  errors: ValidationErrors;
  fields: FormFieldState[];
  setValue: (fieldId: string, value: NodeConfigValue) => void;
  validate: () => boolean;
  handleSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  isFieldVisible: (field: FieldSchema) => boolean;
}

export const useDynamicNodeForm = ({
  schema,
  initialValues,
  onSubmit,
}: UseDynamicNodeFormOptions): UseDynamicNodeFormResult => {
  const initialState = useMemo<NodeConfigValues>(() => {
    const base = schema.fields.reduce<NodeConfigValues>((accumulator, field) => {
      accumulator[field.id] = coerceDefaultValue(field);
      return accumulator;
    }, {});

    return {
      ...base,
      ...initialValues,
    };
  }, [schema.fields, initialValues]);

  const [values, setValues] = useState<NodeConfigValues>(initialState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [dynamicFields, setDynamicFields] = useState<FieldSchema[]>([]);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { loading: boolean; options: { label: string; value: string }[] }>>({});

  useEffect(() => {
    setValues(initialState);
    setErrors({});
    setDynamicFields([]);
  }, [initialState]);

  useEffect(() => {
    let cancelled = false;

    const loadDynamicFields = async (): Promise<void> => {
      if (!schema.dynamicFieldResolvers || schema.dynamicFieldResolvers.length === 0) {
        return;
      }

      const fields = await Promise.all(
        schema.dynamicFieldResolvers.map((resolver) =>
          resolver.load({
            nodeType: schema.nodeType,
            values,
          }),
        ),
      );

      if (!cancelled) {
        setDynamicFields(fields.flat());
      }
    };

    void loadDynamicFields();

    return () => {
      cancelled = true;
    };
  }, [schema.dynamicFieldResolvers, schema.nodeType, values]);

  const mergedFields = useMemo(() => [...schema.fields, ...dynamicFields], [schema.fields, dynamicFields]);

  useEffect(() => {
    const loadAsyncOptions = async (): Promise<void> => {
      const optionFields = mergedFields.filter(
        (field): field is Extract<FieldSchema, { type: 'select' }> => field.type === 'select' && field.options.type === 'async',
      );

      await Promise.all(optionFields.map(async (field) => {
        setDynamicOptions((current) => ({
          ...current,
          [field.id]: {
            loading: true,
            options: current[field.id]?.options ?? [],
          },
        }));

        const options = await field.options.load({ nodeType: schema.nodeType, values });

        setDynamicOptions((current) => ({
          ...current,
          [field.id]: {
            loading: false,
            options,
          },
        }));
      }));
    };

    void loadAsyncOptions();
  }, [mergedFields, schema.nodeType, values]);

  const setValue = useCallback((fieldId: string, value: NodeConfigValue) => {
    setValues((currentValues) => ({
      ...currentValues,
      [fieldId]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[fieldId]) {
        return currentErrors;
      }

      const { [fieldId]: _, ...rest } = currentErrors;
      return rest;
    });
  }, []);

  const isFieldVisible = useCallback((field: FieldSchema): boolean => {
    if (!field.visibleWhen) {
      return true;
    }

    return field.visibleWhen(values);
  }, [values]);

  const validate = useCallback((): boolean => {
    const nextErrors: ValidationErrors = {};

    mergedFields.forEach((field) => {
      if (!isFieldVisible(field)) {
        return;
      }

      const value = values[field.id];
      const error = resolveFieldError(field, value, values);

      if (error) {
        nextErrors[field.id] = error;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [isFieldVisible, mergedFields, values]);

  const handleSubmit = useCallback((event?: FormEvent<HTMLFormElement>): void => {
    event?.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit?.(values);
  }, [onSubmit, validate, values]);

  const fields = useMemo<FormFieldState[]>(() => mergedFields.map((field) => {
    if (field.type !== 'select') {
      return { field };
    }

    if (field.options.type === 'static') {
      return {
        field,
        options: field.options.options,
      };
    }

    const dynamicState = dynamicOptions[field.id];

    return {
      field,
      options: dynamicState?.options ?? [],
      loadingOptions: dynamicState?.loading ?? false,
    };
  }), [dynamicOptions, mergedFields]);

  return {
    values,
    errors,
    fields,
    setValue,
    validate,
    handleSubmit,
    isFieldVisible,
  };
};
