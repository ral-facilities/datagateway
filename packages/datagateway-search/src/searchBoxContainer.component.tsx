import React from 'react';

import { Grid, Box, IconButton } from '@material-ui/core';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';

const SearchBoxContainer = (): React.ReactElement => {
  const [advancedSearch, setAdvancedSearch] = React.useState(false);

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="stretch"
      id="container-searchbox"
    >
      <Grid item style={{ display: 'flex' }}>
        <Box pl={2} m="auto">
          <IconButton
            aria-label="Toggle advanced search"
            onClick={() => setAdvancedSearch(!advancedSearch)}
          >
            {advancedSearch ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowRightIcon />
            )}
          </IconButton>
        </Box>
      </Grid>

      <Grid item xs>
        <Box pl={2} pb={1}>
          <SearchTextBox />
        </Box>
      </Grid>

      <Grid item style={{ display: 'flex' }}>
        <Box px={2} m="auto">
          <SearchButton />
        </Box>
      </Grid>

      {advancedSearch ? (
        <div>
          <Grid container item style={{ paddingBottom: 8 }}>
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
        </div>
      ) : null}
    </Grid>
  );
};

export default SearchBoxContainer;
