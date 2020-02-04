import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import PageBreadcrumbs from './breadcrumbs.component';

class PageHead extends React.Component<{ entityCount: number }> {
  public constructor(props: { entityCount: number }) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <Grid container spacing={3}>
        <Grid item xs={10} aria-label="head-breadcrumbs">
          <PageBreadcrumbs />
        </Grid>
        <Grid
          style={{ textAlign: 'right', paddingRight: '140px' }}
          item
          xs={2}
          aria-label="head-entity-count"
        >
          <b>Results:</b> {this.props.entityCount}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: StateType): { entityCount: number } => ({
  entityCount: state.dgcommon.totalDataCount,
});

export default connect(mapStateToProps)(PageHead);
