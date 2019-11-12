import React, { useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

interface DatePickerProps {
  startOrEnd: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1, 0),
    },
  })
);

export default function SelectDates(props: DatePickerProps): JSX.Element {
  const [selectedDate, handleDateChange] = useState<Date | null>(null);
  const classes = useStyles();

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={classes.root}
        allowKeyboardControl
        disableFuture
        minDate={selectedDate || new Date('1984-01-01')}
        minDateMessage="Invalid date range"
        format="yyyy-MM-dd"
        value={selectedDate}
        onChange={handleDateChange}
        animateYearScrolling
        placeholder={props.startOrEnd}
      />
    </MuiPickersUtilsProvider>
  );
}

/// Would be nice to fire a warning message / not allow start date to be after end date and vice versa
