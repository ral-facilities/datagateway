import React from 'react';
import { Input, InputAdornment, MenuItem, Select } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import debounce from 'lodash.debounce';
import { FiltersType, TextFilter } from '../../app.types';
import { usePushFilters } from '../../api';

const TextColumnFilter = (props: {
  label: string;
  onChange: (value: { value?: string | number; type: string } | null) => void;
  value?: { value?: string | number; type: string };
}): React.ReactElement => {
  const { onChange, label } = props;
  const { value: propValue, type: propType } = props?.value ?? {};

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
      <Input
        id={`${label}-filter`}
        placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)}...`}
        value={inputValue}
        onChange={handleInputChange}
        aria-label={`Filter by ${label}`}
        fullWidth={true}
        color="secondary"
        endAdornment={
          <InputAdornment position="end">
            <Select
              id="select-filter-type"
              value={type}
              IconComponent={SettingsIcon}
              // Do not render a value
              renderValue={() => ''}
              onChange={(e) => handleSelectChange(e.target.value as string)}
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
    </div>
  );
};

export default TextColumnFilter;

export const useTextFilter = (
  filters: FiltersType
): ((label: string, dataKey: string) => React.ReactElement) => {
  const pushFilters = usePushFilters();
  return React.useMemo(() => {
    const textFilter = (label: string, dataKey: string): React.ReactElement => (
      <TextColumnFilter
        label={label}
        value={filters[dataKey] as TextFilter}
        onChange={(value: { value?: string | number; type: string } | null) =>
          pushFilters(dataKey, value ? value : null)
        }
      />
    );
    return textFilter;
  }, [filters, pushFilters]);
};
