import React from 'react';

import { Grid, Box } from '@material-ui/core';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';

interface SearchBoxContainerProps {
  initiateSearch: () => void;
}

const SearchBoxContainerSide = (
  props: SearchBoxContainerProps
): React.ReactElement => {
  const { initiateSearch } = props;

  return (
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="stretch"
      id="container-searchbox"
    >
      <Grid item>
        <Box px={2}>
          <SearchTextBox initiateSearch={initiateSearch} />
        </Box>
      </Grid>

      <Grid item>
        <Box px={2}>
          <SelectDates initiateSearch={initiateSearch} />
        </Box>
      </Grid>

      <Grid item>
        <CheckboxesGroup />
      </Grid>

      <Grid item>
        <Box mx={5} pb={2}>
          <SearchButton initiateSearch={initiateSearch} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default SearchBoxContainerSide;
