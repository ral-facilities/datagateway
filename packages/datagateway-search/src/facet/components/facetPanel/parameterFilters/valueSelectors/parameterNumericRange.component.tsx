import React from 'react';
import { Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type ParameterValueSelectorProps from './parameterValueSelectorProps';

function ParameterNumericRange({
  entityName,
  parameterName,
  onNewFilter,
  onResetFilter,
}: ParameterValueSelectorProps): JSX.Element {
  const [t] = useTranslation();

  const [units, setUnits] = React.useState('');
  const [min, setMin] = React.useState<string>('');
  const [max, setMax] = React.useState<string>('');

  const applyRange = React.useCallback(() => {
    const minNum = Number(min);
    const maxNum = Number(max);

    if (minNum > maxNum || maxNum < minNum) {
      onResetFilter();
      return;
    }

    const label =
      units === '' ? `${min} to ${max}` : `${min} to ${max} (${units})`;
    const filter =
      units === ''
        ? {
            field: 'numericValue',
            from: Number(min),
            to: Number(max),
            key: label,
          }
        : {
            units,
            field: 'numericValue',
            from: Number(min),
            to: Number(max),
            key: label,
          };

    onNewFilter({
      label,
      key: `${entityName}Parameter.numericValue.${parameterName}`,
      filter: [filter, { field: 'type.name', value: parameterName }],
    });
  }, [entityName, max, min, onNewFilter, onResetFilter, parameterName, units]);

  React.useEffect(() => {
    if (min === '' || max === '') {
      onResetFilter();
    } else if (!Number.isNaN(Number(min)) && !Number.isNaN(Number(max))) {
      applyRange();
    }
  }, [min, max, applyRange, onResetFilter]);

  const onUnitsChange = (event: React.ChangeEvent<{ value: string }>): void => {
    setUnits(event.target.value);
  };

  const onMinChange = (event: React.ChangeEvent<{ value: string }>): void => {
    setMin(event.target.value);
  };

  const onMaxChange = (event: React.ChangeEvent<{ value: string }>): void => {
    setMax(event.target.value);
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      gap={1}
      sx={{ marginBottom: 0 }}
      data-testid="parameter-numeric-range-selector"
    >
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        type="number"
        label={t('parameterFilters.creator.labels.parameterNumericRange.min')}
        id="parameter-numeric-range-min"
        value={min}
        inputProps={{
          max: Number(max),
        }}
        aria-valuemax={Number(max)}
        onChange={onMinChange}
        color="secondary"
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        type="number"
        label={t('parameterFilters.creator.labels.parameterNumericRange.max')}
        id="parameter-numeric-range-max"
        aria-valuemin={Number(min)}
        value={max}
        inputProps={{
          min: Number(min),
        }}
        onChange={onMaxChange}
        color="secondary"
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label={t('parameterFilters.creator.labels.parameterNumericRange.unit')}
        id="parameter-numeric-range-unit"
        value={units}
        onChange={onUnitsChange}
        color="secondary"
      />
    </Stack>
  );
}

export default ParameterNumericRange;
