import React from 'react';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';

import { Grid, Typography, Paper, Switch } from '@material-ui/core';
import PageBreadcrumbs from './breadcrumbs.component';
import PageTable from './pageTable.component';
import { Route } from 'react-router';
import CardView from '../card/cardView.component';

interface PageContainerProps {
  entityCount: number;
  search: string;
}

interface PageContainerState {
  toggleCard: boolean;
  params: {
    view: string | null;
    page: number | null;
  };
}

class PageContainer extends React.Component<
  PageContainerProps,
  PageContainerState
> {
  public constructor(props: PageContainerProps) {
    super(props);
    const queryParams = new URLSearchParams(props.search);

    this.state = {
      toggleCard: true,

      // Add in query parameters we look out for.
      params: {
        view: queryParams.get('view'),
        page: Number(queryParams.get('page')),
      },
    };

    console.log('Container state: ', this.state);
  }

  public handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ ...this.state, [event.target.name]: event.target.checked });
  };

  public render(): React.ReactElement {
    return (
      <Grid container>
        {/* Hold the breadcrumbs at top left of the page. */}
        <Grid item xs aria-label="container-breadcrumbs">
          {/* don't show breadcrumbs on /my-data - only on browse */}
          <Route path="/browse" component={PageBreadcrumbs} />
        </Grid>

        {/* The table entity count takes up an xs of 2, where the breadcrumbs 
           will take the remainder of the space. */}
        <Grid
          style={{ textAlign: 'center' }}
          item
          xs={2}
          aria-label="container-table-count"
        >
          <Paper square>
            <Typography variant="h6" component="h3">
              <b>Results:</b> {this.props.entityCount}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Switch
            checked={this.state.toggleCard}
            onChange={this.handleToggleChange}
            name="toggleCard"
            inputProps={{ 'aria-label': 'secondary checkbox' }}
          />
        </Grid>

        {/* Hold the table for remainder of the page */}

        <Grid item xs={12} aria-label="container-table">
          {this.state.toggleCard ? (
            // Place table in Paper component which adjusts for the height
            // of the AppBar (64px) on parent application and the breadcrumbs component (31px).
            <Paper square>
              <CardView />
            </Paper>
          ) : (
            <Paper
              square
              style={{ height: 'calc(100vh - 95px)', width: '100%' }}
            >
              <PageTable />
            </Paper>
          )}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: StateType): PageContainerProps => ({
  entityCount: state.dgcommon.totalDataCount,

  // TODO: Pass in relevant query parameters required.
  search: state.router.location.search,
});

export default connect(mapStateToProps)(PageContainer);
