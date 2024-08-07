import React from 'react';

import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import { ArrowTooltip } from 'datagateway-common';
import { useTranslation } from 'react-i18next';

interface SearchBoxContainerProps {
  searchText: string;
  restrict: boolean;
  loggedInAnonymously: boolean;
  initiateSearch: () => void;
  onSearchTextChange: (searchText: string) => void;
  onMyDataCheckboxChange: (checked: boolean) => void;
}

const SearchBoxContainerSide = (
  props: SearchBoxContainerProps
): React.ReactElement => {
  const {
    searchText,
    restrict,
    loggedInAnonymously,
    initiateSearch,
    onSearchTextChange,
    onMyDataCheckboxChange,
  } = props;

  const [t] = useTranslation();

  function toggleRestrict(event: React.ChangeEvent<HTMLInputElement>): void {
    onMyDataCheckboxChange(event.target.checked);
  }

  return (
    <Grid
      data-testid="search-box-container-side"
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      id="container-searchbox"
    >
      <Grid item>
        <Box px={2}>
          <SearchTextBox
            searchText={searchText}
            initiateSearch={initiateSearch}
            onChange={onSearchTextChange}
          />
        </Box>
      </Grid>

      <Grid item>
        <Box px={2}>
          <SelectDates initiateSearch={initiateSearch} />
        </Box>
      </Grid>

      <Grid item>
        <Box px={1}>
          <CheckboxesGroup />
        </Box>
      </Grid>

      {/* Only show the "my data" search box if the user is logged in
            because "my data" means data specific to a user,
            which doesn't make sense if the user is not logged in. */}
      {!loggedInAnonymously && (
        <Grid item>
          <Box px={2}>
            <ArrowTooltip
              title={
                t('searchBox.my_data_tooltip') ??
                'If this is enabled, only the data generated by you will be shown.'
              }
              disableHoverListener={false}
            >
              <FormControlLabel
                control={
                  <Checkbox checked={restrict} onChange={toggleRestrict} />
                }
                label={t('check_boxes.my_data')}
              />
            </ArrowTooltip>
          </Box>
        </Grid>
      )}

      <Grid item>
        <Box mx={5} pb={2}>
          <SearchButton initiateSearch={initiateSearch} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default SearchBoxContainerSide;
