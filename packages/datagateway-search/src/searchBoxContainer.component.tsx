import React from 'react';

import { Grid } from '@material-ui/core';

import { Switch, Route, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';

const SearchBoxContainer = () => {
  return (
    <Route
      exact
      path="/"
      render={
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
      }
    />
  );
};

export default SearchBoxContainer;
