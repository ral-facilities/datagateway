import React from 'react';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';

class PageHead extends React.Component<{ entityCount: number }> {
  public constructor(props: { entityCount: number }) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <Grid container spacing={3}>
        <Grid
          style={{ paddingLeft: '35px' }}
          item
          xs={10}
          aria-label="head-breadcrumbs"
        >
          {/* TODO: Place PageBreadcrumbs component when it has been added. */}
        </Grid>
        <Grid
          style={{ textAlign: 'right', paddingRight: '100px' }}
          item
          xs={2}
          aria-label="head-entity-count"
        >
          <b>Results: {this.props.entityCount}</b>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: StateType): { entityCount: number } => ({
  entityCount: state.dgtable.totalDataCount,
});

export default connect(mapStateToProps)(PageHead);
