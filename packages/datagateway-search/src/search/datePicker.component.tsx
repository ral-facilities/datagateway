import React, { useState } from 'react';
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
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { isAfter, isBefore, isValid } from 'date-fns';

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

// error color received from parent app theme object this requires
// casting the theme to any so that we can explicitly access properties
// we know to exist in the received object
const useInputStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '&$error $notchedOutline': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        borderColor: (theme as any).ukri?.contrast?.red,
      },
    },
    error: {},
    notchedOutline: {},
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

export function SelectDates(props: DatePickerCombinedProps): JSX.Element {
  const { sideLayout, initiateSearch } = props;
  const classes = useStyles();
  const helperTextClasses = useHelperTextStyles();
  const inputStyles = useInputStyles();

  const [t] = useTranslation();

  const location = useLocation();
  const { startDate: startDateURL, endDate: endDateURL } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const pushStartDate = usePushSearchStartDate();
  const pushEndDate = usePushSearchEndDate();

  const [startDate, setStartDate] = useState(startDateURL);
  const [endDate, setEndDate] = useState(endDateURL);
  const [startDateError, setStartDateError] = useState(null);
  const [endDateError, setEndDateError] = useState(null);

  //Min/Max valid dates
  const minDate = startDate || new Date('1984-01-01T00:00:00Z');
  const maxDate = endDate || new Date('2100-01-01T00:00:00Z');

  const checkValidStartDate = (startDate: Date | null): boolean => {
    if (startDate !== null) {
      //Ignore time
      startDate.setHours(0, 0, 0, 0);
      if (!isValid(startDate)) {
        setStartDateError(t('searchBox.invalid_date_message'));
        return false;
      } else if (isAfter(startDate, maxDate)) {
        setStartDateError(t('searchBox.invalid_date_range_message'));
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
        setEndDateError(t('searchBox.invalid_date_message'));
        return false;
      } else if (isBefore(endDate, minDate)) {
        setEndDateError(t('searchBox.invalid_date_range_message'));
        return false;
      }
    }
    //Valid if null or if no errors found above
    setEndDateError(null);
    return true;
  };

  const isValidSearch = (): boolean => {
    return checkValidStartDate(startDate) && checkValidEndDate(endDate);
  };

  const handleStartDateChange = (startDate: MaterialUiPickersDate): void => {
    setStartDate(startDate);
    //Only push date when valid (and not every keypress when typing)
    if (checkValidStartDate(startDate)) pushStartDate(startDate);
  };

  const handleEndDateChange = (endDate: MaterialUiPickersDate): void => {
    setEndDate(endDate);
    //Only push date when valid (and not every keypress when typing)
    if (checkValidEndDate(endDate)) pushEndDate(endDate);
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
            maxDate={maxDate}
            maxDateMessage={t('searchBox.invalid_date_range_message')}
            format="yyyy-MM-dd"
            value={startDate}
            onChange={(date) => {
              handleStartDateChange(date);
            }}
            onKeyDown={handleKeyDown}
            animateYearScrolling
            placeholder={t('searchBox.start_date')}
            inputProps={{ 'aria-label': t('searchBox.start_date_arialabel') }}
            color="secondary"
            style={sideLayout ? {} : { paddingRight: 6 }}
            error={startDateError !== null}
            helperText={startDateError}
            FormHelperTextProps={{
              classes: helperTextClasses,
            }}
            InputProps={{
              classes: inputStyles,
            }}
          />
          {sideLayout ? <br></br> : null}
          <KeyboardDatePicker
            clearable
            className={classes.root}
            allowKeyboardControl
            inputVariant="outlined"
            disableFuture
            minDate={minDate}
            minDateMessage={t('searchBox.invalid_date_range_message')}
            format="yyyy-MM-dd"
            value={endDate}
            onChange={(date) => {
              handleEndDateChange(date);
            }}
            onKeyDown={handleKeyDown}
            animateYearScrolling
            placeholder={t('searchBox.end_date')}
            inputProps={{ 'aria-label': t('searchBox.end_date_arialabel') }}
            color="secondary"
            error={endDateError !== null}
            helperText={endDateError}
            FormHelperTextProps={{
              classes: helperTextClasses,
            }}
            InputProps={{
              classes: inputStyles,
            }}
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
