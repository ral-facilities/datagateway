import {
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Switch,
  Typography,
  Theme,
  withStyles,
  createStyles,
  IconButton,
  Badge,
} from '@material-ui/core';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import SearchIcon from '@material-ui/icons/Search';
import { StyleRules } from '@material-ui/core/styles';
import {
  DownloadCartItem,
  fetchDownloadCart,
  loadURLQuery,
  pushPageView,
  saveView,
  Sticky,
  QueryParams,
  SavedView,
  ViewsType,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Route } from 'react-router';
import { push } from 'connected-react-router';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../state/app.types';
import PageBreadcrumbs from './breadcrumbs.component';
import PageCard from './pageCard.component';
import PageTable from './pageTable.component';
import PageLanding from './pageLanding.component';

const gridStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default,
    },
  });

const StyledGrid = withStyles(gridStyles)(Grid);

// Define all the supported paths for data-view.
export const paths = {
  root: '/browse',
  myData: {
    root: '/my-data',
    dls: '/my-data/DLS',
    isis: '/my-data/ISIS',
  },
  landing: {
    isisInvestigationLanding:
      '/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId',
    isisDatasetLanding:
      '/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId/dataset/:datasetId',
  },
  toggle: {
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
  },
  standard: {
    datafile:
      '/browse/investigation/:investigationId/dataset/:datasetId/datafile',
    isisDatafile:
      '/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId/dataset/:datasetId/datafile',
    dlsDatafile:
      '/browse/proposal/:proposalName/investigation/:investigationId/dataset/:datasetId/datafile',
  },
};

const NavBar = (props: {
  entityCount: number;
  cartItems: DownloadCartItem[];
  navigateToSearch: () => Action;
  navigateToDownload: () => Action;
}): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <Sticky>
      <StyledGrid container>
        {/* Hold the breadcrumbs at top left of the page. */}
        <Grid
          className="tour-dataview-breadcrumbs"
          item
          xs
          aria-label="container-breadcrumbs"
        >
          {/* don't show breadcrumbs on /my-data - only on browse */}
          <Route path={paths.root} component={PageBreadcrumbs} />
        </Grid>

        {/* The table entity count takes up an xs of 2, where the breadcrumbs
      will take the remainder of the space. */}
        <Grid
          className="tour-dataview-results"
          style={{ textAlign: 'center' }}
          item
          xs={2}
          aria-label="container-table-count"
        >
          <Route
            exact
            path={Object.values(paths.myData).concat(
              Object.values(paths.toggle),
              Object.values(paths.standard)
            )}
            render={() => {
              return (
                <Paper
                  square
                  style={{
                    backgroundColor: 'inherit',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" component="h3">
                    <b>{t('app.results')}:</b> {props.entityCount}
                  </Typography>
                </Paper>
              );
            }}
          />
        </Grid>
        <Paper
          square
          style={{
            backgroundColor: 'inherit',
            display: 'flex',
            paddingLeft: 6,
            paddingRight: 6,
          }}
        >
          <IconButton
            className="tour-dataview-search-icon"
            onClick={props.navigateToSearch}
            aria-label="container-table-search"
            style={{ margin: 'auto' }}
          >
            <SearchIcon />
          </IconButton>
        </Paper>
        <Paper
          square
          style={{
            backgroundColor: 'inherit',
            display: 'flex',
            paddingLeft: 6,
            paddingRight: 6,
          }}
        >
          <IconButton
            className="tour-dataview-cart-icon"
            onClick={props.navigateToDownload}
            aria-label="container-table-cart"
            style={{ margin: 'auto' }}
          >
            <Badge
              badgeContent={
                props.cartItems.length > 0 ? props.cartItems.length : null
              }
              color="primary"
              aria-label="container-table-cart-badge"
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Paper>
      </StyledGrid>
    </Sticky>
  );
};

const CardSwitch = (props: {
  toggleCard: boolean;
  handleToggleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}): React.ReactElement => {
  const [t] = useTranslation();

  return (
    <FormControlLabel
      className="tour-dataview-toggle-card"
      value="start"
      control={
        <Switch
          checked={props.toggleCard}
          onChange={props.handleToggleChange}
          name="toggleCard"
          inputProps={{ 'aria-label': 'secondary checkbox' }}
        />
      }
      label={t('app.toggle_cards')}
      labelPlacement="start"
    />
  );
};

interface PageContainerDispatchProps {
  loadQuery: () => Promise<void>;
  pushView: (view: ViewsType, path: string) => Promise<void>;
  saveView: (view: ViewsType) => Promise<void>;
  fetchDownloadCart: () => Promise<void>;
  navigateToDownload: () => Action;
  navigateToSearch: () => Action;
}

interface PageContainerStateProps {
  entityCount: number;
  path: string;
  query: QueryParams;
  savedView: SavedView;
  loading: boolean;
  cartItems: DownloadCartItem[];
}

type PageContainerCombinedProps = PageContainerStateProps &
  PageContainerDispatchProps;

interface PageContainerState {
  paths: string[];
  toggleCard: boolean;
  isCartFetched: boolean;
}

class PageContainer extends React.Component<
  PageContainerCombinedProps,
  PageContainerState
> {
  public constructor(props: PageContainerCombinedProps) {
    super(props);

    // Load the current URL query parameters.
    this.props.loadQuery();

    // Allow for query parameter to override the
    // toggle state in the localStorage.
    this.state = {
      paths: Object.values(paths.toggle),
      toggleCard: this.getToggle(),
      isCartFetched: false,
    };
  }

  public componentDidUpdate(prevProps: PageContainerCombinedProps): void {
    // Ensure if the location changes, then we update the query parameters.
    if (prevProps.path !== this.props.path) {
      this.props.loadQuery();
    }

    // If the view query parameter was not found and the previously
    // stored view is in localstorage, update our current query with the view.
    if (this.getToggle() && !this.props.query.view)
      this.props.pushView('card', this.props.path);

    // Keep the query parameter for view and the state in sync, by getting the latest update.
    if (prevProps.query.view !== this.props.query.view) {
      this.setState({
        ...this.state,
        toggleCard: this.getToggle(),
      });
    }

    // Fetch the download cart on mount,
    // ensuring that dataview element is present.
    if (
      !this.state.isCartFetched &&
      document.getElementById('datagateway-dataview')
    ) {
      this.props.fetchDownloadCart();
      this.setState({
        ...this.state,
        isCartFetched: true,
      });
    }
  }

  public getPathMatch = (): boolean => {
    const res = Object.values(paths.toggle).some((p) => {
      // Look for the character set where the parameter for ID would be
      // replaced with the regex to catch any character between the forward slashes.
      const match = this.props.path.match(p.replace(/(:[^./]*)/g, '(.)+'));
      return match && this.props.path === match[0];
    });
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
    this.props.pushView(nextView, this.props.path);

    // Set the state with the toggled card option and the saved query.
    this.setState({
      ...this.state,
      toggleCard: event.target.checked,
    });
  };

  public render(): React.ReactElement {
    return (
      <Paper square elevation={0} style={{ backgroundColor: 'inherit' }}>
        <NavBar
          entityCount={this.props.entityCount}
          cartItems={this.props.cartItems}
          navigateToSearch={this.props.navigateToSearch}
          navigateToDownload={this.props.navigateToDownload}
        />

        <StyledGrid container>
          {/* Toggle between the table and card view */}
          <Grid item xs={12}>
            <Route
              exact
              path={this.state.paths}
              render={() => (
                <CardSwitch
                  toggleCard={this.state.toggleCard}
                  handleToggleChange={this.handleToggleChange}
                />
              )}
            />
          </Grid>

          {/* Show loading progress if data is still being loaded */}
          {this.props.loading && (
            <Grid item xs={12}>
              <LinearProgress color="secondary" />
            </Grid>
          )}

          {/* Hold the table for remainder of the page */}
          <Grid item xs={12} aria-label="container-table">
            {!this.state.toggleCard ? (
              <PageTable />
            ) : (
              <Paper square style={{ backgroundColor: 'inherit' }}>
                <PageCard />
              </Paper>
            )}
            <PageLanding />
          </Grid>
        </StyledGrid>
      </Paper>
    );
  }
}

const mapStateToProps = (state: StateType): PageContainerStateProps => ({
  entityCount: state.dgcommon.totalDataCount,
  path: state.router.location.pathname,
  query: state.dgcommon.query,
  savedView: state.dgcommon.savedView,
  loading: state.dgcommon.loading,
  cartItems: state.dgcommon.cartItems,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): PageContainerDispatchProps => ({
  loadQuery: () => dispatch(loadURLQuery()),
  pushView: (view: ViewsType, path: string) =>
    dispatch(pushPageView(view, path)),
  saveView: (view: ViewsType) => dispatch(saveView(view)),
  fetchDownloadCart: () => dispatch(fetchDownloadCart()),
  navigateToDownload: () => dispatch(push('/download')),
  navigateToSearch: () => dispatch(push('/search/data')),
});

export default connect(mapStateToProps, mapDispatchToProps)(PageContainer);
