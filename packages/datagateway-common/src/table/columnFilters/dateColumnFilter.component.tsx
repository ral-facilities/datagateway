import React, { useState } from 'react';
import { format, isValid, isEqual, isBefore } from 'date-fns';
import { FiltersType, DateFilter } from '../../app.types';
import { usePushFilter } from '../../api';
import { TextField, Button } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar';

export function datesEqual(date1: Date | null, date2: Date | null): boolean {
  if (date1 === date2) {
    return true;
  } else if (!isValid(date1) && !isValid(date2)) {
    return true;
  }
  return date1 !== null && date2 !== null && isEqual(date1, date2);
}

interface UpdateFilterParams {
  date: Date | null;
  prevDate: Date | null;
  otherDate: Date | null;
  startDateOrEndDateChanged: 'startDate' | 'endDate';
  onChange: (value: { startDate?: string; endDate?: string } | null) => void;
  filterByTime?: boolean;
}

export function updateFilter({
  date,
  prevDate,
  otherDate,
  startDateOrEndDateChanged,
  onChange,
  filterByTime,
}: UpdateFilterParams): void {
  if (!datesEqual(date, prevDate)) {
    if (
      (date === null || !isValid(date)) &&
      (otherDate === null || !isValid(otherDate))
    ) {
      onChange(null);
    } else {
      onChange({
        [startDateOrEndDateChanged]:
          date && isValid(date)
            ? format(date, filterByTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd')
            : undefined,
        [startDateOrEndDateChanged === 'startDate' ? 'endDate' : 'startDate']:
          otherDate && isValid(otherDate)
            ? format(
                otherDate,
                filterByTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd'
              )
            : undefined,
      });
    }
  }
}

export const CustomClearButton = (
  props: PickersActionBarProps
): JSX.Element => {
  const { onClear } = props;
  return (
    <Button
      role="button"
      onClick={() => onClear()}
      variant="contained"
      color="primary"
      sx={{ marginLeft: '30px', marginBottom: '10px' }}
    >
      Clear
    </Button>
  );
};

interface DateColumnFilterProps {
  label: string;
  onChange: (value: { startDate?: string; endDate?: string } | null) => void;
  value: { startDate?: string; endDate?: string } | undefined;
  filterByTime?: boolean;
}

const DateColumnFilter = (props: DateColumnFilterProps): React.ReactElement => {
  //Need state to change otherwise wont update error messages for an invalid date
  const [startDate, setStartDate] = useState(
    props.value?.startDate ? new Date(props.value.startDate) : null
  );
  const [endDate, setEndDate] = useState(
    props.value?.endDate ? new Date(props.value.endDate) : null
  );

  const invalidDateRange = startDate && endDate && isBefore(endDate, startDate);

  return (
    <form>
      {props.filterByTime ? (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            inputFormat="yyyy-MM-dd HH:mm"
            mask="____-__-__ __:__"
            value={startDate}
            maxDate={endDate || new Date('2100-01-01 00:00')}
            onChange={(date) => {
              setStartDate(date as Date);
              updateFilter({
                date: date as Date,
                prevDate: startDate,
                otherDate: endDate,
                startDateOrEndDateChanged: 'startDate',
                onChange: props.onChange,
                filterByTime: true,
              });
            }}
            componentsProps={{
              actionBar: {
                actions: ['clear'],
              },
            }}
            components={{
              ActionBar: CustomClearButton,
            }}
            OpenPickerButtonProps={{
              size: 'small',
              'aria-label': `${props.label} filter from, date-time picker`,
            }}
            // id={props.label + 'filter from'}
            renderInput={(renderProps) => {
              const error =
                // eslint-disable-next-line react/prop-types
                (renderProps.error || invalidDateRange) ?? undefined;
              let helperText = 'Date-time format: yyyy-MM-dd HH:mm.';
              if (invalidDateRange) helperText = 'Invalid date-time range';

              return (
                <TextField
                  {...renderProps}
                  id={props.label + ' filter from'}
                  inputProps={{
                    ...renderProps.inputProps,
                    placeholder: 'From...',
                    'aria-label': `${props.label} filter from`,
                  }}
                  variant="standard"
                  error={error}
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
          <DateTimePicker
            inputFormat="yyyy-MM-dd HH:mm"
            mask="____-__-__ __:__"
            value={endDate}
            minDate={startDate || new Date('1984-01-01 00:00')}
            onChange={(date) => {
              setEndDate(date as Date);
              updateFilter({
                date: date as Date,
                prevDate: endDate,
                otherDate: startDate,
                startDateOrEndDateChanged: 'endDate',
                onChange: props.onChange,
                filterByTime: true,
              });
            }}
            componentsProps={{
              actionBar: {
                actions: ['clear'],
              },
            }}
            components={{
              ActionBar: CustomClearButton,
            }}
            OpenPickerButtonProps={{
              size: 'small',
              'aria-label': `${props.label} filter to, date-time picker`,
            }}
            // id={props.label + 'filter to'}
            renderInput={(renderProps) => {
              const error =
                // eslint-disable-next-line react/prop-types
                (renderProps.error || invalidDateRange) ?? undefined;
              let helperText = 'Date-time format: yyyy-MM-dd HH:mm.';
              if (invalidDateRange) helperText = 'Invalid date-time range';

              return (
                <TextField
                  {...renderProps}
                  id={props.label + ' filter to'}
                  inputProps={{
                    ...renderProps.inputProps,
                    placeholder: 'To...',
                    'aria-label': `${props.label} filter to`,
                  }}
                  variant="standard"
                  error={error}
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
        </LocalizationProvider>
      ) : (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            inputFormat="yyyy-MM-dd"
            mask="____-__-__"
            value={startDate}
            maxDate={endDate || new Date('2100-01-01 00:00')}
            onChange={(date) => {
              setStartDate(date as Date);
              updateFilter({
                date: date as Date,
                prevDate: startDate,
                otherDate: endDate,
                startDateOrEndDateChanged: 'startDate',
                onChange: props.onChange,
              });
            }}
            componentsProps={{
              actionBar: {
                actions: ['clear'],
              },
            }}
            components={{
              ActionBar: CustomClearButton,
            }}
            OpenPickerButtonProps={{
              size: 'small',
              'aria-label': `${props.label} filter from, date picker`,
            }}
            // id={props.label + 'filter from'}
            renderInput={(renderProps) => {
              const error =
                // eslint-disable-next-line react/prop-types
                (renderProps.error || invalidDateRange) ?? undefined;
              let helperText = 'Date format: yyyy-MM-dd.';
              if (invalidDateRange) helperText = 'Invalid date range';

              return (
                <TextField
                  {...renderProps}
                  id={props.label + ' filter from'}
                  inputProps={{
                    ...renderProps.inputProps,
                    placeholder: 'From...',
                    'aria-label': `${props.label} filter from`,
                  }}
                  variant="standard"
                  error={error}
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
          <DatePicker
            inputFormat="yyyy-MM-dd"
            mask="____-__-__"
            value={endDate}
            minDate={startDate || new Date('1984-01-01 00:00')}
            onChange={(date) => {
              setEndDate(date as Date);
              updateFilter({
                date: date as Date,
                prevDate: endDate,
                otherDate: startDate,
                startDateOrEndDateChanged: 'endDate',
                onChange: props.onChange,
              });
            }}
            componentsProps={{
              actionBar: {
                actions: ['clear'],
              },
            }}
            components={{
              ActionBar: CustomClearButton,
            }}
            OpenPickerButtonProps={{
              size: 'small',
              'aria-label': `${props.label} filter to, date picker`,
            }}
            // id={props.label + 'filter to'}
            renderInput={(renderProps) => {
              const error =
                // eslint-disable-next-line react/prop-types
                (renderProps.error || invalidDateRange) ?? undefined;
              let helperText = 'Date format: yyyy-MM-dd.';
              if (invalidDateRange) helperText = 'Invalid date range';

              return (
                <TextField
                  {...renderProps}
                  id={props.label + ' filter to'}
                  inputProps={{
                    ...renderProps.inputProps,
                    placeholder: 'To...',
                    'aria-label': `${props.label} filter to`,
                  }}
                  variant="standard"
                  error={error}
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
        </LocalizationProvider>
      )}
    </form>
  );
};

export default DateColumnFilter;

export const useDateFilter = (
  filters: FiltersType
): ((label: string, dataKey: string) => React.ReactElement) => {
  const pushFilter = usePushFilter();
  return React.useMemo(() => {
    const dateFilter = (label: string, dataKey: string): React.ReactElement => (
      <DateColumnFilter
        label={label}
        value={filters[dataKey] as DateFilter}
        onChange={(value: { startDate?: string; endDate?: string } | null) =>
          pushFilter(dataKey, value ? value : null)
        }
      />
    );
    return dateFilter;
  }, [filters, pushFilter]);
};
