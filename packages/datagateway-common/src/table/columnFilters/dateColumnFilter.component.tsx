import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { format, isValid, isEqual } from 'date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

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
}): React.ReactElement => {
  const [startDate, setStartDate] = React.useState<MaterialUiPickersDate>(null);
  const [endDate, setEndDate] = React.useState<MaterialUiPickersDate>(null);

  return (
    <form>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          clearable
          inputProps={{ 'aria-label': `${props.label} date filter from` }}
          KeyboardButtonProps={{ size: 'small' }}
          format="yyyy-MM-dd"
          placeholder="From... (yyyy-MM-dd)"
          value={startDate}
          views={['year', 'month', 'date']}
          maxDate={endDate || new Date('2100-01-01')}
          maxDateMessage="Invalid date range"
          onChange={(date) => {
            updateFilter({
              date,
              prevDate: startDate,
              otherDate: endDate,
              startDateOrEndDateChanged: 'startDate',
              onChange: props.onChange,
            });
            setStartDate(date);
          }}
        />
        <KeyboardDatePicker
          clearable
          inputProps={{ 'aria-label': `${props.label} date filter to` }}
          KeyboardButtonProps={{ size: 'small' }}
          placeholder="To...     (yyyy-MM-dd)"
          format="yyyy-MM-dd"
          value={endDate}
          views={['year', 'month', 'date']}
          minDate={startDate || new Date('1900-01-01')}
          minDateMessage="Invalid date range"
          onChange={(date) => {
            updateFilter({
              date,
              prevDate: endDate,
              otherDate: startDate,
              startDateOrEndDateChanged: 'endDate',
              onChange: props.onChange,
            });
            setEndDate(date);
          }}
        />
      </MuiPickersUtilsProvider>
    </form>
  );
};

export default DateColumnFilter;
