import React from 'react';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';

import {
  Grid,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import PageBreadcrumbs from './breadcrumbs.component';
import PageTable from './pageTable.component';
import { Route, RouteComponentProps } from 'react-router';

import { Switch as RouteSwitch } from 'react-router';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { pushPageView } from 'datagateway-common';

import InvestigationCardView from '../card/investigationCardView.component';
import DatasetCardView from '../card/datasetCardView.component';
import { QueryParams, ViewsType } from 'datagateway-common/lib/state/app.types';

interface PageContainerDispatchProps {
  pushView: (view: ViewsType) => Promise<void>;
  // saveQuery: (queries: URLSearchParams | null) => void;
}

interface PageContainerProps {
  entityCount: number;
  query: QueryParams;
  // savedQueries: URLSearchParams | null;
}

type PageContainerCombinedProps = PageContainerProps &
  PageContainerDispatchProps;

interface PageContainerState {
  toggleCard: boolean;
  // page: number | null;
  // savedQueries: URLSearchParams | null;
}

class PageContainer extends React.Component<
  PageContainerCombinedProps,
  PageContainerState
> {
  public constructor(props: PageContainerCombinedProps) {
    super(props);

    // Allow for query parameter to override the
    // toggle state in the localStorage.
    const viewParam = this.props.query.view;
    const toggleCard = viewParam
      ? viewParam === 'card'
        ? true
        : false
      : this.getView() === 'card'
      ? true
      : false;

    // If the view query parameter was not found and the previously
    // stored view is in localstorage, update our current query with the view.
    if (toggleCard && !viewParam) this.props.pushView('card');

    this.state = {
      toggleCard,
      // page: Number(this.props.query.get('page')),
    };
  }

  public componentDidUpdate(prevProps: PageContainerCombinedProps): void {
    console.log('Previous page: ', prevProps.query.toString());
    console.log('Current page: ', this.props.query.toString());
  }

  // public loadURLQueryParams = (): void => {
  //   // Get all the query parameters.
  //   const queryParams = this.getURLQueryParams();

  //   // Allow for query parameter to override the
  //   // toggle state in the localStorage.
  //   const viewParam = queryParams.get('view');
  //   const toggleCard = viewParam
  //     ? viewParam === 'card'
  //       ? true
  //       : false
  //     : this.getView() === 'card'
  //     ? true
  //     : false;

  //   console.log('New page number: ', queryParams.get('page'));
  //   this.setState({
  //     ...this.state,
  //     toggleCard,
  //     // savedQueries: null,

  //     // Add in query parameters we are looking
  //     // for in the URL.
  //     params: {
  //       view: viewParam,
  //       page: Number(queryParams.get('page')),
  //       // results: Number(queryParams.get('results')),
  //     },
  //   });

  //   console.log('New state: ', this.state);
  // };

  // public getURLQueryParams = (): URLSearchParams => {
  //   console.log('query: ' + new URLSearchParams(this.props.search).toString());
  //   return new URLSearchParams(this.props.search);
  // };

  // TODO: This should be revised to work using the redux state instead.
  // public setPageQuery = (key: string, value: string): void => {
  //   const currentParams = this.getURLQueryParams();
  //   if (currentParams.get(key)) {
  //     currentParams.set(key, value);
  //   } else {
  //     currentParams.append(key, value);
  //   }
  //   console.log('Final query: ', currentParams.toString());

  //   this.props.pushQuery(`?${currentParams.toString()}`);
  //   this.loadURLQueryParams();
  // };

  // public componentDidUpdate(prevProps: PageContainerProps): void {
  //   console.log('Previous props: ', prevProps.search);
  // }

  public storeDataView = (view: 'table' | 'card'): void =>
    localStorage.setItem('dataView', view);

  public getView = (): string => {
    // We store the view into localStorage so the user can
    // return to the view they were on the next time they open the page.
    let savedView = localStorage.getItem('dataView');

    // We set to 'table' initially if there is none present.
    if (!savedView) this.storeDataView('table');
    else return savedView;
    return 'table';
  };

  public handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const viewName = event.target.checked ? 'card' : 'table';

    // Set the view in local storage.
    this.storeDataView(viewName);

    // // Handle logic for handling queries when changing between views.
    // let newQueryParams = new URLSearchParams('view');
    // console.log(
    //   'Current savedQueries: ',
    //   this.props.savedQueries ? this.props.savedQueries.toString() : null
    // );

    // if (!event.target.checked) {
    //   console.log('Saved queries: ' + this.getURLQueryParams().toString());
    //   this.props.saveQuery(this.getURLQueryParams());
    // } else if (event.target.checked && this.props.savedQueries !== null) {
    //   newQueryParams = this.props.savedQueries;
    // }

    // // Add the view and push the final query parameters.
    // newQueryParams.set('view', viewName);
    // console.log('Final query: ' + newQueryParams.toString());
    // this.props.pushQuery(`?${newQueryParams.toString()}`);
    this.props.pushView(viewName);

    // Set the state with the toggled card option and the saved queries.
    this.setState({
      ...this.state,
      [event.target.name]: event.target.checked,
      // savedQueries,
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
          <Paper square>
            <Typography variant="h6" component="h3">
              <b>Results:</b> {this.props.entityCount}
            </Typography>
          </Paper>
        </Grid>

        {/* Toggle between the table and card view */}
        {/* TODO: Prevent toggle on routes which are not investigation/dataset. */}
        <Grid item xs={12}>
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
                  <InvestigationCardView
                    pageNum={Number(this.props.query.page)}
                    // setPageQuery={this.setPageQuery}
                  />
                )}
              />

              {/* TODO: Create Dataset Card View route */}
              <Route
                exact
                path="/browse/investigation/:investigationId/dataset"
                render={({
                  match,
                }: RouteComponentProps<{ investigationId: string }>) => (
                  <DatasetCardView
                    investigationId={match.params.investigationId}
                    pageNum={Number(this.props.query.page)}
                    // setPageQuery={this.setPageQuery}
                  />
                )}
              />
            </RouteSwitch>
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
  query: state.dgcommon.query,
  // savedQueries: state.dgcommon.savedQueries,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): PageContainerDispatchProps => ({
  pushView: (view: ViewsType) => dispatch(pushPageView(view)),
  // saveQuery: (queries: URLSearchParams | null) =>
  //   dispatch(saveQueries(queries)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PageContainer);
