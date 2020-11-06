import React from 'react';

import { Grid, Box } from '@material-ui/core';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';

const SearchBoxContainer = (): React.ReactElement => {
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
          <SearchTextBox />
        </Box>
      </Grid>

      <Grid item style={{ display: 'flex' }}>
        <Box px={2} m="auto">
          <SearchButton />
        </Box>
      </Grid>

      <Grid container item justify="center" style={{ paddingBottom: 8 }}>
        <Grid item style={{ display: 'flex' }}>
          <Box m="auto">
            <CheckboxesGroup />
          </Box>
        </Grid>

        <Grid item>
          <Box px={2}>
            <SelectDates />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SearchBoxContainer;
