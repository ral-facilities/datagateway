import React, { useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import {
  Theme,
  createStyles,
  makeStyles,
  useTheme,
} from '@material-ui/core/styles';
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
import { isValid } from 'date-fns';

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
  const inputClasses = useInputStyles();
  const helperTextClasses = useHelperTextStyles();

  const [t] = useTranslation();

  const location = useLocation();
  const { startDate: startDateURL, endDate: endDateURL } = React.useMemo(() => {
    const queryParams = parseSearchToQuery(location.search);
    //Ensure default value loaded from URL is valid (otherwise it will not format correctly)
    if (queryParams.startDate && !isValid(queryParams.startDate))
      queryParams.startDate = null;
    if (queryParams.endDate && !isValid(queryParams.endDate))
      queryParams.endDate = null;
    return queryParams;
  }, [location.search]);

  const pushStartDate = usePushSearchStartDate();
  const pushEndDate = usePushSearchEndDate();

  const [startDate, setStartDate] = useState(startDateURL);
  const [endDate, setEndDate] = useState(endDateURL);

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

  const handleChange = (
    date: MaterialUiPickersDate,
    dateName: 'startDate' | 'endDate'
  ): void => {
    //Only push date when valid (and not every keypress when typing)
    const valid = date === null || !isNaN(date.getDate());

    if (dateName === 'startDate') {
      setStartDate(date);
      if (valid) pushStartDate(date);
    } else if (dateName === 'endDate') {
      setEndDate(date);
      if (valid) pushEndDate(date);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && isValidSearch()) {
      initiateSearch();
    }
  };

  //Obtain a contrast friendly button colour
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buttonColour = (theme as any).ukri?.contrast?.blue;

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
            maxDate={endDate || new Date('2100-01-01T00:00:00Z')}
            maxDateMessage={t('searchBox.invalid_date_range_message')}
            format="yyyy-MM-dd"
            value={startDate}
            onChange={(date) => {
              handleChange(date, 'startDate');
            }}
            onKeyDown={handleKeyDown}
            animateYearScrolling
            placeholder={t('searchBox.start_date')}
            inputProps={{ 'aria-label': t('searchBox.start_date_arialabel') }}
            color="secondary"
            style={sideLayout ? {} : { paddingRight: 6 }}
            FormHelperTextProps={{
              classes: helperTextClasses,
            }}
            InputProps={{
              classes: inputClasses,
            }}
            okLabel={
              <span style={{ color: buttonColour }}>
                {t('searchBox.date_picker.ok')}
              </span>
            }
            cancelLabel={
              <span style={{ color: buttonColour }}>
                {t('searchBox.date_picker.cancel')}
              </span>
            }
            clearLabel={
              <span style={{ color: buttonColour }}>
                {t('searchBox.date_picker.clear')}
              </span>
            }
          />
          {sideLayout ? <br></br> : null}
          <KeyboardDatePicker
            clearable
            className={classes.root}
            allowKeyboardControl
            inputVariant="outlined"
            disableFuture
            minDate={startDate || new Date('1984-01-01T00:00:00Z')}
            minDateMessage={t('searchBox.invalid_date_range_message')}
            format="yyyy-MM-dd"
            value={endDate}
            onChange={(date) => {
              handleChange(date, 'endDate');
            }}
            onKeyDown={handleKeyDown}
            animateYearScrolling
            placeholder={t('searchBox.end_date')}
            inputProps={{ 'aria-label': t('searchBox.end_date_arialabel') }}
            color="secondary"
            FormHelperTextProps={{
              classes: helperTextClasses,
            }}
            InputProps={{
              classes: inputClasses,
            }}
            okLabel={
              <span style={{ color: buttonColour }}>
                {t('searchBox.date_picker.ok')}
              </span>
            }
            cancelLabel={
              <span style={{ color: buttonColour }}>
                {t('searchBox.date_picker.cancel')}
              </span>
            }
            clearLabel={
              <span style={{ color: buttonColour }}>
                {t('searchBox.date_picker.clear')}
              </span>
            }
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
