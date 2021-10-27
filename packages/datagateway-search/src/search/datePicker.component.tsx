import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { useTranslation } from 'react-i18next';
import {
  parseSearchToQuery,
  usePushSearchEndDate,
  usePushSearchStartDate,
} from 'datagateway-common';
import { useLocation } from 'react-router';

interface DatePickerProps {
  initiateSearch: () => void;
}

interface DatePickerStoreProps {
  sideLayout: boolean;
}

type DatePickerCombinedProps = DatePickerProps & DatePickerStoreProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1, 0),
    },
  })
);

export function SelectDates(props: DatePickerCombinedProps): JSX.Element {
  const { sideLayout, initiateSearch } = props;
  const classes = useStyles();

  const [t] = useTranslation();

  const location = useLocation();
  const { startDate, endDate } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const pushStartDate = usePushSearchStartDate();
  const pushEndDate = usePushSearchEndDate();

  const isValidSearch = (): boolean => {
    // Check the values for each date field are valid dates
    const validStartDate = startDate && !isNaN(startDate.getDate());
    const validEndDate = endDate && !isNaN(endDate.getDate());

    // Two valid dates
    if (validStartDate && validEndDate) return true;

    // Valid start date, empty end date
    if (validStartDate && endDate == null) return true;

    // Valid end date, empty start date
    if (validEndDate && startDate == null) return true;

    if (startDate == null && endDate == null) return true;

    // No valid search
    return false;
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && isValidSearch()) {
      initiateSearch();
    }
  };

  return (
    <div className="tour-search-dates">
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
              pushStartDate(date);
            }}
            onKeyDown={handleKeyDown}
            animateYearScrolling
            placeholder={t('searchBox.start_date')}
            inputProps={{ 'aria-label': t('searchBox.start_date_arialabel') }}
            color="secondary"
            style={sideLayout ? {} : { paddingRight: 6 }}
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
              pushEndDate(date);
            }}
            onKeyDown={handleKeyDown}
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

const mapStateToProps = (state: StateType): DatePickerStoreProps => {
  return {
    // date: state.dgsearch.selectDate.date,
    sideLayout: state.dgsearch.sideLayout,
  };
};

export default connect(mapStateToProps)(SelectDates);
