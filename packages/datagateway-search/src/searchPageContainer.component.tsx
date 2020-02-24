import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import Container from '@material-ui/core/Container';

import { Grid, Typography, Paper } from '@material-ui/core';

import SearchPageTable from './pageSearchTable.component';
import SearchBoxContainer from './searchBoxContainer.component';

class SearchPageContainer extends React.Component<{ entityCount: number }> {
  public constructor(props: { entityCount: number }) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <div style={{ width: '100%' }}>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
          spacing={3}
        >
          <Grid item aria-label="container-search-filters">
            <Paper style={{ height: '100%', width: '100%' }}>
              <SearchBoxContainer />
            </Paper>
          </Grid>

          <Grid item aria-label="container-search-table">
            <Paper
              style={{
                height: 'calc(100vh)',
                width: 'calc(60vw)',
              }}
            >
              <SearchPageTable />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state: StateType): { entityCount: number } => ({
  entityCount: state.dgcommon.totalDataCount,
});

export default connect(mapStateToProps)(SearchPageContainer);
