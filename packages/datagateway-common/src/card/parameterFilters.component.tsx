import React from 'react';
import { Button, List } from '@mui/material';
import { Add } from '@mui/icons-material';
import ParameterFilterItem, {
  ParameterValueFilter,
} from './parameterFilterItem.component';
import { SearchFilter } from '../app.types';
import { DatasearchType } from '../api';

interface ParameterFiltersProps {
  entityName: DatasearchType;
  parameterNames: string[];
  allIds: number[];
  changeFilter: (key: string, value: SearchFilter, remove?: boolean) => void;
  setFilterUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

const ParameterFilters = (props: ParameterFiltersProps): React.ReactElement => {
  const { entityName, parameterNames, allIds, changeFilter, setFilterUpdate } =
    props;

  const [parameterFilters, setParameterFilters] = React.useState<
    ParameterValueFilter[]
  >([]);

  return (
    <div>
      <List sx={{ width: '100%' }}>
        {parameterFilters.map((filter, index) => (
          <ParameterFilterItem
            key={index}
            entityName={entityName}
            parameterNames={parameterNames}
            filter={filter}
            allIds={allIds}
            changeFilter={changeFilter}
            setFilterUpdate={setFilterUpdate}
          />
        ))}
      </List>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => {
            setParameterFilters([
              ...parameterFilters,
              { name: undefined, valueType: undefined },
            ]);
          }}
        >
          Filter Parameter Value
        </Button>
      </div>
    </div>
  );
};

export default ParameterFilters;
