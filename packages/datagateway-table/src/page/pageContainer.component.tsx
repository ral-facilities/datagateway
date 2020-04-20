import React from 'react';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';

import { Grid, Typography, Paper, Switch } from '@material-ui/core';
import PageBreadcrumbs from './breadcrumbs.component';
import PageTable from './pageTable.component';
import { Route, RouteComponentProps } from 'react-router';
import InvestigationCardView from '../card/investigationCardView.component';

import { Switch as RouteSwitch } from 'react-router';

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

    // Get all the query parameters.
    const queryParams = new URLSearchParams(props.search);

    // Allow for query parameter to override the
    // toggle state in the localStorage.
    const viewParam = queryParams.get('view');
    const toggleCard = viewParam
      ? viewParam === 'card'
        ? true
        : false
      : this.getView() === 'card'
      ? true
      : false;

    this.state = {
      toggleCard,

      // Add in query parameters we are looking
      // for in the URL.
      params: {
        view: viewParam,
        page: Number(queryParams.get('page')),
      },
    };

    console.log('Container state: ', this.state);
  }

  public setDataView = (view: 'table' | 'card'): void =>
    localStorage.setItem('dataView', view);

  public getView = (): string => {
    // We store the view into localStorage so the user can
    // return to the view they were on the next time they open the page.
    let savedView = localStorage.getItem('dataView');

    // We set to 'table' initially if there is none present.
    if (!savedView) this.setDataView('table');
    else return savedView;

    return 'table';
  };

  public handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Set the view in local storage.
    this.setDataView(event.target.checked ? 'card' : 'table');
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
            // TODO: Route switching needs to be moved to separate component
            <RouteSwitch>
              <Route
                exact
                path="/browse/investigation/"
                render={() => (
                  <InvestigationCardView pageNum={this.state.params.page} />
                )}
              />

              {/* TODO: Create Dataset Card View route */}
              <Route
                exact
                path="/browse/investigation/:investigationId/dataset"
                render={({
                  match,
                }: RouteComponentProps<{ investigationId: string }>) => (
                  <div>Investigation ID: {match.params.investigationId}</div>
                )}
              />
            </RouteSwitch>
          ) : (
            // <InvestigationCardView pageNum={this.state.params.page} />
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
