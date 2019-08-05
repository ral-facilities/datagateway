import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

const DateColumnFilter = (props: {
  label: string;
  onChange: (value: { startDate?: Date; endDate?: Date }) => void;
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
            props.onChange({
              startDate: date ? date : undefined,
              endDate: endDate ? endDate : undefined,
            });
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
            props.onChange({
              startDate: startDate ? startDate : undefined,
              endDate: date ? date : undefined,
            });
          }}
        />
      </MuiPickersUtilsProvider>
    </form>
  );
};

export default DateColumnFilter;
