import React, { useState } from 'react';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { useTranslation } from 'react-i18next';
import {
  parseSearchToQuery,
  usePushSearchEndDate,
  usePushSearchStartDate,
} from 'datagateway-common';
import { useLocation } from 'react-router-dom';
import { isBefore, isValid } from 'date-fns';
import {
  TextField,
  TextFieldProps,
  ThemeProvider,
  createTheme,
  useTheme,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { enGB } from 'date-fns/locale';

interface DatePickerProps {
  initiateSearch: () => void;
}

interface DatePickerStoreProps {
  sideLayout: boolean;
}

type DatePickerCombinedProps = DatePickerProps & DatePickerStoreProps;

const CustomTextField: React.FC<TextFieldProps> = (props) => {
  const { invalidDateRange, t, sideLayout, ...inputProps } =
    props.inputProps ?? {};
  const error =
    // eslint-disable-next-line react/prop-types
    (props.error || invalidDateRange) ?? undefined;
  let helperText = t('searchBox.invalid_date_message');
  if (invalidDateRange) helperText = t('searchBox.invalid_date_range_message');
  return (
    <TextField
      {...props}
      inputProps={{
        // eslint-disable-next-line react/prop-types
        ...inputProps,
      }}
      sx={
        props.inputProps?.placeholder === t('searchBox.start_date')
          ? sideLayout
            ? {}
            : { py: 1, width: '178px' }
          : sideLayout
          ? { py: 1, px: 0 }
          : { pl: 1, py: 1, width: '178px' }
      }
      variant="outlined"
      error={error}
      // eslint-disable-next-line react/prop-types
      {...(error && { helperText: helperText })}
    />
  );
};

export function SelectDates(props: DatePickerCombinedProps): JSX.Element {
  const { sideLayout, initiateSearch } = props;

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
    date: Date | null,
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

  const invalidDateRange = startDate && endDate && isBefore(endDate, startDate);

  // can't set the main colour to secondary the "normal" MUI way, so have a sub-theme
  // to override the primary colour for the date pickers
  const theme = useTheme();
  const subTheme = createTheme(theme, {
    palette: {
      primary:
        theme.palette.mode === 'dark'
          ? theme.palette.secondary
          : theme.palette.primary,
    },
  });

  return (
    <div className="tour-search-dates">
      <ThemeProvider theme={subTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
          <>
            <DatePicker
              format="yyyy-MM-dd"
              views={['year', 'month', 'day']}
              value={startDate}
              maxDate={endDate || new Date()}
              onChange={(date) => {
                handleChange(date as Date, 'startDate');
              }}
              slots={{
                textField: CustomTextField,
              }}
              slotProps={{
                actionBar: {
                  actions: ['clear'],
                },
                textField: {
                  inputProps: {
                    invalidDateRange,
                    sideLayout,
                    t: t,
                    placeholder: t('searchBox.start_date'),
                    'aria-label': t('searchBox.start_date_arialabel'),
                  },
                  onKeyDown: handleKeyDown,
                },
              }}
            />
            {sideLayout ? <br></br> : null}
            <DatePicker
              format="yyyy-MM-dd"
              views={['year', 'month', 'day']}
              value={endDate}
              minDate={startDate || new Date('1984-01-01T00:00:00Z')}
              onChange={(date) => {
                handleChange(date as Date, 'endDate');
              }}
              slots={{
                textField: CustomTextField,
              }}
              slotProps={{
                actionBar: {
                  actions: ['clear'],
                },
                textField: {
                  inputProps: {
                    invalidDateRange,
                    sideLayout,
                    t: t,
                    placeholder: t('searchBox.end_date'),
                    'aria-label': t('searchBox.end_date_arialabel'),
                  },
                  onKeyDown: handleKeyDown,
                },
              }}
            />
          </>
        </LocalizationProvider>
      </ThemeProvider>
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
