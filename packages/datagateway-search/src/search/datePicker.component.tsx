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
import { useTranslation } from 'react-i18next';

interface DatePickerStoreProps {
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
  sideLayout: boolean;
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
  const {
    startDate,
    endDate,
    sideLayout,
    selectStartDate,
    selectEndDate,
  } = props;
  const classes = useStyles();

  const [t] = useTranslation();

  return (
    <div>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <>
          <KeyboardDatePicker
            clearable
            className={classes.root}
            allowKeyboardControl
            disableFuture
            inputVariant="outlined"
            maxDate={endDate || new Date('2100-01-01')}
            maxDateMessage={t('searchBox.invalid_date_message')}
            format="yyyy-MM-dd"
            value={startDate}
            onChange={(date) => {
              selectStartDate(date);
            }}
            animateYearScrolling
            placeholder={t('searchBox.start_date')}
            inputProps={{ 'aria-label': t('searchBox.start_date_arialabel') }}
            color="secondary"
            style={sideLayout ? {} : { paddingRight: 8 }}
          />
          {sideLayout ? <br></br> : null}
          <KeyboardDatePicker
            clearable
            className={classes.root}
            allowKeyboardControl
            inputVariant="outlined"
            disableFuture
            minDate={startDate || new Date('1984-01-01')}
            minDateMessage={t('searchBox.invalid_date_message')}
            format="yyyy-MM-dd"
            value={endDate}
            onChange={(date) => {
              selectEndDate(date);
            }}
            animateYearScrolling
            placeholder={t('searchBox.end_date')}
            inputProps={{ 'aria-label': t('searchBox.end_date_arialabel') }}
            color="secondary"
          />
        </>
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
    sideLayout: state.dgsearch.sideLayout,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectDates);
