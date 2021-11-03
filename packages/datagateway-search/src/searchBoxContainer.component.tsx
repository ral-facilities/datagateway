import React from 'react';

import { Grid, Box } from '@material-ui/core';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';

interface SearchBoxContainerProps {
  searchText: string;
  initiateSearch: () => void;
  onSearchTextChange: (searchText: string) => void;
}

const SearchBoxContainer = (
  props: SearchBoxContainerProps
): React.ReactElement => {
  const { searchText, initiateSearch, onSearchTextChange } = props;

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="stretch"
      id="container-searchbox"
    >
      <Grid item xs={8}>
        <Box pl={2} pb={1}>
          <SearchTextBox
            searchText={searchText}
            initiateSearch={initiateSearch}
            onChange={onSearchTextChange}
          />
        </Box>
      </Grid>

      <Grid item style={{ display: 'flex' }}>
        <Box px={2} m="auto">
          <SearchButton initiateSearch={initiateSearch} />
        </Box>
      </Grid>

      <Grid container item justify="center" style={{ paddingBottom: 8 }}>
        <Grid item style={{ display: 'flex' }}>
          <Box m="auto">
            <CheckboxesGroup />
          </Box>
        </Grid>

        <Grid item>
          <Box px={0.75}>
            <SelectDates initiateSearch={initiateSearch} />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SearchBoxContainer;
