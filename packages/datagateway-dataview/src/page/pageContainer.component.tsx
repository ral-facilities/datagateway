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
  pushPageView,
  saveView,
  Sticky,
  ViewsType,
  clearTable,
  useCart,
  parseSearchToQuery,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Switch as SwitchRouting, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Action } from 'redux';
import PageBreadcrumbs from './breadcrumbs.component';
import PageRouting from './pageRouting.component';
import { Location as LocationType } from 'history';
import { useIsFetching, useQueryClient } from 'react-query';

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

const togglePaths = Object.values(paths.toggle).concat(
  Object.values(paths.studyHierarchy.toggle)
);

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
      {viewStyle !== 'card' && displayFilterMessage && (
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
        <Route exact path={togglePaths}>
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

const storeDataView = (view: ViewsType): void => {
  if (view) localStorage.setItem('dataView', view);
};

const getView = (): string => {
  // We store the view into localStorage so the user can
  // return to the view they were on the next time they open the page.
  const savedView = localStorage.getItem('dataView');

  // We set to 'table' initially if there is none present.
  if (!savedView) storeDataView('table');
  else return savedView;
  return 'table';
};

const getPathMatch = (pathname: string): boolean => {
  const res = togglePaths.some((p) => {
    // Look for the character set where the parameter for ID would be
    // replaced with the regex to catch any character between the forward slashes.
    const match = pathname.match(p.replace(/(:[^./]*)/g, '(.)+'));
    return match && pathname === match[0];
  });
  return res;
};

const getToggle = (pathname: string, view: ViewsType): boolean => {
  return getPathMatch(pathname)
    ? view
      ? view === 'card'
        ? true
        : false
      : getView() === 'card'
      ? true
      : false
    : false;
};

const PageContainer: React.FC = () => {
  const location = useLocation();
  const prevLocationRef = React.useRef(location);
  const { view } = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const [totalDataCount, setTotalDataCount] = React.useState(0);

  const isFetchingNum = useIsFetching();
  const loading = isFetchingNum > 0;

  const queryClient = useQueryClient();

  // we need to run this hook every render to ensure we have the
  // most up to date value from the query cache as otherwise
  // the count can fall behind
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const count =
      queryClient.getQueryData<number>('count', {
        exact: false,
        active: true,
      }) ?? 0;
    if (count !== totalDataCount) setTotalDataCount(count);
  });

  const isCountFetchingNum = useIsFetching('count', {
    exact: false,
  });
  const loadedCount = isCountFetchingNum === 0;

  const { data: cartItems } = useCart();

  const [toggleCard, setToggleCard] = React.useState(false);

  const dispatch = useDispatch();

  const handleToggleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const nextView = event.target.checked ? 'card' : 'table';

      // Save the current view information to state and restore the previous view information.
      dispatch(saveView(toggleCard ? 'card' : 'table'));

      // Set the view in local storage.
      storeDataView(nextView);

      // Add the view and push the final query parameters.
      dispatch(pushPageView(nextView, location.pathname));

      // Set the state with the toggled card option and the saved query.

      setToggleCard(event.target.checked);
    },
    [location.pathname, dispatch, toggleCard]
  );

  const navigateToDownload = React.useCallback(
    () => dispatch(push('/download')),
    [dispatch]
  );

  const navigateToSearch = React.useCallback(
    () => dispatch(push('/search/data')),
    [dispatch]
  );

  React.useEffect(() => {
    prevLocationRef.current = location;
  });
  const prevLocation = prevLocationRef.current;
  const prevView = React.useMemo(
    () => parseSearchToQuery(prevLocation.search).view,
    [prevLocation]
  );

  React.useEffect(() => {
    // Ensure if the location changes, then we clear the view.
    if (prevLocation.pathname !== location.pathname) {
      dispatch(clearTable());
    }
    // If the view query parameter was not found and the previously
    // stored view is in localstorage, update our current query with the view.
    if (getToggle(location.pathname, view) && !view) {
      dispatch(pushPageView('card', location.pathname));
    }

    // Keep the query parameter for view and the state in sync, by getting the latest update.
    if (prevView !== view) {
      setToggleCard(getToggle(location.pathname, view));
    }
  }, [location.pathname, view, prevView, dispatch, prevLocation.pathname]);

  return (
    <Paper square elevation={0} style={{ backgroundColor: 'inherit' }}>
      <NavBar
        entityCount={totalDataCount ?? 0}
        cartItems={cartItems ?? []}
        navigateToSearch={navigateToSearch}
        navigateToDownload={navigateToDownload}
      />

      <StyledGrid container>
        {/* Toggle between the table and card view */}
        <Grid item xs={12}>
          <Route
            exact
            path={togglePaths}
            render={() => (
              <CardSwitch
                toggleCard={toggleCard}
                handleToggleChange={handleToggleChange}
              />
            )}
          />
        </Grid>

        {/* Show loading progress if data is still being loaded */}
        {loading && (
          <Grid item xs={12}>
            <LinearProgress color="secondary" />
          </Grid>
        )}

        {/* Hold the table for remainder of the page */}
        <Grid item xs={12} aria-label="container-table">
          <ViewRouting
            view={view}
            location={location}
            loadedCount={loadedCount}
            totalDataCount={totalDataCount ?? 0}
          />
        </Grid>
      </StyledGrid>
    </Paper>
  );
};

export default PageContainer;
