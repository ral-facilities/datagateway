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

const SearchBoxContainer = (
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
            <CheckboxesGroup
              dataset={dataset}
              datafile={datafile}
              investigation={investigation}
              onToggleDataset={onToggleDataset}
              onToggleDatafile={onToggleDatafile}
              onToggleInvestigation={onToggleInvestigation}
            />
          </Box>
        </Grid>

        <Grid item>
          <Box px={0.75}>
            <SelectDates
              startDate={startDate}
              endDate={endDate}
              initiateSearch={initiateSearch}
              onSelectStartDate={onSelectStartDate}
              onSelectEndDate={onSelectEndDate}
            />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SearchBoxContainer;
