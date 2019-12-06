import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';

import PageBreadcrumbs from './breadcrumbs.component';
import PageRoutes from './pageRoutes.component';

class PageContainer extends React.Component<{ entityCount: number }> {
  public constructor(props: { entityCount: number }) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <Grid container spacing={3}>
        {/* Hold the breadcrumbs and table count at top of the page. */}
        <Grid item xs={10} aria-label="container-breadcrumbs">
          <PageBreadcrumbs />
        </Grid>
        <Grid
          style={{ textAlign: 'right', paddingRight: '100px' }}
          item
          xs={2}
          aria-label="container-entity-count"
        >
          <b>Results:</b> {this.props.entityCount}
        </Grid>

        {/* Hold the table for remainder of the page */}
        <Grid item xs aria-label="container-table">
          <PageRoutes />
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: StateType): { entityCount: number } => ({
  entityCount: state.dgtable.totalDataCount,
});

export default connect(mapStateToProps)(PageContainer);
