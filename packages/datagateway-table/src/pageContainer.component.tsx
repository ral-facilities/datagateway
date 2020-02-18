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
            <Typography variant="h6" component="h3">
              <b>Results:</b> {this.props.entityCount}
            </Typography>
          </Paper>
        </Grid>

        {/* Hold the table for remainder of the page */}
        <Grid
          item
          xs={12}
          aria-label="container-table"
          style={{ height: 'calc(100vh - 96px)' }}
        >
          {/* adjust for the height of the AppBar (64px) on parent application and the breadcrumbs component (32px). */}
          <PageTable />
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: StateType): { entityCount: number } => ({
  entityCount: state.dgcommon.totalDataCount,
});

export default connect(mapStateToProps)(PageContainer);
