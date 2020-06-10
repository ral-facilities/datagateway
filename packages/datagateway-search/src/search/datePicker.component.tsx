import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { Action, AnyAction } from 'redux';
import { selectStartDate, selectEndDate } from '../state/actions/actions';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../state/app.types';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

interface DatePickerStoreProps {
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
}

interface DatePickerDispatchProps {
  selectStartDate: (date: MaterialUiPickersDate) => Action;
  selectEndDate: (date: MaterialUiPickersDate) => Action;
}

type DatePickerCombinedProps = DatePickerStoreProps & DatePickerDispatchProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1, 0),
    },
  })
);

export function SelectDates(props: DatePickerCombinedProps): JSX.Element {
  const { startDate, endDate, selectStartDate, selectEndDate } = props;
  const classes = useStyles();

  return (
    <div>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          clearable
          className={classes.root}
          allowKeyboardControl
          disableFuture
          maxDate={endDate || new Date('2100-01-01')}
          maxDateMessage="Invalid date range"
          format="yyyy-MM-dd"
          value={startDate}
          onChange={(date) => {
            selectStartDate(date);
          }}
          animateYearScrolling
          placeholder="Start Date"
          inputProps={{ 'aria-label': 'start date input' }}
        />
        <br></br>
        <KeyboardDatePicker
          clearable
          className={classes.root}
          allowKeyboardControl
          disableFuture
          minDate={startDate || new Date('1984-01-01')}
          minDateMessage="Invalid date range"
          format="yyyy-MM-dd"
          value={endDate}
          onChange={(date) => {
            selectEndDate(date);
          }}
          animateYearScrolling
          placeholder="End Date"
          inputProps={{ 'aria-label': 'end date input' }}
        />
      </MuiPickersUtilsProvider>
    </div>
  );
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DatePickerDispatchProps => ({
  selectStartDate: (date: MaterialUiPickersDate) =>
    dispatch(selectStartDate(date)),
  selectEndDate: (date: MaterialUiPickersDate) => dispatch(selectEndDate(date)),
});

const mapStateToProps = (state: StateType): DatePickerStoreProps => {
  return {
    // date: state.dgsearch.selectDate.date,
    startDate: state.dgsearch.selectDate.startDate,
    endDate: state.dgsearch.selectDate.endDate,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectDates);
