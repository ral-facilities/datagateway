/**
 * Defines different types of parameter values.
 */
const PARAMETER_VALUE_TYPE = {
  dateTime: 'dateTime',
  numeric: 'numeric',
  string: 'string',
} as const;

/**
 * Union of all possible types of parameter values.
 */
type ParameterValueType = keyof typeof PARAMETER_VALUE_TYPE;

interface NewParameterValueFilter {
  name: string;

  /**
   * Allow empty string for initial value (i.e. when the user hasn't selected any type).
   */
  valueType: ParameterValueType | '';
}

interface ParameterValueFilter {
  name: string;
  valueType: ParameterValueType;
}

export { PARAMETER_VALUE_TYPE };
export type {
  ParameterValueType,
  ParameterValueFilter,
  NewParameterValueFilter,
};
