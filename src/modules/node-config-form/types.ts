import type { WorkflowNodeKind } from '../workflow-canvas';

export type NodeConfigValue = string | number | boolean | null;
export type NodeConfigValues = Record<string, NodeConfigValue>;

export interface DynamicFieldContext {
  nodeType: WorkflowNodeKind;
  values: NodeConfigValues;
}

export interface FieldOption {
  label: string;
  value: string;
}

export type FieldOptionsSource =
  | { type: 'static'; options: FieldOption[] }
  | { type: 'async'; load: (context: DynamicFieldContext) => Promise<FieldOption[]> };

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: NodeConfigValue, values: NodeConfigValues) => string | null;
}

interface BaseFieldSchema<TType extends string> {
  id: string;
  type: TType;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: NodeConfigValue;
  disabled?: boolean;
  visibleWhen?: (values: NodeConfigValues) => boolean;
  validation?: ValidationRule;
}

export interface TextFieldSchema extends BaseFieldSchema<'text' | 'textarea'> {}

export interface NumberFieldSchema extends BaseFieldSchema<'number'> {
  step?: number;
}

export interface ToggleFieldSchema extends BaseFieldSchema<'toggle'> {}

export interface SelectFieldSchema extends BaseFieldSchema<'select'> {
  options: FieldOptionsSource;
}

export type FieldSchema =
  | TextFieldSchema
  | NumberFieldSchema
  | ToggleFieldSchema
  | SelectFieldSchema;

export interface DynamicFieldResolver {
  id: string;
  load: (context: DynamicFieldContext) => Promise<FieldSchema[]>;
}

export interface NodeFormSchema {
  nodeType: WorkflowNodeKind;
  fields: FieldSchema[];
  dynamicFieldResolvers?: DynamicFieldResolver[];
}

export interface FormFieldState {
  field: FieldSchema;
  options?: FieldOption[];
  loadingOptions?: boolean;
}

export type ValidationErrors = Record<string, string>;
