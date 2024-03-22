import type { DatasearchType, SearchFilter } from 'datagateway-common';

interface ParameterValueSelectorProps {
  entityName: DatasearchType;
  parameterName: string;
  allIds: number[];

  /**
   * Called when the selector creates a new filter from the value selected.
   * @param newFilter The search filter created based on the selected value.
   *        When performing a search with the filter, only parameters that match the selected value will be selected.
   */
  onNewFilter: (newFilter: SearchFilter) => void;

  /**
   * Called when the selector wants to reset the filter created previously.
   * This can happen, for example, when the selector is now in an invalid state, and the previous filter should not be used.
   */
  onResetFilter: () => void;
}

export default ParameterValueSelectorProps;
