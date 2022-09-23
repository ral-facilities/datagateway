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
import { FiltersType, TextFilter } from '../../app.types';
import { usePushFilter, usePushFilters } from '../../api';

const TextColumnFilter = (props: {
  label: string;
  onChange: (value: { value?: string | number; type: string } | null) => void;
  value: { value?: string | number; type: string } | undefined;
}): React.ReactElement => {
  const { onChange, label } = props;
  const { value: propValue, type: propType } = props.value ?? {};

  const [inputValue, setInputValue] = React.useState(
    propValue ? propValue : ''
  );
  const [type, setType] = React.useState(propType ? propType : 'include');

  // Debounce the updating of the column filter by 250 milliseconds.
  const updateValue = React.useMemo(
    () =>
      debounce((value: string) => {
        onChange(value === '' ? null : { value: value, type: type });
      }, 250),
    [onChange, type]
  );

  const updateType = (type: string): void => {
    onChange({ value: inputValue, type: type });
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    updateValue(event.target.value);
    setInputValue(event.target.value);
  };

  const handleSelectChange = (type: string): void => {
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
      <FormControl variant="standard">
        <InputLabel id={`${label}-filter`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </InputLabel>
        <Input
          id={`${label}-filter`}
          value={inputValue}
          onChange={handleInputChange}
          inputProps={{ 'aria-label': `Filter by ${label}` }}
          aria-hidden={true}
          fullWidth={true}
          color="secondary"
          endAdornment={
            <InputAdornment position="end">
              <Select
                id={`${label}-select-filter-type`}
                value={type}
                IconComponent={SettingsIcon}
                // Do not render a value
                renderValue={() => ''}
                onChange={(e) => handleSelectChange(e.target.value as string)}
                SelectDisplayProps={{
                  'aria-label': `include or exclude`,
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
              </Select>
            </InputAdornment>
          }
        />
      </FormControl>
    </div>
  );
};

export default TextColumnFilter;

export const useTextFilter = (
  filters: FiltersType
): ((label: string, dataKey: string) => React.ReactElement) => {
  const pushFilter = usePushFilter();
  return React.useMemo(() => {
    const textFilter = (label: string, dataKey: string): React.ReactElement => (
      <TextColumnFilter
        label={label}
        value={filters[dataKey] as TextFilter}
        onChange={(value: { value?: string | number; type: string } | null) =>
          pushFilter(dataKey, value ? value : null)
        }
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
        onChange={(value: { value?: string | number; type: string } | null) => {
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
