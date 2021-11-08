import React, { useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { format, isValid, isEqual, isBefore, isAfter } from 'date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { FiltersType, DateFilter } from '../../app.types';
import { usePushFilters } from '../../api';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';

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

const useInputStyles = makeStyles((theme: Theme) =>
  createStyles({
    underline: {
      '&$error:after': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        borderBottomColor: (theme as any).ukri?.contrast?.red,
      },
    },
    error: {},
  })
);

const useHelperTextStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '&$error': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color: (theme as any).ukri?.contrast?.red,
      },
    },
    error: {},
  })
);

const DateColumnFilter = (props: {
  label: string;
  onChange: (value: { startDate?: string; endDate?: string } | null) => void;
  value: { startDate?: string; endDate?: string } | undefined;
}): React.ReactElement => {
  const inputClasses = useInputStyles();
  const helperTextClasses = useHelperTextStyles();

  const startDate = props.value?.startDate
    ? new Date(props.value.startDate)
    : null;
  const endDate = props.value?.endDate ? new Date(props.value.endDate) : null;

  //Min/Max valid dates
  const minDate = startDate || new Date('1984-01-01T00:00:00Z');
  const maxDate = endDate || new Date('2100-01-01T00:00:00Z');

  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);

  //Obtain a contrast friendly button colour
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buttonColour = (theme as any).ukri?.contrast?.blue;

  const checkValidStartDate = (startDate: Date | null): boolean => {
    if (startDate !== null) {
      //Ignore time
      startDate.setHours(0, 0, 0, 0);
      if (!isValid(startDate)) {
        setStartDateError('Invalid date');
        return false;
      } else if (isAfter(startDate, maxDate)) {
        setStartDateError('Invalid date range');
        return false;
      }
    }
    //Valid if null or if no errors found above
    setStartDateError(null);
    return true;
  };

  const checkValidEndDate = (endDate: Date | null): boolean => {
    if (endDate !== null) {
      //Ignore time
      endDate.setHours(0, 0, 0, 0);
      if (!isValid(endDate)) {
        setEndDateError('Invalid date');
        return false;
      } else if (isBefore(endDate, minDate)) {
        setEndDateError('Invalid date range');
        return false;
      }
    }
    //Valid if null or if no errors found above
    setEndDateError(null);
    return true;
  };

  const handleStartDateChange = (date: MaterialUiPickersDate): void => {
    checkValidStartDate(date);
    updateFilter({
      date,
      prevDate: startDate,
      otherDate: endDate,
      startDateOrEndDateChanged: 'startDate',
      onChange: props.onChange,
    });
  };

  const handleEndDateChange = (date: MaterialUiPickersDate): void => {
    checkValidEndDate(date);
    updateFilter({
      date,
      prevDate: endDate,
      otherDate: startDate,
      startDateOrEndDateChanged: 'endDate',
      onChange: props.onChange,
    });
  };

  return (
    <form>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          clearable
          allowKeyboardControl
          style={{ whiteSpace: 'nowrap' }}
          inputProps={{ 'aria-label': `${props.label} filter` }}
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
          maxDate={maxDate}
          maxDateMessage="Invalid date range"
          color="secondary"
          onChange={(date) => {
            handleStartDateChange(date);
          }}
          error={startDateError !== null}
          helperText={startDateError}
          FormHelperTextProps={{
            classes: helperTextClasses,
          }}
          InputProps={{
            classes: inputClasses,
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
          minDate={minDate}
          minDateMessage="Invalid date range"
          color="secondary"
          onChange={(date) => {
            handleEndDateChange(date);
          }}
          error={endDateError !== null}
          helperText={endDateError}
          FormHelperTextProps={{
            classes: helperTextClasses,
          }}
          InputProps={{
            classes: inputClasses,
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
  filters: FiltersType
): ((label: string, dataKey: string) => React.ReactElement) => {
  const pushFilters = usePushFilters();
  return React.useMemo(() => {
    const dateFilter = (label: string, dataKey: string): React.ReactElement => (
      <DateColumnFilter
        label={label}
        value={filters[dataKey] as DateFilter}
        onChange={(value: { startDate?: string; endDate?: string } | null) =>
          pushFilters(dataKey, value ? value : null)
        }
      />
    );
    return dateFilter;
  }, [filters, pushFilters]);
};
