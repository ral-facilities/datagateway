import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';

import { Grid, Typography, Paper } from '@material-ui/core';
import PageBreadcrumbs from './breadcrumbs.component';
import PageTable from './pageTable.component';

class PageContainer extends React.Component<{ entityCount: number }> {
  public constructor(props: { entityCount: number }) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <Grid container>
        {/* Hold the breadcrumbs at top left of the page. */}
        <Grid item xs aria-label="container-breadcrumbs">
          <PageBreadcrumbs />
        </Grid>

        {/* The table entity count takes up an xs of 2, where the breadcrumbs 
           will take the remainder of the space. */}
        <Grid
          style={{ textAlign: 'center' }}
          item
          xs={2}
          aria-label="container-table-count"
        >
          <Paper>
            <Typography variant="h5" component="h3">
              <b>Results:</b> {this.props.entityCount}
            </Typography>
          </Paper>
        </Grid>

        {/* Hold the table for remainder of the page */}
        <Grid item xs={12} aria-label="container-table">
          {/* // TODO: Rather than specifying the height exactly, it would be best
              for it to automatically adjust depending on the parent height, possibly using Box/Paper? */}

          {/* Place table in Paper component which adjusts for the height
             of the AppBar (64px) on parent application and the breadcrumbs component (31px). */}
          <Paper style={{ height: 'calc(100vh - 95px)', width: '100%' }}>
            <PageTable />
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: StateType): { entityCount: number } => ({
  entityCount: state.dgtable.totalDataCount,
});

export default connect(mapStateToProps)(PageContainer);
