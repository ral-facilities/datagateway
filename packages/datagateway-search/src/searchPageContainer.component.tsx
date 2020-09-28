import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router';
import { Link } from 'react-router-dom';

import { Grid, Paper } from '@material-ui/core';

import SearchPageTable from './searchPageTable';
import SearchBoxContainer from './searchBoxContainer.component';
import SearchBoxContainerSide from './searchBoxContainerSide.component';

interface SearchPageContainerProps {
  entityCount: number;
  sideLayout: boolean;
}

class SearchPageContainer extends React.Component<SearchPageContainerProps> {
  public constructor(props: SearchPageContainerProps) {
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
                <SearchPageTable />
              </Paper>
            </Grid>
          </Grid>
        </div>
      </Switch>
    );
  }
}

const mapStateToProps = (state: StateType): SearchPageContainerProps => ({
  entityCount: state.dgcommon.totalDataCount,
  sideLayout: state.dgsearch.sideLayout,
});

export default connect(mapStateToProps)(SearchPageContainer);
