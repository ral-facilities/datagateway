import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { format, isValid } from 'date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

const DateColumnFilter = (props: {
  label: string;
  onChange: (value: { startDate?: string; endDate?: string } | null) => void;
}): React.ReactElement => {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  return (
    <form>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          clearable
          inputProps={{ 'aria-label': `${props.label} date filter from` }}
          KeyboardButtonProps={{ size: 'small' }}
          format="yyyy-MM-dd"
          placeholder="From..."
          value={startDate}
          views={['year', 'month', 'date']}
          maxDate={endDate || new Date('2100-01-01')}
          maxDateMessage="Invalid date range"
          onChange={date => {
            setStartDate(date);
            if (
              (date === null && endDate === null) ||
              (!isValid(date) && !isValid(endDate))
            ) {
              props.onChange(null);
            } else {
              props.onChange({
                startDate:
                  date && isValid(date)
                    ? format(date, 'yyyy-MM-dd')
                    : undefined,
                endDate:
                  endDate && isValid(endDate)
                    ? format(endDate, 'yyyy-MM-dd')
                    : undefined,
              });
            }
          }}
        />
        <KeyboardDatePicker
          clearable
          inputProps={{ 'aria-label': `${props.label} date filter to` }}
          KeyboardButtonProps={{ size: 'small' }}
          placeholder="To..."
          format="yyyy-MM-dd"
          value={endDate}
          views={['year', 'month', 'date']}
          minDate={startDate || new Date('1900-01-01')}
          minDateMessage="Invalid date range"
          onChange={date => {
            setEndDate(date);
            if (
              (date === null && startDate === null) ||
              (!isValid(date) && !isValid(startDate))
            ) {
              props.onChange(null);
            } else {
              props.onChange({
                startDate:
                  startDate && isValid(startDate)
                    ? format(startDate, 'yyyy-MM-dd')
                    : undefined,
                endDate:
                  date && isValid(date)
                    ? format(date, 'yyyy-MM-dd')
                    : undefined,
              });
            }
          }}
        />
      </MuiPickersUtilsProvider>
    </form>
  );
};

export default DateColumnFilter;
