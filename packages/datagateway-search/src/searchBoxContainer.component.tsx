import React from 'react';

import { Grid, Box } from '@material-ui/core';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';

const SearchBoxContainer = (): React.ReactElement => {
  return (
    <Grid
      item
      direction="column"
      justify="flex-start"
      alignItems="stretch"
      id="container-searchbox"
    >
      <Grid item>
        <Box px={2}>
          <SearchTextBox />
        </Box>
      </Grid>

      <Grid item>
        <Box px={2}>
          <SelectDates />
        </Box>
      </Grid>

      <Grid item>
        <CheckboxesGroup />
      </Grid>

      <Grid item>
        <Box mx={5} pb={2}>
          <SearchButton />
        </Box>
      </Grid>
    </Grid>
  );
};

export default SearchBoxContainer;
