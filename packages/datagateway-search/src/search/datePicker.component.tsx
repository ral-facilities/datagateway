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
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { Box, TextField, Theme } from '@mui/material';

interface DatePickerProps {
  initiateSearch: () => void;
}

interface DatePickerStoreProps {
  sideLayout: boolean;
}

type DatePickerCombinedProps = DatePickerProps & DatePickerStoreProps;

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

  return (
    <div className="tour-search-dates">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <>
          <DatePicker
            clearable
            maxDate={endDate || new Date()}
            inputFormat="yyyy-MM-dd"
            mask="____-__-__"
            value={startDate}
            onChange={(date) => {
              handleChange(date as Date, 'startDate');
            }}
            clearText={
              <Box
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sx={{ color: (theme: Theme) => (theme as any).colours?.blue }}
              >
                Clear
              </Box>
            }
            renderInput={(props) => {
              const error =
                // eslint-disable-next-line react/prop-types
                props.error || invalidDateRange;
              let helperText = t('searchBox.invalid_date_message');
              if (invalidDateRange)
                helperText = t('searchBox.invalid_date_range_message');

              return (
                <TextField
                  {...props}
                  inputProps={{
                    // eslint-disable-next-line react/prop-types
                    ...props.inputProps,
                    placeholder: t('searchBox.start_date'),
                    'aria-label': t('searchBox.start_date_arialabel'),
                  }}
                  onKeyDown={handleKeyDown}
                  sx={sideLayout ? {} : { py: 1, width: '178px' }}
                  variant="outlined"
                  error={error}
                  // eslint-disable-next-line react/prop-types
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
          {sideLayout ? <br></br> : null}
          <DatePicker
            clearable
            minDate={startDate || new Date('1984-01-01T00:00:00Z')}
            inputFormat="yyyy-MM-dd"
            mask="____-__-__"
            value={endDate}
            onChange={(date) => {
              handleChange(date as Date, 'endDate');
            }}
            clearText={
              <Box
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sx={{ color: (theme: Theme) => (theme as any).colours?.blue }}
              >
                Clear
              </Box>
            }
            renderInput={(props) => {
              const error =
                // eslint-disable-next-line react/prop-types
                props.error || invalidDateRange;
              let helperText = t('searchBox.invalid_date_message');
              if (invalidDateRange)
                helperText = t('searchBox.invalid_date_range_message');

              return (
                <TextField
                  {...props}
                  inputProps={{
                    // eslint-disable-next-line react/prop-types
                    ...props.inputProps,
                    placeholder: t('searchBox.end_date'),
                    'aria-label': t('searchBox.end_date_arialabel'),
                  }}
                  onKeyDown={handleKeyDown}
                  variant="outlined"
                  sx={
                    sideLayout
                      ? { py: 1, px: 0 }
                      : { pl: 1, py: 1, width: '178px' }
                  }
                  error={error}
                  // eslint-disable-next-line react/prop-types
                  {...(error && { helperText: helperText })}
                />
              );
            }}
          />
        </>
      </LocalizationProvider>
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
