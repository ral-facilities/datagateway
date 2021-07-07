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
  pushPageView,
  saveView,
  Sticky,
  ViewsType,
  readURLQuery,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import {
  Switch as SwitchRouting,
  Route,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
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
    landing: {
      isisStudyLanding:
        '/browseStudyHierarchy/instrument/:instrumentId/study/:studyId',
      isisInvestigationLanding:
        '/browseStudyHierarchy/instrument/:instrumentId/study/:studyId/investigation/:investigationId',
      isisDatasetLanding:
        '/browseStudyHierarchy/instrument/:instrumentId/study/:studyId/investigation/:investigationId/dataset/:datasetId',
    },
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
            exact
            path={Object.values(paths.myData).concat(
              Object.values(paths.toggle),
              Object.values(paths.standard),
              Object.values(paths.studyHierarchy.toggle),
              Object.values(paths.studyHierarchy.standard)
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

const StyledRouting = (props: {
  viewStyle: ViewsType;
  view: ViewsType;
  location: LocationType;
  displayFilterMessage: boolean;
}): React.ReactElement => {
  const { view, location, viewStyle, displayFilterMessage } = props;
  const [t] = useTranslation();
  const paperClasses = usePaperStyles();
  const tableClassName = displayFilterMessage
    ? paperClasses.tablePaperMessage
    : paperClasses.tablePaper;
  return (
    <div>
      {viewStyle === 'table' && displayFilterMessage && (
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
          viewStyle === 'card' ? paperClasses.cardPaper : tableClassName
        }
      >
        <PageRouting view={view} location={location} />
      </Paper>
    </div>
  );
};

const ViewRouting = React.memo(
  (props: {
    view: ViewsType;
    loadedCount: boolean;
    totalDataCount: number;
    location: LocationType;
  }): React.ReactElement => {
    const { view, loadedCount, totalDataCount, location } = props;
    const displayFilterMessage = loadedCount && totalDataCount === 0;

    return (
      <SwitchRouting>
        {/* For "landing" paths, don't use a containing Paper */}
        <Route
          exact
          path={Object.values(paths.landing).concat(
            Object.values(paths.studyHierarchy.landing)
          )}
          render={() => <PageRouting view={view} location={location} />}
        />
        {/* For "toggle" paths, check state for the current view to determine styling */}
        <Route
          exact
          path={Object.values(paths.toggle).concat(
            Object.values(paths.studyHierarchy.toggle)
          )}
        >
          <StyledRouting
            viewStyle={view}
            view={view}
            location={location}
            displayFilterMessage={displayFilterMessage}
          />
        </Route>

        {/* Otherwise, use the paper styling for tables*/}
        <Route>
          <StyledRouting
            viewStyle={'table'}
            view={view}
            location={location}
            displayFilterMessage={displayFilterMessage}
          />
        </Route>
      </SwitchRouting>
    );
  }
);
ViewRouting.displayName = 'ViewRouting';

interface PageContainerDispatchProps {
  pushView: (view: ViewsType, path: string) => Promise<void>;
  saveView: (view: ViewsType) => Promise<void>;
  fetchDownloadCart: () => Promise<void>;
  navigateToDownload: () => Action;
  navigateToSearch: () => Action;
}

interface PageContainerStateProps {
  savedView: ViewsType;
  loading: boolean;
  loadedCount: boolean;
  totalDataCount: number;
  cartItems: DownloadCartItem[];
}

type PageContainerCombinedProps = PageContainerStateProps &
  PageContainerDispatchProps &
  RouteComponentProps<never>;

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

    // Allow for query parameter to override the
    // toggle state in the localStorage.
    this.state = {
      paths: Object.values(paths.toggle).concat(
        Object.values(paths.studyHierarchy.toggle)
      ),
      toggleCard: this.getToggle(),
    };
  }

  public componentDidMount(): void {
    // Fetch the download cart on mount, ensuring dataview element is present.
    if (document.getElementById('datagateway-dataview')) {
      this.props.fetchDownloadCart();
    }
  }

  public componentDidUpdate(prevProps: PageContainerCombinedProps): void {
    // If the view query parameter was not found and the previously
    // stored view is in localstorage, update our current query with the view.
    const view = readURLQuery(this.props.location).view;
    if (this.getToggle() && !view) {
      this.props.pushView('card', this.props.location.pathname);
    }

    // Keep the query parameter for view and the state in sync, by getting the latest update.
    if (readURLQuery(prevProps.location).view !== view) {
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
    const view = readURLQuery(this.props.location).view;
    return this.getPathMatch()
      ? view
        ? view === 'card'
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
        <NavBar
          entityCount={this.props.totalDataCount}
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
                view={readURLQuery(this.props.location).view}
                loadedCount={this.props.loadedCount}
                totalDataCount={this.props.totalDataCount}
                location={this.props.location}
              />
            )}
          </Grid>
        </StyledGrid>
      </Paper>
    );
  }
}

const mapStateToProps = (state: StateType): PageContainerStateProps => ({
  savedView: state.dgcommon.savedQuery.view,
  loading: state.dgcommon.loading,
  loadedCount: state.dgcommon.loadedCount,
  totalDataCount: state.dgcommon.totalDataCount,
  cartItems: state.dgcommon.cartItems,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): PageContainerDispatchProps => ({
  pushView: (view: ViewsType, path: string) =>
    dispatch(pushPageView(view, path)),
  saveView: (view: ViewsType) => dispatch(saveView(view)),
  fetchDownloadCart: () => dispatch(fetchDownloadCart()),
  navigateToDownload: () => dispatch(push('/download')),
  navigateToSearch: () => dispatch(push('/search/data')),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PageContainer)
);
