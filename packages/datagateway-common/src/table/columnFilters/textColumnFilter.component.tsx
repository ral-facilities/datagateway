import React from 'react';
import { Input, InputAdornment, MenuItem, Select } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import debounce from 'lodash.debounce';
import { FiltersType, TextFilter } from '../../app.types';
import { usePushFilters } from '../../api';

export default class TextColumnFilter extends React.Component<
  {
    label: string;
    onChange: (value: { value?: string | number; type: string } | null) => void;
    value?: { value?: string | number; type: string };
  },
  {
    value?: string | number;
    type: string;
  }
> {
  public constructor(props: {
    label: string;
    onChange: (value: { value?: string | number; type: string } | null) => void;
    value?: { value?: string | number; type: string };
  }) {
    super(props);
    this.state = {
      value:
        this.props.value && this.props.value.value
          ? this.props.value.value
          : '',
      type:
        this.props.value && this.props.value.type
          ? this.props.value.type
          : 'include',
    };
  }

  // Debounce the updating of the column filter by 250 milliseconds.
  private updateValue = debounce((value: string) => {
    this.props.onChange(
      value === '' ? null : { value: value, type: this.state.type }
    );
  }, 250);

  private updateType = debounce((type: string) => {
    this.props.onChange({ value: this.state.value, type: type });
  }, 250);

  private handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    this.updateValue(event.target.value);
    this.setState({
      value: event.target.value,
    });
  };

  private handleSelectChange = (type: string): void => {
    // Only trigger onChange if input is not empty
    if (this.state.value !== '') {
      this.updateType(type);
    }
    this.setState({ type: type });
  };

  public render(): React.ReactElement {
    return (
      <div>
        <Input
          id={`${this.props.label} filter`}
          placeholder={`${
            this.state.type.charAt(0).toUpperCase() + this.state.type.slice(1)
          }...`}
          value={this.state.value}
          onChange={this.handleInputChange}
          aria-label={`Filter by ${this.props.label}`}
          fullWidth={true}
          color="secondary"
          endAdornment={
            <InputAdornment position="end">
              <Select
                id="select-filter-type"
                value={this.state.type}
                IconComponent={SettingsIcon}
                // Do not render a value
                renderValue={() => ''}
                onChange={(e) =>
                  this.handleSelectChange(e.target.value as string)
                }
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
  }
}

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
