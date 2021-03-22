import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import { Switch, Route, RouteComponentProps } from 'react-router';
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
class SearchPageContainer extends React.Component<SearchPageContainerStoreProps> {
  public constructor(props: SearchPageContainerStoreProps) {
    super(props);
  }

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
                justify="flex-start"
                alignItems="flex-start"
                spacing={spacing}
                style={{ margin: 0, width: '100%' }}
              >
                <Grid item id="container-search-filters">
                  {this.props.sideLayout ? (
                    <Paper style={{ height: '100%', width: '100%' }}>
                      <SearchBoxContainerSide />
                    </Paper>
                  ) : (
                    <Paper
                      style={{
                        height: '100%',
                        width: 'calc(70vw)',
                        minWidth: 584,
                      }}
                    >
                      <SearchBoxContainer />
                    </Paper>
                  )}
                </Grid>

                <Grid item id="container-search-table">
                  <Paper
                    style={{
                      height: containerHeight,
                      minHeight: 326,
                      width: 'calc(70vw)',
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
              </Grid>
            </div>
          )}
        />
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
