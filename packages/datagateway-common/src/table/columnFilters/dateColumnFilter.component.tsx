import React, { useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { format, isValid, isEqual } from 'date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { FiltersType, DateFilter, UpdateMethod } from '../../app.types';
import { useUpdateFilter } from '../../api';
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

  //Obtain a contrast friendly button colour
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buttonColour = (theme as any).colours?.blue;

  return (
    <form>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          clearable
          allowKeyboardControl
          style={{ whiteSpace: 'nowrap' }}
          inputProps={{ 'aria-label': `${props.label} filter` }}
          invalidDateMessage="Please enter the date in the format yyyy-MM-dd."
          KeyboardButtonProps={{
            size: 'small',
            'aria-label': `${props.label} filter from, date picker`,
          }}
          id={props.label + ' filter from'}
          aria-hidden="true"
          format="yyyy-MM-dd"
          placeholder="From..."
          value={startDate}
          views={['year', 'month', 'date']}
          maxDate={endDate || new Date('2100-01-01T00:00:00Z')}
          maxDateMessage="Invalid date range"
          color="secondary"
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
          okLabel={<span style={{ color: buttonColour }}>OK</span>}
          cancelLabel={<span style={{ color: buttonColour }}>Cancel</span>}
          clearLabel={<span style={{ color: buttonColour }}>Clear</span>}
        />
        <KeyboardDatePicker
          clearable
          allowKeyboardControl
          style={{ whiteSpace: 'nowrap' }}
          inputProps={{ 'aria-label': `${props.label} filter` }}
          invalidDateMessage="Please enter the date in the format yyyy-MM-dd."
          KeyboardButtonProps={{
            size: 'small',
            'aria-label': `${props.label} filter to, date picker`,
          }}
          id={props.label + ' filter to'}
          aria-hidden="true"
          format="yyyy-MM-dd"
          placeholder="To..."
          value={endDate}
          views={['year', 'month', 'date']}
          minDate={startDate || new Date('1984-01-01T00:00:00Z')}
          minDateMessage="Invalid date range"
          color="secondary"
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
          okLabel={<span style={{ color: buttonColour }}>OK</span>}
          cancelLabel={<span style={{ color: buttonColour }}>Cancel</span>}
          clearLabel={<span style={{ color: buttonColour }}>Clear</span>}
        />
      </MuiPickersUtilsProvider>
    </form>
  );
};

export default DateColumnFilter;

export const useDateFilter = (
  filters: FiltersType,
  updateMethod: UpdateMethod
): ((label: string, dataKey: string) => React.ReactElement) => {
  const pushFilter = useUpdateFilter(updateMethod);
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
