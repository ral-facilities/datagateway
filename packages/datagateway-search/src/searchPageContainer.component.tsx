import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router';
import { Link } from 'react-router-dom';

import { Grid, Paper } from '@material-ui/core';

import SearchPageTable from './searchPageTable';
import SearchBoxContainer from './searchBoxContainer.component';

class SearchPageContainer extends React.Component<{ entityCount: number }> {
  public constructor(props: { entityCount: number }) {
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
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            spacing={2}
          >
            <Grid item aria-label="container-search-filters">
              <Paper style={{ height: '100%', width: '100%' }}>
                <SearchBoxContainer />
              </Paper>
            </Grid>

            <Grid item aria-label="container-search-table">
              <Paper
                style={{
                  height: 'calc(90vh)',
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

const mapStateToProps = (state: StateType): { entityCount: number } => ({
  entityCount: state.dgcommon.totalDataCount,
});

export default connect(mapStateToProps)(SearchPageContainer);
