import React from 'react';
import {
  Button,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type DatasearchType, SearchFilter } from 'datagateway-common';
import {
  PARAMETER_VALUE_TYPE,
  ParameterValueType,
} from './parameterFilterTypes';
import type ParameterValueSelectorProps from './valueSelectors/parameterValueSelectorProps';
import ParameterNumericRange from './valueSelectors/parameterNumericRange.component';
import ParameterFacetList from './valueSelectors/parameterFacetList.component';
import ParameterDateTimeSelector from './valueSelectors/parameterDateTimeSelector.component';
import { Close } from '@mui/icons-material';

interface NewParameterFilterCreatorProps {
  allIds: number[];
  entityName: DatasearchType;
  parameterNames: string[];
  onAddFilter: (filterKey: string, filterValue: SearchFilter) => void;
  onClose: () => void;
}

interface ParameterValueFacet {
  label: string;
  count: number;
  from?: number;
  to?: number;
}

const PARAMETER_VALUE_SELECTOR: Record<
  ParameterValueType,
  (props: ParameterValueSelectorProps) => JSX.Element
> = {
  [PARAMETER_VALUE_TYPE.dateTime]: ParameterDateTimeSelector,
  [PARAMETER_VALUE_TYPE.string]: ParameterFacetList,
  [PARAMETER_VALUE_TYPE.numeric]: ParameterNumericRange,
};

/**
 * Allows the user to construct a new parameter filter.
 * The creator first shows 2 dropdowns, one for selecting parameter to be filtered by, and the other one for selecting the type of the filter value.
 * Based on the type of the filter value, the creator shows different options that the user can filter the parameter with.
 * For example, if the user selects "number" for the type of the filter value, the creator will let the user specify the range of the filter value.
 * The resulting filter selects only the parameters whose values are within the number range.
 */
function NewParameterFilterCreator({
  allIds,
  entityName,
  parameterNames,
  onAddFilter,
  onClose,
}: NewParameterFilterCreatorProps): JSX.Element {
  const [t] = useTranslation();

  const [parameterName, setParameterName] = React.useState('');
  const [valueType, setValueType] = React.useState<ParameterValueType | ''>('');
  // the search filter object being built by this creator,
  // which varies depending on the parameter name, type, and parameter value that the user chooses.
  const [filterValue, setFilterValue] = React.useState<SearchFilter | null>(
    null
  );

  const resetFilterValue = React.useCallback(() => {
    setFilterValue(null);
  }, []);

  function addFilter(): void {
    if (filterValue) {
      onAddFilter(`${entityName.toLowerCase()}parameter`, filterValue);
    }
  }

  function changeParameterName(selectedName: string): void {
    setParameterName(selectedName);
  }

  function changeValueType(selectedValue: string): void {
    if (selectedValue in PARAMETER_VALUE_TYPE || selectedValue === '') {
      // at the moment the typescript type checker doesn't perform type narrowing
      // in control flows for arbitrary expressions like variables
      // therefore a cast has to be performed here to tell the type checker that this is valid
      // see:
      // https://github.com/microsoft/TypeScript/issues/10530
      // https://stackoverflow.com/questions/64616994/typescript-type-narrowing-not-working-for-in-when-key-is-stored-in-a-variable
      setValueType(selectedValue as ParameterValueType | '');
    }
  }

  function renderValueSelector(): JSX.Element {
    if (!parameterName || !valueType) {
      // cannot render value selector because users haven't selected all the required options

      let helpMessage = '';
      if (!parameterName && !valueType) {
        // both parameter name and parameter type are not selected
        helpMessage = t(
          'parameterFilters.creator.message.parameterNameAndTypeNotSelected'
        );
      } else if (!parameterName) {
        // parameter type selected but parameter name is not selected
        helpMessage = t(
          'parameterFilters.creator.message.parameterNameNotSelected'
        );
      } else if (!valueType) {
        // parameter name selected but parameter type is not selected
        helpMessage = t(
          'parameterFilters.creator.message.parameterTypeNotSelected'
        );
      }

      return <Typography variant="body2">{helpMessage}</Typography>;
    }

    const ParameterValueSelector = PARAMETER_VALUE_SELECTOR[valueType];
    return (
      <ParameterValueSelector
        entityName={entityName}
        parameterName={parameterName}
        allIds={allIds}
        onNewFilter={setFilterValue}
        onResetFilter={resetFilterValue}
      />
    );
  }

  return (
    <Stack sx={{ width: 300, p: 2 }} gap={2} data-testid="new-parameter-filter">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mr: -1 }}
      >
        <Typography variant="subtitle1" gutterBottom={false}>
          {t('parameterFilters.creator.title')}
        </Typography>
        <IconButton
          aria-label={t('parameterFilters.creator.close')}
          size="small"
          onClick={onClose}
        >
          <Close />
        </IconButton>
      </Stack>
      <Stack gap={1}>
        <TextField
          select
          size="small"
          id="parameter-name-select"
          value={parameterName}
          onChange={(e) => changeParameterName(e.target.value)}
          label={t('parameterFilters.creator.labels.parameterNameSelect')}
        >
          {parameterNames.map((param) => (
            <MenuItem key={param} value={param}>
              {param}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          id="parameter-value-type-select"
          label={t('parameterFilters.creator.labels.parameterValueTypeSelect')}
          value={valueType}
          onChange={(e) => changeValueType(e.target.value)}
        >
          {Object.values(PARAMETER_VALUE_TYPE).map((value) => (
            <MenuItem key={value} value={value}>
              {t(`parameterFilters.valueType.${value}`)}
            </MenuItem>
          ))}
        </TextField>
        <Divider sx={{ mt: 1 }} />
      </Stack>
      {renderValueSelector()}
      <Button
        fullWidth
        disableElevation
        disabled={filterValue === null}
        variant="contained"
        onClick={addFilter}
      >
        {t('parameterFilters.creator.addFilter')}
      </Button>
    </Stack>
  );
}

export default NewParameterFilterCreator;
export type { ParameterValueFacet };
