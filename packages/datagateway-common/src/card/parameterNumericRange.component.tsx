import React from 'react';
import { Grid, TextField, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { SearchFilter } from '../app.types';

interface ParameterNumericRangeProps {
  parameterTypeName: string;
  changeFilter: (key: string, value: SearchFilter, remove?: boolean) => void;
  setFilterUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ParameterNumericRange = (
  props: ParameterNumericRangeProps
): React.ReactElement => {
  const [t] = useTranslation();

  const { parameterTypeName, changeFilter, setFilterUpdate } = props;

  const [units, setUnits] = React.useState('');
  const [min, setMin] = React.useState('');
  const [max, setMax] = React.useState('');
  const onUnitsChange = (event: React.ChangeEvent<{ value: string }>): void => {
    setUnits(event.target.value);
  };
  const onMinChange = (event: React.ChangeEvent<{ value: string }>): void => {
    setMin(event.target.value);
  };
  const onMaxChange = (event: React.ChangeEvent<{ value: string }>): void => {
    setMax(event.target.value);
  };
  const applyRange = (): void => {
    changeFilter('investigationparameter', {
      key: `investigationparameter.numericValue.${parameterTypeName}`,
      label: `${min} to ${max} (${units})`,
      filter: [
        {
          field: 'numericValue',
          from: Number(min),
          to: Number(max),
          key: `${min} to ${max} (${units})`,
          units: units,
        },
        { field: 'type.name', value: parameterTypeName },
      ],
    });
    setFilterUpdate(true);
  };
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && units !== '' && min !== '' && max !== '')
      applyRange();
  };

  return (
    <div>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={1}
        style={{ marginBottom: 0 }}
      >
        <Grid item>
          <TextField
            variant="outlined"
            label={t('filter.parameter.min')}
            value={min}
            onChange={onMinChange}
            onKeyDown={handleKeyDown}
          />
        </Grid>
        <Grid item>
          <TextField
            variant="outlined"
            label={t('filter.parameter.max')}
            value={max}
            onChange={onMaxChange}
            onKeyDown={handleKeyDown}
          />
        </Grid>
        <Grid item>
          <TextField
            variant="outlined"
            label={t('filter.parameter.units')}
            value={units}
            onChange={onUnitsChange}
            onKeyDown={handleKeyDown}
          />
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            disabled={units === '' || min === '' || max === ''}
            onClick={applyRange}
          >
            {t('filter.parameter.apply')}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
