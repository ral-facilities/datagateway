import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';

import { Grid, Typography, Paper } from '@material-ui/core';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';

const SearchBoxContainer = () => {
  return (
    <Grid
      item
      direction="column"
      justify="flex-start"
      alignItems="flex-start"
      aria-label="container-searchbox"
    >
      <Grid item>
        <SearchTextBox />
      </Grid>

      <Grid item>
        <SelectDates />
      </Grid>

      <Grid item>
        <CheckboxesGroup />
      </Grid>

      <Grid item>
        <SearchButton />
      </Grid>
    </Grid>
  );
};

export default SearchBoxContainer;
