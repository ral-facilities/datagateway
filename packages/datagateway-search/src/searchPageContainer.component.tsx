import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import { Switch, Route, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

import { Grid, Paper, LinearProgress } from '@material-ui/core';

import SearchPageTable from './searchPageTable';
import SearchBoxContainer from './searchBoxContainer.component';
import SearchBoxContainerSide from './searchBoxContainerSide.component';

import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { useLuceneSearch } from 'datagateway-common';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  setDatafileTab,
  setDatasetTab,
  setInvestigationTab,
} from './state/actions/actions';

interface SearchPageContainerStoreProps {
  sideLayout: boolean;
  searchText: string;
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
  datafileTab: boolean;
  datasetTab: boolean;
  investigationTab: boolean;
}

interface SearchPageContainerDispatchProps {
  setDatasetTab: (toggleOption: boolean) => Action;
  setDatafileTab: (toggleOption: boolean) => Action;
  setInvestigationTab: (toggleOption: boolean) => Action;
}

type SearchPageContainerCombinedProps = SearchPageContainerStoreProps &
  SearchPageContainerDispatchProps;

const SearchPageContainer: React.FC<SearchPageContainerCombinedProps> = (
  props: SearchPageContainerCombinedProps
) => {
  const {
    searchText,
    startDate,
    endDate,
    datafile,
    dataset,
    investigation,
    setDatafileTab,
    setDatasetTab,
    setInvestigationTab,
    sideLayout,
  } = props;

  const {
    refetch: searchInvestigations,
    isIdle: investigationsIdle,
    isFetching: investigationsFetching,
  } = useLuceneSearch('Investigation', {
    searchText,
    startDate,
    endDate,
  });
  const {
    refetch: searchDatasets,
    isIdle: datasetsIdle,
    isFetching: datasetsFetching,
  } = useLuceneSearch('Dataset', {
    searchText,
    startDate,
    endDate,
  });
  const {
    refetch: searchDatafiles,
    isIdle: datafilesIdle,
    isFetching: datafilesFetching,
  } = useLuceneSearch('Datafile', {
    searchText,
    startDate,
    endDate,
  });

  const requestReceived =
    !investigationsIdle || !datasetsIdle || !datafilesIdle;

  const loading =
    investigationsFetching || datasetsFetching || datafilesFetching;

  const initiateSearch = React.useCallback(() => {
    if (dataset) {
      // Fetch lucene datasets
      searchDatasets();
    }

    if (datafile) {
      // Fetch lucene datafiles
      searchDatafiles();
    }
    if (investigation) {
      // Fetch lucene investigations
      searchInvestigations();
    }

    // Set the appropriate tabs.
    setDatafileTab(datafile);
    setDatasetTab(dataset);
    setInvestigationTab(investigation);
  }, [
    datafile,
    dataset,
    investigation,
    searchDatafiles,
    searchDatasets,
    searchInvestigations,
    setDatafileTab,
    setDatasetTab,
    setInvestigationTab,
  ]);

  // Table should take up page but leave room for: SG appbar, SG footer,
  // grid padding, search box, checkboxes, date selectors, padding.
  const spacing = 2;
  const containerHeight = `calc(100vh - 64px - 30px - ${spacing}*16px - (69px + 19rem/16) - 42px - (53px + 19rem/16) - 8px)`;

  return (
    <Switch>
      <Route
        exact
        path="/"
        render={() => <Link to="/search/data">Search data</Link>}
      />
      <Route
        path="/search/:hierarchy"
        render={({ match }: RouteComponentProps<{ hierarchy: string }>) => (
          <Grid
            container
            direction={sideLayout ? 'row' : 'column'}
            justify="center"
            alignItems="center"
            spacing={spacing}
            style={{ margin: 0, width: '100%' }}
          >
            <Grid item id="container-search-filters">
              {sideLayout ? (
                <Paper style={{ height: '100%', width: '100%' }}>
                  <SearchBoxContainerSide initiateSearch={initiateSearch} />
                </Paper>
              ) : (
                <Paper
                  style={{
                    height: '100%',
                    width: '70vw',
                    minWidth: 584, // Minimum width to ensure search box contents stay aligned
                  }}
                >
                  <SearchBoxContainer initiateSearch={initiateSearch} />
                </Paper>
              )}
            </Grid>

            {requestReceived && (
              <Grid container justify="center" id="container-search-table">
                <Paper
                  style={{
                    height: containerHeight,
                    minHeight: 326,
                    width: '99vw',
                    minWidth: 584,
                  }}
                >
                  {/* Show loading progress if data is still being loaded */}
                  {loading && (
                    <Grid item xs={12}>
                      <LinearProgress color="secondary" />
                    </Grid>
                  )}
                  <SearchPageTable
                    containerHeight={containerHeight}
                    hierarchy={match.params.hierarchy}
                  />
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      />
    </Switch>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): SearchPageContainerDispatchProps => ({
  setDatasetTab: (toggleOption: boolean) =>
    dispatch(setDatasetTab(toggleOption)),
  setDatafileTab: (toggleOption: boolean) =>
    dispatch(setDatafileTab(toggleOption)),
  setInvestigationTab: (toggleOption: boolean) =>
    dispatch(setInvestigationTab(toggleOption)),
});

const mapStateToProps = (state: StateType): SearchPageContainerStoreProps => ({
  sideLayout: state.dgsearch.sideLayout,
  searchText: state.dgsearch.searchText,
  dataset: state.dgsearch.checkBox.dataset,
  datafile: state.dgsearch.checkBox.datafile,
  investigation: state.dgsearch.checkBox.investigation,
  startDate: state.dgsearch.selectDate.startDate,
  endDate: state.dgsearch.selectDate.endDate,
  datafileTab: state.dgsearch.tabs.datafileTab,
  datasetTab: state.dgsearch.tabs.datasetTab,
  investigationTab: state.dgsearch.tabs.investigationTab,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPageContainer);
