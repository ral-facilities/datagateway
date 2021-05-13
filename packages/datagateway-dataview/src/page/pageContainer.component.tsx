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
  makeStyles,
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
  ViewsType,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Switch as SwitchRouting, Route } from 'react-router';
import { push } from 'connected-react-router';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../state/app.types';
import PageBreadcrumbs from './breadcrumbs.component';
import PageRouting from './pageRouting.component';
import { Location as LocationType } from 'history';

const usePaperStyles = makeStyles(
  (theme: Theme): StyleRules =>
    createStyles({
      cardPaper: { backgroundColor: 'inhereit' },
      tablePaper: {
        height: 'calc(100vh - 180px)',
        width: '100%',
        backgroundColor: 'inherit',
        overflowX: 'auto',
      },
      tablePaperMessage: {
        height: 'calc(100vh - 244px - 4rem)',
        width: '100%',
        backgroundColor: 'inherit',
        overflowX: 'auto',
      },
      noResultsPaper: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '960px',
      },
    })
);

const gridStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.default,
    },
  });

const StyledGrid = withStyles(gridStyles)(Grid);

// Define all the supported paths for data-view.
export const paths = {
  homepage: '/datagateway',
  root: '/browse',
  myData: {
    root: '/my-data',
    dls: '/my-data/DLS',
    isis: '/my-data/ISIS',
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
  studyHierarchy: {
    root: '/browseStudyHierarchy',
    toggle: {
      isisInstrument: '/browseStudyHierarchy/instrument',
      isisStudy: '/browseStudyHierarchy/instrument/:instrumentId/study',
      isisInvestigation:
        '/browseStudyHierarchy/instrument/:instrumentId/study/:studyId/investigation',
      isisDataset:
        '/browseStudyHierarchy/instrument/:instrumentId/study/:studyId/investigation/:investigationId/dataset',
    },
    standard: {
      isisDatafile:
        '/browseStudyHierarchy/instrument/:instrumentId/study/:studyId/investigation/:investigationId/dataset/:datasetId/datafile',
    },
  },
};

export const NavBar = (props: {
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
          <Route
            path={[paths.root, paths.studyHierarchy.root]}
            component={PageBreadcrumbs}
          />
        </Grid>

        {/* The table entity count has a size of 2 (or 3 for xs screens); the
            breadcrumbs will take the remainder of the space. */}
        <Grid
          className="tour-dataview-results"
          style={{ textAlign: 'center' }}
          item
          sm={2}
          xs={3}
          aria-label="container-table-count"
        >
          <Route
            path={[paths.root, paths.studyHierarchy.root, paths.myData.root]}
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

const ViewRouting = (props: {
  view: ViewsType;
  loadedCount: boolean;
  totalDataCount: number;
  location: LocationType;
}): React.ReactElement => {
  const { view, loadedCount, totalDataCount, location } = props;
  const paperClasses = usePaperStyles();
  const [t] = useTranslation();
  const displayFilterMessage = loadedCount && totalDataCount === 0;
  const tableClassName = displayFilterMessage
    ? paperClasses.tablePaperMessage
    : paperClasses.tablePaper;

  return (
    <SwitchRouting>
      {/* For "toggle" paths, check state for the current view */}
      <Route
        exact
        path={Object.values(paths.toggle).concat(
          Object.values(paths.studyHierarchy.toggle)
        )}
        render={() => (
          <div>
            {view !== 'card' && displayFilterMessage && (
              <Paper className={paperClasses.noResultsPaper}>
                <Typography
                  align="center"
                  variant="h6"
                  component="h6"
                  aria-label="filter-message"
                >
                  {t('loading.filter_message')}
                </Typography>
              </Paper>
            )}
            <Paper
              square
              className={
                view === 'card' ? paperClasses.cardPaper : tableClassName
              }
            >
              <PageRouting view={view} location={location} />
            </Paper>
          </div>
        )}
      />
      {/* Otherwise, use the paper styling for tables*/}
      <Route
        render={() => (
          <div>
            {displayFilterMessage && (
              <Paper className={paperClasses.noResultsPaper}>
                <Typography
                  align="center"
                  variant="h6"
                  component="h6"
                  aria-label="filter-message"
                >
                  {t('loading.filter_message')}
                </Typography>
              </Paper>
            )}
            <Paper square className={tableClassName}>
              <PageRouting view={view} location={location} />
            </Paper>
          </div>
        )}
      />
    </SwitchRouting>
  );
};

interface PageContainerDispatchProps {
  loadQuery: (pathChanged: boolean) => Promise<void>;
  pushView: (view: ViewsType, path: string) => Promise<void>;
  saveView: (view: ViewsType) => Promise<void>;
  fetchDownloadCart: () => Promise<void>;
  navigateToDownload: () => Action;
  navigateToSearch: () => Action;
}

interface PageContainerStateProps {
  entityCount: number;
  location: LocationType;
  query: QueryParams;
  savedView: ViewsType;
  loading: boolean;
  loadedCount: boolean;
  totalDataCount: number;
  cartItems: DownloadCartItem[];
}

type PageContainerCombinedProps = PageContainerStateProps &
  PageContainerDispatchProps;

interface PageContainerState {
  paths: string[];
  toggleCard: boolean;
  modifiedLocation: LocationType;
}

class PageContainer extends React.Component<
  PageContainerCombinedProps,
  PageContainerState
> {
  public constructor(props: PageContainerCombinedProps) {
    super(props);

    // Load the current URL query parameters.
    this.props.loadQuery(true);

    // Allow for query parameter to override the
    // toggle state in the localStorage.
    this.state = {
      paths: Object.values(paths.toggle).concat(
        Object.values(paths.studyHierarchy.toggle)
      ),
      toggleCard: this.getToggle(),
      modifiedLocation: props.location,
    };
  }

  public componentDidMount(): void {
    // Fetch the download cart on mount, ensuring dataview element is present.
    if (document.getElementById('datagateway-dataview')) {
      this.props.fetchDownloadCart();
    }
  }

  public componentDidUpdate(prevProps: PageContainerCombinedProps): void {
    // Ensure if the location changes, then we update the query parameters.
    // Use a dummy URL for the routing until we've updated the query to prevent
    // sending requests for the old query on the new entity or vice versa.
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        ...this.state,
        modifiedLocation: { ...this.props.location, pathname: '/' },
      });
      this.props.loadQuery(true);
    } else if (prevProps.location.search !== this.props.location.search) {
      this.props.loadQuery(false);
    }

    if (prevProps.query !== this.props.query) {
      this.setState({ ...this.state, modifiedLocation: this.props.location });
    }

    // If the view query parameter was not found and the previously
    // stored view is in localstorage, update our current query with the view.
    if (this.getToggle() && !this.props.query.view)
      this.props.pushView('card', this.props.location.pathname);

    // Keep the query parameter for view and the state in sync, by getting the latest update.
    if (prevProps.query.view !== this.props.query.view) {
      this.setState({
        ...this.state,
        toggleCard: this.getToggle(),
      });
    }
  }

  public getPathMatch = (): boolean => {
    const res = Object.values(paths.toggle)
      .concat(Object.values(paths.studyHierarchy.toggle))
      .some((p) => {
        // Look for the character set where the parameter for ID would be
        // replaced with the regex to catch any character between the forward slashes.
        const match = this.props.location.pathname.match(
          p.replace(/(:[^./]*)/g, '(.)+')
        );
        return match && this.props.location.pathname === match[0];
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
    this.props.pushView(nextView, this.props.location.pathname);

    // Set the state with the toggled card option and the saved query.
    this.setState({
      ...this.state,
      toggleCard: event.target.checked,
    });
  };

  public render(): React.ReactElement {
    return (
      <Paper square elevation={0} style={{ backgroundColor: 'inherit' }}>
        {this.props.location.pathname === paths.homepage ? (
          <PageRouting
            view={this.props.savedView}
            location={this.props.location}
          />
        ) : (
          <>
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
                {document.getElementById('datagateway-dataview') && (
                  <ViewRouting
                    view={this.props.query.view}
                    loadedCount={this.props.loadedCount}
                    totalDataCount={this.props.totalDataCount}
                    location={this.state.modifiedLocation}
                  />
                )}
              </Grid>
            </StyledGrid>
          </>
        )}
      </Paper>
    );
  }
}

const mapStateToProps = (state: StateType): PageContainerStateProps => ({
  entityCount: state.dgcommon.totalDataCount,
  location: state.router.location,
  query: state.dgcommon.query,
  savedView: state.dgcommon.savedQuery.view,
  loading: state.dgcommon.loading,
  loadedCount: state.dgcommon.loadedCount,
  totalDataCount: state.dgcommon.totalDataCount,
  cartItems: state.dgcommon.cartItems,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): PageContainerDispatchProps => ({
  loadQuery: (pathChanged: boolean) => dispatch(loadURLQuery(pathChanged)),
  pushView: (view: ViewsType, path: string) =>
    dispatch(pushPageView(view, path)),
  saveView: (view: ViewsType) => dispatch(saveView(view)),
  fetchDownloadCart: () => dispatch(fetchDownloadCart()),
  navigateToDownload: () => dispatch(push('/download')),
  navigateToSearch: () => dispatch(push('/search/data')),
});

export default connect(mapStateToProps, mapDispatchToProps)(PageContainer);
