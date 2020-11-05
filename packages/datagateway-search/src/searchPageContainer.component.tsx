import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router';
import { Link } from 'react-router-dom';

import { Grid, Paper, LinearProgress } from '@material-ui/core';

import SearchPageTable from './searchPageTable';
import SearchBoxContainer from './searchBoxContainer.component';
import SearchBoxContainerSide from './searchBoxContainerSide.component';

interface SearchPageContainerStoreProps {
  entityCount: number;
  loading: boolean;
  sideLayout: boolean;
}
class SearchPageContainer extends React.Component<
  SearchPageContainerStoreProps
> {
  public constructor(props: SearchPageContainerStoreProps) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <Switch>
        <Route
          exact
          path="/"
          render={() => <Link to="/search/data">Search data</Link>}
        />
        <div>
          <Grid
            container
            direction={this.props.sideLayout ? 'row' : 'column'}
            justify="flex-start"
            alignItems="flex-start"
            spacing={2}
          >
            <Grid item id="container-search-filters">
              {this.props.sideLayout ? (
                <Paper style={{ height: '100%', width: '100%' }}>
                  <SearchBoxContainerSide />
                </Paper>
              ) : (
                <Paper style={{ height: '100%', width: 'calc(70vw)' }}>
                  <SearchBoxContainer />
                </Paper>
              )}
            </Grid>

            <Grid item id="container-search-table">
              <Paper
                style={{
                  height: 'calc(85vh)',
                  width: 'calc(70vw)',
                }}
              >
                {/* Show loading progress if data is still being loaded */}
                {this.props.loading && (
                  <Grid item xs={12}>
                    <LinearProgress color="secondary" />
                  </Grid>
                )}
                <SearchPageTable />
              </Paper>
            </Grid>
          </Grid>
        </div>
      </Switch>
    );
  }
}

const mapStateToProps = (state: StateType): SearchPageContainerStoreProps => ({
  entityCount: state.dgcommon.totalDataCount,
  loading: state.dgcommon.loading,
  sideLayout: state.dgsearch.sideLayout,
});

export default connect(mapStateToProps)(SearchPageContainer);
