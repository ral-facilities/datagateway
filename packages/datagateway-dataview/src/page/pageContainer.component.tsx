import React from 'react';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';

import {
  Grid,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  LinearProgress,
} from '@material-ui/core';
import PageBreadcrumbs from './breadcrumbs.component';
import PageTable from './pageTable.component';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { loadURLQuery, pushPageView, saveView } from 'datagateway-common';

import {
  QueryParams,
  ViewsType,
  SavedView,
} from 'datagateway-common/lib/state/app.types';
import { Route } from 'react-router';

import PageCard from './pageCard.component';
import PageSearch from './pageSearch.component';

// TODO: Define an object of all the relevant paths for views.
export const supportedPaths = {
  investigation: '/browse/investigation',
  dataset: '/browse/investigation/:investigationId/dataset',
  isisInstrument: '/browse/instrument',
  isisFacilityCycle: '/browse/instrument/:instrumentId/facilityCycle',
  isisInvestigation:
    '/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation',
  isisDataset:
    '/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId/dataset',
  dlsProposal: '/browse/proposal',
  dlsVisit: '/browse/proposal/:proposalName/investigation',
  dlsDataset:
    '/browse/proposal/:proposalName/investigation/:investigationId/dataset',
};

interface PageContainerDispatchProps {
  loadQuery: () => Promise<void>;
  pushView: (view: ViewsType) => Promise<void>;
  saveView: (view: ViewsType) => Promise<void>;
}

interface PageContainerProps {
  entityCount: number;
  path: string;
  query: QueryParams;
  savedView: SavedView;
  loading: boolean;
}

type PageContainerCombinedProps = PageContainerProps &
  PageContainerDispatchProps;

interface PageContainerState {
  paths: string[];
  toggleCard: boolean;
}

class PageContainer extends React.Component<
  PageContainerCombinedProps,
  PageContainerState
> {
  public constructor(props: PageContainerCombinedProps) {
    super(props);
    // console.log('Support paths: ', Object.values(supportedPaths));

    // Load the current URL query parameters.
    this.props.loadQuery();

    // Allow for query parameter to override the
    // toggle state in the localStorage.
    this.state = {
      paths: Object.values(supportedPaths),
      toggleCard: this.getToggle(),
    };
  }

  public componentDidUpdate(prevProps: PageContainerCombinedProps): void {
    // Ensure if the location changes, then we update the query parameters.
    if (prevProps.path !== this.props.path) {
      // console.log('Path changed: ', this.props.path);
      this.props.loadQuery();
    }

    // If the view query parameter was not found and the previously
    // stored view is in localstorage, update our current query with the view.
    if (this.getToggle() && !this.props.query.view) this.props.pushView('card');

    // Keep the query parameter for view and the state in sync, by getting the latest update.
    if (prevProps.query.view !== this.props.query.view) {
      this.setState({
        ...this.state,
        toggleCard: this.getToggle(),
      });
    }
  }

  public getPathMatch = (): boolean => {
    // console.log(
    //   'supported path: ',
    //   Object.values(supportedPaths).some(p => this.props.path.match(p))
    // );
    // console.log('supported: ', this.props.path.match('/browse/investigation'));

    // console.log('match supported: ', Object.values(supportedPaths));
    const res = Object.values(supportedPaths).some((p) => {
      // console.log('match input: ', p.replace(/(:[^./]*)/g, '(.)+'));
      // Look for the character set where the parameter for ID would be
      // replaced with the regex to catch any character between the forward slashes.
      const match = this.props.path.match(p.replace(/(:[^./]*)/g, '(.)+'));
      // console.log('match: ', match);
      // console.log('match string: ', match && this.props.path === match[0]);
      return match && this.props.path === match[0];
    });
    // console.log('supported: ', res);
    return res;
  };

  public getToggle = (): boolean => {
    return this.getPathMatch()
      ? this.props.query.view
        ? this.props.query.view === 'card'
          ? true
          : false
        : this.getView() === 'card'
        ? true
        : false
      : false;
  };

  public storeDataView = (view: ViewsType): void => {
    if (view) localStorage.setItem('dataView', view);
  };

  public getView = (): string => {
    // We store the view into localStorage so the user can
    // return to the view they were on the next time they open the page.
    const savedView = localStorage.getItem('dataView');

    // We set to 'table' initially if there is none present.
    if (!savedView) this.storeDataView('table');
    else return savedView;
    return 'table';
  };

  public handleToggleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const nextView = event.target.checked ? 'card' : 'table';

    // Save the current view information to state and restore the previous view information.
    this.props.saveView(this.state.toggleCard ? 'card' : 'table');

    // Set the view in local storage.
    this.storeDataView(nextView);

    // Add the view and push the final query parameters.
    this.props.pushView(nextView);

    // Set the state with the toggled card option and the saved queries.
    this.setState({
      ...this.state,
      toggleCard: event.target.checked,
    });
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
          <Route
            path={['/browse', '/my-data']}
            render={() => {
              return (
                <Paper square>
                  <Typography variant="h6" component="h3">
                    <b>Results:</b> {this.props.entityCount}
                  </Typography>
                </Paper>
              );
            }}
          />
        </Grid>

        {/* Toggle between the table and card view */}
        <Grid item xs={12}>
          <Route
            exact
            path={this.state.paths}
            render={() => (
              <FormControlLabel
                value="start"
                control={
                  <Switch
                    checked={this.state.toggleCard}
                    onChange={this.handleToggleChange}
                    name="toggleCard"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                  />
                }
                label="Toggle Cards"
                labelPlacement="start"
              />
            )}
          />
        </Grid>

        {/* Show loading progress if data is still being loaded */}
        {this.state.toggleCard && this.props.loading && (
          <Route
            path={['/browse', '/my-data']}
            render={() => {
              return (
                <Grid item xs={12}>
                  <LinearProgress color="secondary" />
                </Grid>
              );
            }}
          />
        )}

        {/* TODO: Show the page search component on all views */}
        <Route
          path={['/browse', '/my-data']}
          render={() => {
            return (
              <Grid
                item
                style={{
                  textAlign: 'center',
                }}
                xs={12}
              >
                <PageSearch />
              </Grid>
            );
          }}
        />

        {/* Hold the table for remainder of the page */}
        <Grid item xs={12} aria-label="container-table">
          {!this.state.toggleCard ? (
            // Place table in Paper component which adjusts for the height
            // of the AppBar (64px) on parent application and the breadcrumbs component (31px).
            <Paper
              square
              style={{ height: 'calc(100vh - 95px)', width: '100%' }}
            >
              <PageTable />
            </Paper>
          ) : (
            <Paper square>
              <PageCard />
            </Paper>
          )}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: StateType): PageContainerProps => ({
  entityCount: state.dgcommon.totalDataCount,
  path: state.router.location.pathname,
  query: state.dgcommon.query,
  savedView: state.dgcommon.savedView,
  loading: state.dgcommon.loading,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): PageContainerDispatchProps => ({
  loadQuery: () => dispatch(loadURLQuery()),
  pushView: (view: ViewsType) => dispatch(pushPageView(view)),
  saveView: (view: ViewsType) => dispatch(saveView(view)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PageContainer);
