import React, { useState } from 'react';
import { format, isValid, isEqual, isBefore } from 'date-fns';
import { FiltersType, DateFilter } from '../../app.types';
import { usePushFilter } from '../../api';
import { Box, TextField, Theme } from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

export function datesEqual(date1: Date | null, date2: Date | null): boolean {
  if (date1 === date2) {
    return true;
  } else if (!isValid(date1) && !isValid(date2)) {
    return true;
  } else if (date1 !== null && date2 !== null && isEqual(date1, date2)) {
    return true;
  } else {
    return false;
  }
}

interface UpdateFilterParams {
  date: Date | null;
  prevDate: Date | null;
  otherDate: Date | null;
  startDateOrEndDateChanged: 'startDate' | 'endDate';
  onChange: (value: { startDate?: string; endDate?: string } | null) => void;
}

export function updateFilter({
  date,
  prevDate,
  otherDate,
  startDateOrEndDateChanged,
  onChange,
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
          date && isValid(date) ? format(date, 'yyyy-MM-dd') : undefined,
        [startDateOrEndDateChanged === 'startDate' ? 'endDate' : 'startDate']:
          otherDate && isValid(otherDate)
            ? format(otherDate, 'yyyy-MM-dd')
            : undefined,
      });
    }
  }
}

const DateColumnFilter = (props: {
  label: string;
  onChange: (value: { startDate?: string; endDate?: string } | null) => void;
  value: { startDate?: string; endDate?: string } | undefined;
}): React.ReactElement => {
  //Need state to change otherwise wont update error messages for an invalid date
  const [startDate, setStartDate] = useState(
    props.value?.startDate ? new Date(props.value.startDate) : null
  );
  const [endDate, setEndDate] = useState(
    props.value?.endDate ? new Date(props.value.endDate) : null
  );

  const invalidDateRange =
    startDate && endDate && isBefore(endDate, startDate) ? true : false;

  return (
    <form>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          //Clearable does not work at the moment https://github.com/mui/material-ui/issues/30676
          clearable
          aria-hidden="true"
          inputFormat="yyyy-MM-dd"
          mask="____-__-__"
          value={startDate}
          maxDate={endDate || new Date('2100-01-01T00:00:00Z')}
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
          clearText={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Box sx={{ color: (theme: Theme) => (theme as any).colours?.blue }}>
              Clear
            </Box>
          }
          renderInput={(renderProps) => {
            const error =
              // eslint-disable-next-line react/prop-types
              renderProps.error || invalidDateRange;
            let helperText = 'Date format: yyyy-MM-dd.';
            if (invalidDateRange) helperText = 'Invalid date range';

            return (
              <TextField
                {...renderProps}
                id={props.label + ' filter from'}
                inputProps={{
                  // eslint-disable-next-line react/prop-types
                  ...renderProps.inputProps,
                  placeholder: 'From...',
                  'aria-label': `${props.label} filter from`,
                }}
                variant="standard"
                error={error}
                // eslint-disable-next-line react/prop-types
                {...(error && { helperText: helperText })}
              />
            );
          }}
        />
        <DatePicker
          clearable
          aria-hidden="true"
          inputFormat="yyyy-MM-dd"
          mask="____-__-__"
          value={endDate}
          minDate={startDate || new Date('1984-01-01T00:00:00Z')}
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
          clearText={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <Box sx={{ color: (theme: Theme) => (theme as any).colours?.blue }}>
              Clear
            </Box>
          }
          renderInput={(renderProps) => {
            const error =
              // eslint-disable-next-line react/prop-types
              renderProps.error || invalidDateRange;
            let helperText = 'Date format: yyyy-MM-dd.';
            if (invalidDateRange) helperText = 'Invalid date range';

            return (
              <TextField
                {...renderProps}
                id={props.label + ' filter to'}
                inputProps={{
                  // eslint-disable-next-line react/prop-types
                  ...renderProps.inputProps,
                  placeholder: 'To...',
                  'aria-label': `${props.label} filter to`,
                }}
                variant="standard"
                error={error}
                // eslint-disable-next-line react/prop-types
                {...(error && { helperText: helperText })}
              />
            );
          }}
        />
      </LocalizationProvider>
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
