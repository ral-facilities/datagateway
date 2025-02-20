import React, { useState } from 'react';
import { format, isValid, isEqual, isBefore } from 'date-fns';
import { FiltersType, DateFilter } from '../../app.types';
import { usePushFilter } from '../../api';
import {
  TextField,
  TextFieldProps,
  ThemeProvider,
  createTheme,
  useTheme,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import {
  DateTimeValidationError,
  DateValidationError,
} from '@mui/x-date-pickers/models';

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
            ? format(date, filterByTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd')
            : undefined,
        [startDateOrEndDateChanged === 'startDate' ? 'endDate' : 'startDate']:
          otherDate && isValid(otherDate)
            ? format(
                otherDate,
                filterByTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd'
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

const CustomTextField: React.FC<TextFieldProps> = (renderProps) => {
  const { invalidDateRange, errorText, filterByTime, ...inputProps } =
    renderProps.inputProps ?? {};

  const error =
    // eslint-disable-next-line react/prop-types
    (renderProps.error || invalidDateRange) ?? undefined;

  // Display correct helper text depending on whether filtering by time
  const [fieldType, fieldFormat] = filterByTime
    ? ['Date-time', 'yyyy-MM-dd HH:mm:ss']
    : ['Date', 'yyyy-MM-dd'];

  // For now we only display 2 types of error messages
  let helperText = `${fieldType} format: ${fieldFormat}.`;
  if (invalidDateRange || errorText === 'maxDate' || errorText === 'minDate')
    helperText = `Invalid ${fieldType.toLowerCase()} range`;

  return (
    <TextField
      {...renderProps}
      inputProps={{ ...inputProps }}
      variant="standard"
      error={error}
      {...(error && { helperText: helperText })}
    />
  );
};

const DateColumnFilter = (props: DateColumnFilterProps): React.ReactElement => {
  //Need state to change otherwise wont update error messages for an invalid date
  const [startDate, setStartDate] = useState(
    props.value?.startDate ? new Date(props.value.startDate) : null
  );
  const [endDate, setEndDate] = useState(
    props.value?.endDate ? new Date(props.value.endDate) : null
  );

  const invalidDateRange = startDate && endDate && isBefore(endDate, startDate);

  //Catch error messages from date picker
  const [errorText, setError] = React.useState<
    DateTimeValidationError | DateValidationError | null
  >(null);

  // can't set the main colour to secondary the "normal" MUI way, so have a sub-theme
  // to override the primary colour for the date pickers
  const theme = useTheme();
  const subTheme = createTheme(theme, {
    palette: {
      primary:
        theme.palette.mode === 'dark'
          ? theme.palette.secondary
          : theme.palette.primary,
    },
  });

  return (
    <form>
      <ThemeProvider theme={subTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
          {props.filterByTime ? (
            <>
              <DateTimePicker
                format="yyyy-MM-dd HH:mm:ss"
                views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                value={startDate}
                maxDate={endDate || new Date('2100-01-01 00:00:00')}
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
                // Catch error messages for helper text
                onError={(newError) => setError(newError)}
                slots={{
                  textField: CustomTextField,
                }}
                slotProps={{
                  actionBar: {
                    actions: ['clear'],
                  },
                  textField: {
                    inputProps: {
                      invalidDateRange: invalidDateRange,
                      errorText: errorText,
                      filterByTime: props.filterByTime,
                      id: props.label + ' filter from',
                      placeholder: 'From...',
                      'aria-label': `${props.label} filter from`,
                    },
                    color: 'secondary',
                  },
                  openPickerButton: {
                    size: 'small',
                    'aria-label': `${props.label} filter from, date-time picker`,
                  },
                }}
              />
              <DateTimePicker
                format="yyyy-MM-dd HH:mm:ss"
                views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                value={endDate}
                minDate={startDate || new Date('1984-01-01 00:00:00')}
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
                onError={(newError) => setError(newError)}
                slots={{
                  textField: CustomTextField,
                }}
                slotProps={{
                  actionBar: {
                    actions: ['clear'],
                  },
                  textField: {
                    inputProps: {
                      invalidDateRange,
                      errorText,
                      filterByTime: props.filterByTime,
                      id: props.label + ' filter to',
                      placeholder: 'To...',
                      'aria-label': `${props.label} filter to`,
                    },
                  },
                  openPickerButton: {
                    size: 'small',
                    'aria-label': `${props.label} filter to, date-time picker`,
                  },
                }}
              />
            </>
          ) : (
            <>
              <DatePicker
                format="yyyy-MM-dd"
                views={['year', 'month', 'day']}
                value={startDate}
                maxDate={endDate || new Date('2100-01-01 00:00:00')}
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
                onError={(newError) => setError(newError)}
                slots={{
                  textField: CustomTextField,
                }}
                slotProps={{
                  actionBar: {
                    actions: ['clear'],
                  },
                  textField: {
                    inputProps: {
                      invalidDateRange,
                      errorText,
                      filterByTime: props.filterByTime,
                      id: props.label + ' filter from',
                      placeholder: 'From...',
                      'aria-label': `${props.label} filter from`,
                    },
                  },
                  openPickerButton: {
                    size: 'small',
                    'aria-label': `${props.label} filter from, date picker`,
                  },
                }}
              />
              <DatePicker
                format="yyyy-MM-dd"
                views={['year', 'month', 'day']}
                value={endDate}
                minDate={startDate || new Date('1984-01-01 00:00:00')}
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
                onError={(newError) => setError(newError)}
                slots={{
                  textField: CustomTextField,
                }}
                slotProps={{
                  actionBar: {
                    actions: ['clear'],
                  },
                  textField: {
                    inputProps: {
                      invalidDateRange,
                      errorText,
                      filterByTime: props.filterByTime,
                      id: props.label + ' filter to',
                      placeholder: 'To...',
                      'aria-label': `${props.label} filter to`,
                    },
                  },
                  openPickerButton: {
                    size: 'small',
                    'aria-label': `${props.label} filter to, date picker`,
                  },
                }}
              />
            </>
          )}
        </LocalizationProvider>
      </ThemeProvider>
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
