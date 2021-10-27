import React from 'react';

import { Grid, Box } from '@material-ui/core';

import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

interface SearchBoxContainerProps {
  searchText: string;
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
  initiateSearch: () => void;
  onSearchTextChange: (searchText: string) => void;
  onToggleDataset: (toggleOption: boolean) => void;
  onToggleDatafile: (toggleOption: boolean) => void;
  onToggleInvestigation: (toggleOption: boolean) => void;
  onSelectStartDate: (startDate: MaterialUiPickersDate) => void;
  onSelectEndDate: (endDate: MaterialUiPickersDate) => void;
}

const SearchBoxContainerSide = (
  props: SearchBoxContainerProps
): React.ReactElement => {
  const {
    searchText,
    dataset,
    datafile,
    investigation,
    startDate,
    endDate,
    initiateSearch,
    onSearchTextChange,
    onToggleDataset,
    onToggleDatafile,
    onToggleInvestigation,
    onSelectStartDate,
    onSelectEndDate,
  } = props;

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
          <SearchTextBox
            searchText={searchText}
            initiateSearch={initiateSearch}
            onChange={onSearchTextChange}
          />
        </Box>
      </Grid>

      <Grid item>
        <Box px={2}>
          <SelectDates
            startDate={startDate}
            endDate={endDate}
            initiateSearch={initiateSearch}
            onSelectStartDate={onSelectStartDate}
            onSelectEndDate={onSelectEndDate}
          />
        </Box>
      </Grid>

      <Grid item>
        <CheckboxesGroup
          dataset={dataset}
          datafile={datafile}
          investigation={investigation}
          onToggleDataset={onToggleDataset}
          onToggleDatafile={onToggleDatafile}
          onToggleInvestigation={onToggleInvestigation}
        />
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
