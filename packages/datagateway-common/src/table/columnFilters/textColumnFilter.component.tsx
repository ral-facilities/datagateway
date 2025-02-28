import React from 'react';
import {
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import debounce from 'lodash.debounce';
import { Filter, FiltersType, TextFilter } from '../../app.types';
import { usePushFilter, usePushFilters } from '../../api';

const TextColumnFilter = (props: {
  label: string;
  onChange: (value: TextFilter | null) => void;
  value: TextFilter | undefined;
  defaultFilter?: TextFilter;
}): React.ReactElement => {
  const { onChange, label, defaultFilter } = props;
  const { value: propValue, type: propType } = props.value ?? {};

  const [inputValue, setInputValue] = React.useState(
    defaultFilter ? defaultFilter.value : propValue ? propValue : ''
  );
  const [type, setType] = React.useState(
    defaultFilter ? defaultFilter.type : propType ? propType : 'include'
  );
  // Debounce the updating of the column filter by 500 milliseconds.
  const updateValue = React.useMemo(
    () =>
      debounce((value: string) => {
        onChange(value === '' ? null : { value: value, type: type });
      }, DEBOUNCE_DELAY),
    [onChange, type]
  );

  const updateType = (type: TextFilter['type']): void => {
    onChange({ value: inputValue, type: type });
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    updateValue(event.target.value);
    setInputValue(event.target.value);
  };

  const handleSelectChange = (type: TextFilter['type']): void => {
    // Only trigger onChange if input is not empty
    if (inputValue !== '') {
      updateType(type);
    }
    setType(type);
  };

  // keep track of previous prop value so we know to update if it changes
  // this means that programmatic calls to pushFilter update the input
  const prevPropValueRef = React.useRef(propValue);
  React.useEffect(() => {
    prevPropValueRef.current = propValue;
  }, [propValue]);
  const prevPropValue = prevPropValueRef.current;

  React.useEffect(() => {
    if (prevPropValue !== propValue) {
      setInputValue(propValue ?? '');
    }
  }, [propValue, prevPropValue]);

  return (
    <div>
      <FormControl
        variant="standard"
        color="secondary"
        fullWidth={true}
        margin="dense"
      >
        <InputLabel htmlFor={`${label}-filter`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </InputLabel>
        <Input
          id={`${label}-filter`}
          value={inputValue}
          onChange={handleInputChange}
          inputProps={{ 'aria-label': `Filter by ${label}` }}
          endAdornment={
            <InputAdornment position="end">
              <Select
                id={`${label}-select-filter-type`}
                value={type}
                IconComponent={SettingsIcon}
                // Do not render a value
                renderValue={() => ''}
                onChange={(e) =>
                  handleSelectChange(e.target.value as TextFilter['type'])
                }
                SelectDisplayProps={{
                  'aria-label': `include, exclude or exact`,
                }}
                variant="standard"
              >
                <MenuItem
                  key="include"
                  id="select-filter-type-include"
                  value="include"
                >
                  Include
                </MenuItem>
                <MenuItem
                  key="exclude"
                  id="select-filter-type-exclude"
                  value="exclude"
                >
                  Exclude
                </MenuItem>
                <MenuItem
                  key="exact"
                  id="select-filter-type-exact"
                  value="exact"
                >
                  Exact
                </MenuItem>
              </Select>
            </InputAdornment>
          }
        />
      </FormControl>
    </div>
  );
};

export const DEBOUNCE_DELAY = 500;

export default TextColumnFilter;

export const useTextFilter = (
  filters: FiltersType
): ((
  label: string,
  dataKey: string,
  defaultFilter?: Filter
) => React.ReactElement) => {
  const pushFilter = usePushFilter();
  return React.useMemo(() => {
    const textFilter = (
      label: string,
      dataKey: string,
      defaultFilter?: Filter
    ): React.ReactElement => (
      <TextColumnFilter
        label={label}
        value={filters[dataKey] as TextFilter}
        onChange={(value: TextFilter | null) =>
          pushFilter(dataKey, value ? value : null)
        }
        defaultFilter={defaultFilter as TextFilter}
      />
    );
    return textFilter;
  }, [filters, pushFilter]);
};

export const usePrincipalExperimenterFilter = (
  filters: FiltersType
): ((label: string, dataKey: string) => React.ReactElement) => {
  const pushFilters = usePushFilters();

  return React.useMemo(() => {
    const textFilter = (label: string, dataKey: string): React.ReactElement => (
      <TextColumnFilter
        label={label}
        value={filters[dataKey] as TextFilter}
        onChange={(value: TextFilter | null) => {
          pushFilters([
            { filterKey: dataKey, filter: value ? value : null },
            {
              filterKey: 'investigationUsers.role',
              filter: value
                ? { value: 'principal_experimenter', type: 'include' }
                : null,
            },
          ]);
        }}
      />
    );
    return textFilter;
  }, [filters, pushFilters]);
};
