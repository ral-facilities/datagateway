import React, { useState } from 'react';
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
  date: MaterialUiPickersDate ; 
  startdate: MaterialUiPickersDate ;
  enddate: MaterialUiPickersDate ;
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

function SelectDates(props: DatePickerCombinedProps): JSX.Element {
  const { date, startdate, enddate, selectStartDate, selectEndDate } = props;
  const classes = useStyles();

  const setStartDate = (startdate: MaterialUiPickersDate): any  => (
    event: React.ChangeEvent<HTMLInputElement>
  ):void  => {
    selectStartDate(startdate);
    console.log(date)
    console.log(startdate)
  }; 

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        clearable
        className={classes.root}
        allowKeyboardControl
        disableFuture
        maxDate={enddate || new Date('2100-01-01')}
        maxDateMessage="Invalid date range"
        format="yyyy-MM-dd"
        value={startdate}
        onChange={setStartDate(date)}}
        animateYearScrolling
        placeholder="Start Date"
      />
      <br></br>
      <KeyboardDatePicker
        clearable
        className={classes.root}
        allowKeyboardControl
        disableFuture
        minDate={startdate || new Date('1984-01-01')}
        minDateMessage="Invalid date range"
        format="yyyy-MM-dd"
        value={enddate}
        onChange={selectEndDate}
        animateYearScrolling
        placeholder="End Date"
      />
    </MuiPickersUtilsProvider>
  );
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DatePickerDispatchProps => ({
  selectStartDate: (date: MaterialUiPickersDate) => dispatch(selectStartDate(date)),
  selectEndDate: (date: MaterialUiPickersDate) => dispatch(selectEndDate(date)),
});

const mapStateToProps = (state: StateType): DatePickerStoreProps => {
  return {
    date: state.dgsearch.selectDate.date,
    startdate: state.dgsearch.selectDate.startdate,
    enddate: state.dgsearch.selectDate.enddate,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectDates);
