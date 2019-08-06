import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import format from 'date-fns/format';
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
          onChange={date => {
            setStartDate(date);
            if (date === null && endDate === null) {
              props.onChange(null);
            } else {
              props.onChange({
                startDate: date ? format(date, 'yyyy-MM-dd') : undefined,
                endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
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
          onChange={date => {
            setEndDate(date);
            if (date === null && startDate === null) {
              props.onChange(null);
            } else {
              props.onChange({
                startDate: startDate
                  ? format(startDate, 'yyyy-MM-dd')
                  : undefined,
                endDate: date ? format(date, 'yyyy-MM-dd') : undefined,
              });
            }
          }}
        />
      </MuiPickersUtilsProvider>
    </form>
  );
};

export default DateColumnFilter;
