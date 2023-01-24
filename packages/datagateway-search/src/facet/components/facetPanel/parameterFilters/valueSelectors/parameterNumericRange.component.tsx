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
      key: `${entityName.toLowerCase()}parameter.numericValue.${parameterName}`,
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

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && units !== '') applyRange();
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      gap={1}
      sx={{ marginBottom: 0 }}
    >
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        type="number"
        label={t('filter.parameter.min')}
        value={min}
        inputProps={{
          max: Number(max),
        }}
        aria-valuemax={Number(max)}
        onChange={onMinChange}
        onKeyDown={handleKeyDown}
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        type="number"
        label={t('filter.parameter.max')}
        aria-valuemin={Number(min)}
        value={max}
        inputProps={{
          min: Number(min),
        }}
        onChange={onMaxChange}
        onKeyDown={handleKeyDown}
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        label={t('filter.parameter.units')}
        value={units}
        onChange={onUnitsChange}
        onKeyDown={handleKeyDown}
      />
    </Stack>
  );
}

export default ParameterNumericRange;
