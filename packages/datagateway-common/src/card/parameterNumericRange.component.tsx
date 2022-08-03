import React from 'react';
import { Grid, TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SearchFilter } from '../app.types';
import { DatasearchType } from '..';

interface ParameterNumericRangeProps {
  entityName: DatasearchType;
  parameterTypeName: string;
  changeFilter: (key: string, value: SearchFilter, remove?: boolean) => void;
  setFilterUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ParameterNumericRange = (
  props: ParameterNumericRangeProps
): React.ReactElement => {
  const [t] = useTranslation();

  const {
    entityName,
    parameterTypeName,
    changeFilter,
    setFilterUpdate,
  } = props;

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
            field: 'numericValue',
            from: Number(min),
            to: Number(max),
            key: label,
            units: units,
          };
    changeFilter(`${entityName.toLowerCase()}parameter`, {
      key: `${entityName.toLowerCase()}parameter.numericValue.${parameterTypeName}`,
      label: label,
      filter: [filter, { field: 'type.name', value: parameterTypeName }],
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
