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
import { LuceneSearchParams } from 'datagateway-common';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  fetchLuceneDatafiles,
  fetchLuceneDatasets,
  fetchLuceneInvestigations,
  setDatafileTab,
  setDatasetTab,
  setInvestigationTab,
} from './state/actions/actions';

interface SearchPageContainerStoreProps {
  entityCount: number;
  loading: boolean;
  sideLayout: boolean;
  requestReceived: boolean;
  searchText: string;
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
  luceneDatafile: number[];
  luceneDataset: number[];
  luceneInvestigation: number[];
  datafileTab: boolean;
  datasetTab: boolean;
  investigationTab: boolean;
}

interface SearchPageContainerDispatchProps {
  fetchLuceneInvestigations: (params: LuceneSearchParams) => Promise<void>;
  fetchLuceneDatasets: (params: LuceneSearchParams) => Promise<void>;
  fetchLuceneDatafiles: (params: LuceneSearchParams) => Promise<void>;

  setDatasetTab: (toggleOption: boolean) => Action;
  setDatafileTab: (toggleOption: boolean) => Action;
  setInvestigationTab: (toggleOption: boolean) => Action;
}

type SearchPageContainerCombinedProps = SearchPageContainerStoreProps &
  SearchPageContainerDispatchProps;
class SearchPageContainer extends React.Component<SearchPageContainerCombinedProps> {
  public constructor(props: SearchPageContainerCombinedProps) {
    super(props);
    this.initiateSearch = this.initiateSearch.bind(this);
  }

  public initiateSearch = (): Promise<void> => {
    if (this.props.dataset) {
      // Fetch lucene datasets
      this.props.fetchLuceneDatasets({
        searchText: this.props.searchText,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      });
    }

    if (this.props.datafile) {
      // Fetch lucene datafiles
      this.props.fetchLuceneDatafiles({
        searchText: this.props.searchText,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      });
    }
    if (this.props.investigation) {
      // Fetch lucene investigations
      this.props.fetchLuceneInvestigations({
        searchText: this.props.searchText,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
      });
    }

    // Set the appropriate tabs.
    this.props.setDatafileTab(this.props.datafile);
    this.props.setDatasetTab(this.props.dataset);
    this.props.setInvestigationTab(this.props.investigation);

    return Promise.resolve();
  };

  public render(): React.ReactElement {
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
            <div>
              <Grid
                container
                direction={this.props.sideLayout ? 'row' : 'column'}
                justify="center"
                alignItems="center"
                spacing={spacing}
                style={{ margin: 0, width: '100%' }}
              >
                <Grid item id="container-search-filters">
                  {this.props.sideLayout ? (
                    <Paper style={{ height: '100%', width: '100%' }}>
                      <SearchBoxContainerSide
                        initiateSearch={this.initiateSearch}
                      />
                    </Paper>
                  ) : (
                    <Paper
                      style={{
                        height: '100%',
                        width: '70vw',
                        minWidth: 584,
                      }}
                    >
                      <SearchBoxContainer
                        initiateSearch={this.initiateSearch}
                      />
                    </Paper>
                  )}
                </Grid>

                {this.props.requestReceived && (
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
                      {this.props.loading && (
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
            </div>
          )}
        />
      </Switch>
    );
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): SearchPageContainerDispatchProps => ({
  fetchLuceneInvestigations: (params: LuceneSearchParams) =>
    dispatch(fetchLuceneInvestigations(params)),
  fetchLuceneDatasets: (params: LuceneSearchParams) =>
    dispatch(fetchLuceneDatasets(params)),
  fetchLuceneDatafiles: (params: LuceneSearchParams) =>
    dispatch(fetchLuceneDatafiles(params)),

  setDatasetTab: (toggleOption: boolean) =>
    dispatch(setDatasetTab(toggleOption)),
  setDatafileTab: (toggleOption: boolean) =>
    dispatch(setDatafileTab(toggleOption)),
  setInvestigationTab: (toggleOption: boolean) =>
    dispatch(setInvestigationTab(toggleOption)),
});

const mapStateToProps = (state: StateType): SearchPageContainerStoreProps => ({
  entityCount: state.dgcommon.totalDataCount,
  loading: state.dgcommon.loading,
  sideLayout: state.dgsearch.sideLayout,
  requestReceived: state.dgsearch.requestReceived,
  searchText: state.dgsearch.searchText,
  dataset: state.dgsearch.checkBox.dataset,
  datafile: state.dgsearch.checkBox.datafile,
  investigation: state.dgsearch.checkBox.investigation,
  startDate: state.dgsearch.selectDate.startDate,
  endDate: state.dgsearch.selectDate.endDate,
  luceneDataset: state.dgsearch.searchData.dataset,
  luceneDatafile: state.dgsearch.searchData.datafile,
  luceneInvestigation: state.dgsearch.searchData.investigation,
  datafileTab: state.dgsearch.tabs.datafileTab,
  datasetTab: state.dgsearch.tabs.datasetTab,
  investigationTab: state.dgsearch.tabs.investigationTab,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPageContainer);
