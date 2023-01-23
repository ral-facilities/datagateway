import React from 'react';
import { Grid, TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SearchFilter, DatasearchType } from 'datagateway-common';

interface ParameterNumericRangeProps {
  entityName: DatasearchType;
  parameterTypeName: string;
  onApplyRange: (min: number, max: number, unit: string) => void;
  changeFilter: (key: string, value: SearchFilter, remove?: boolean) => void;
  setFilterUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ParameterNumericRange = ({
  entityName,
  parameterTypeName,
  onApplyRange,
  changeFilter,
  setFilterUpdate,
}: ParameterNumericRangeProps): React.ReactElement => {
  const [t] = useTranslation();

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
    onApplyRange(Number(min), Number(max), units);
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
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{ marginBottom: 0 }}
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
            disabled={min === '' || max === ''}
            onClick={applyRange}
          >
            {t('filter.parameter.apply')}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
