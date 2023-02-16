import React, { useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { format, isValid, isEqual } from 'date-fns';
import {
  KeyboardDatePicker,
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
  KeyboardDatePickerProps,
  KeyboardDateTimePickerProps,
} from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { FiltersType, DateFilter } from '../../app.types';
import { usePushFilter } from '../../api';
import { useTheme } from '@material-ui/core';

export function datesEqual(
  date1: MaterialUiPickersDate,
  date2: MaterialUiPickersDate
): boolean {
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
  date: MaterialUiPickersDate;
  prevDate: MaterialUiPickersDate;
  otherDate: MaterialUiPickersDate;
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

  //Obtain a contrast friendly button colour
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buttonColour = (theme as any).colours?.blue;

  const datePickerProps: Partial<KeyboardDatePickerProps> = {
    clearable: true,
    allowKeyboardControl: true,
    invalidDateMessage: 'Date format: yyyy-MM-dd.',
    format: 'yyyy-MM-dd',
    color: 'secondary',
    okLabel: <span style={{ color: buttonColour }}>OK</span>,
    cancelLabel: <span style={{ color: buttonColour }}>Cancel</span>,
    clearLabel: <span style={{ color: buttonColour }}>Clear</span>,
    style: { whiteSpace: 'nowrap' },
    'aria-hidden': 'true',
    inputProps: { 'aria-label': `${props.label} filter` },
    views: ['year', 'month', 'date'],
  };

  const dateTimePickerProps: Partial<KeyboardDateTimePickerProps> = {
    ...datePickerProps,
    invalidDateMessage: 'Date format: yyyy-MM-dd HH:mm.',
    format: 'yyyy-MM-dd HH:mm',
    strictCompareDates: true,
    views: ['year', 'month', 'date', 'hours', 'minutes'],
  };

  return (
    <form>
      {props.filterByTime ? (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDateTimePicker
            {...dateTimePickerProps}
            KeyboardButtonProps={{
              size: 'small',
              'aria-label': `${props.label} filter from, date/time picker`,
            }}
            id={props.label + ' filter from'}
            placeholder="From..."
            value={startDate}
            maxDate={endDate || new Date('2100-01-01 00:00')}
            maxDateMessage="Invalid date/time range"
            onChange={(date) => {
              setStartDate(date);
              updateFilter({
                date,
                prevDate: startDate,
                otherDate: endDate,
                startDateOrEndDateChanged: 'startDate',
                onChange: props.onChange,
                filterByTime: true,
              });
            }}
          />
          <KeyboardDateTimePicker
            {...dateTimePickerProps}
            KeyboardButtonProps={{
              size: 'small',
              'aria-label': `${props.label} filter to, date/time picker`,
            }}
            id={props.label + ' filter to'}
            placeholder="To..."
            value={endDate}
            minDate={startDate || new Date('1984-01-01 00:00')}
            minDateMessage="Invalid date/time range"
            onChange={(date) => {
              setEndDate(date);
              updateFilter({
                date,
                prevDate: endDate,
                otherDate: startDate,
                startDateOrEndDateChanged: 'endDate',
                onChange: props.onChange,
                filterByTime: true,
              });
            }}
          />
        </MuiPickersUtilsProvider>
      ) : (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            {...datePickerProps}
            KeyboardButtonProps={{
              size: 'small',
              'aria-label': `${props.label} filter from, date picker`,
            }}
            id={props.label + ' filter from'}
            placeholder="From..."
            value={startDate}
            maxDate={endDate || new Date('2100-01-01T00:00:00Z')}
            maxDateMessage="Invalid date range"
            onChange={(date) => {
              setStartDate(date);
              updateFilter({
                date,
                prevDate: startDate,
                otherDate: endDate,
                startDateOrEndDateChanged: 'startDate',
                onChange: props.onChange,
              });
            }}
          />
          <KeyboardDatePicker
            {...datePickerProps}
            KeyboardButtonProps={{
              size: 'small',
              'aria-label': `${props.label} filter to, date picker`,
            }}
            id={props.label + ' filter to'}
            placeholder="To..."
            value={endDate}
            minDate={startDate || new Date('1984-01-01T00:00:00Z')}
            minDateMessage="Invalid date range"
            onChange={(date) => {
              setEndDate(date);
              updateFilter({
                date,
                prevDate: endDate,
                otherDate: startDate,
                startDateOrEndDateChanged: 'endDate',
                onChange: props.onChange,
              });
            }}
          />
        </MuiPickersUtilsProvider>
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
