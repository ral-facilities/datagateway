import {
  Grid,
  LinearProgress,
  Paper,
  Typography,
  Theme,
  IconButton,
  styled,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import {
  Sticky,
  ViewsType,
  useCart,
  parseSearchToQuery,
  useUpdateView,
  readSciGatewayToken,
  ArrowTooltip,
  SelectionAlert,
  ViewCartButton,
  CartProps,
  useUpdateQueryParam,
  ViewButton,
  ClearFiltersButton,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Switch as SwitchRouting,
  Route,
  useLocation,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import PageBreadcrumbs from './breadcrumbs.component';
import PageRouting from './pageRouting.component';
import { Location as LocationType } from 'history';
import TranslatedHomePage from './translatedHomePage.component';
import DoiRedirect from './doiRedirect.component';
import RoleSelector from '../views/roleSelector.component';
import { useIsFetching, useQueryClient } from 'react-query';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getTablePaperStyle = (
  displayFilterMessage: boolean,
  tablePaperHeight: string
) => {
  return {
    height: displayFilterMessage
      ? 'calc(100vh - 244px - 4rem - 36px)' // Footer is 36px
      : tablePaperHeight,
    width: '100%',
    backgroundColor: 'inherit',
    overflowX: 'auto',
  };
};

const cardPaperStyle = { backgroundColor: 'inherit' };

const NoResultsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: '960px',
}));

const OpenDataPaper = styled(Paper)(({ theme }) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  backgroundColor: (theme as any).colours?.warning,
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 0,
  paddingRight: 20,
  justifyContent: 'center',
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}));

// Define all the supported paths for data-view.
export const paths = {
  homepage: '/datagateway',
  root: '/browse',
  doiRedirect: '/doi-redirect/:facilityName/:entityName/:entityId',
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

// ISIS base paths - required for linking to correct search view
const isisPaths = [
  paths.myData.isis,
  paths.toggle.isisInstrument,
  paths.studyHierarchy.root,
];

// DLS base paths - required for linking to correct search view
const dlsPaths = [paths.myData.dls, paths.toggle.dlsProposal];

const BlackTextTypography = styled(Typography)({
  color: '#000000',
  fontSize: '16px',
});

const NavBar = React.memo(
  (
    props: {
      entityCount: number;
      navigateToSearch: () => void;
      loggedInAnonymously: boolean;
    } & CartProps
  ): React.ReactElement => {
    const [t] = useTranslation();
    const isStudyHierarchy =
      useRouteMatch([
        ...Object.values(paths.studyHierarchy.toggle),
        ...Object.values(paths.studyHierarchy.standard),
      ]) !== null;
    const isISISRoute = useRouteMatch(isisPaths) !== null;
    const landingPages = isStudyHierarchy
      ? paths.studyHierarchy.landing
      : isISISRoute
      ? paths.landing
      : [];
    const landingPageEntities = Object.values(landingPages).map(
      (x) => x.split('/')[x.split('/').length - 2]
    );

    return (
      <Sticky>
        <StyledGrid container>
          {/* Hold the breadcrumbs at top left of the page. */}
          <Grid
            className="tour-dataview-breadcrumbs"
            item
            xs
            aria-label="page-breadcrumbs"
          >
            {/* don't show breadcrumbs on /my-data - only on browse */}
            <Route path={[paths.root, paths.studyHierarchy.root]}>
              <PageBreadcrumbs landingPageEntities={landingPageEntities} />
            </Route>
          </Grid>

          {props.loggedInAnonymously || isStudyHierarchy ? (
            <Grid item>
              <OpenDataPaper square>
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  aria-label="open-data-warning"
                >
                  <Grid item>
                    <ArrowTooltip
                      title={
                        <h4>
                          {isStudyHierarchy
                            ? t('app.open_data_warning.studies_tooltip')
                            : t('app.open_data_warning.tooltip')}
                          <br />
                          <br />
                          <a
                            href="https://www.isis.stfc.ac.uk/Pages/Data-Policy.aspx"
                            style={{ color: '#6793FF' }}
                          >
                            {t('app.open_data_warning.tooltip_link')}
                          </a>
                        </h4>
                      }
                      disableHoverListener={false}
                      aria-label={t('app.open_data_warning.aria_label')}
                    >
                      <IconButton
                        disableRipple
                        sx={{ backgroundColor: 'transparent' }}
                        size="large"
                      >
                        <InfoIcon
                          sx={{
                            color: (theme: Theme) =>
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (theme as any).colours?.information,
                          }}
                        />
                      </IconButton>
                    </ArrowTooltip>
                  </Grid>
                  <Grid item>
                    <BlackTextTypography variant="h6">
                      <b>{t('app.open_data_warning.message')}</b>
                    </BlackTextTypography>
                  </Grid>
                </Grid>
              </OpenDataPaper>
            </Grid>
          ) : null}

          {/* The table entity count has a size of 2 (or 3 for xs screens); the
            breadcrumbs will take the remainder of the space. */}
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
                <Grid
                  className="tour-dataview-results"
                  sx={{ textAlign: 'center' }}
                  item
                  sm={2}
                  xs={3}
                  aria-label="view-count"
                >
                  <Paper
                    square
                    sx={{
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
                </Grid>
              );
            }}
          />
          <Paper
            square
            sx={{
              backgroundColor: 'inherit',
              display: 'flex',
              paddingLeft: '6px',
              paddingRight: '6px',
            }}
          >
            <IconButton
              className="tour-dataview-search-icon"
              onClick={props.navigateToSearch}
              aria-label="view-search"
              sx={{ margin: 'auto' }}
              size="large"
            >
              <SearchIcon />
            </IconButton>
          </Paper>
          <Paper
            square
            sx={{
              backgroundColor: 'inherit',
              display: 'flex',
              paddingLeft: '6px',
              paddingRight: '6px',
            }}
          >
            <ViewCartButton
              cartItems={props.cartItems}
              navigateToDownload={props.navigateToDownload}
            />
          </Paper>
        </StyledGrid>
      </Sticky>
    );
  }
);
NavBar.displayName = 'NavBar';

const StyledRouting = (props: {
  viewStyle: ViewsType;
  view: ViewsType;
  location: LocationType;
  displayFilterMessage: boolean;
  loggedInAnonymously: boolean;
  linearProgressHeight: string;
}): React.ReactElement => {
  const {
    view,
    location,
    viewStyle,
    displayFilterMessage,
    loggedInAnonymously,
    linearProgressHeight,
  } = props;

  const breadcrumbDiv = document.getElementById('breadcrumbs');

  const [breadcrumbHeight, setBreadcrumbHeight] = React.useState(
    breadcrumbDiv ? `${breadcrumbDiv.clientHeight}px` : '30px'
  );

  React.useEffect(() => {
    breadcrumbDiv
      ? setBreadcrumbHeight(`${breadcrumbDiv.clientHeight}px`)
      : setBreadcrumbHeight('30px');
  }, [breadcrumbDiv, breadcrumbDiv?.clientHeight]);

  // Footer is 36px
  // Chrome's display is 1px shorter than Firefox's, so we subtract 1px extra to account for this
  // We also don't want the <LinearProgress> bar to push the page down so subtract the height of this (4px if on-screen)
  // Additional rows of breadcrumbs also push the page down so subtract the height of the breadcrumb div
  const tablePaperHeight = `calc(100vh - 152px - 36px - 1px - ${linearProgressHeight} - ${breadcrumbHeight})`;

  const [t] = useTranslation();
  const tableClassStyle = getTablePaperStyle(
    displayFilterMessage,
    tablePaperHeight
  );
  return (
    <div>
      {viewStyle !== 'card' && displayFilterMessage && (
        <NoResultsPaper>
          <Typography
            align="center"
            variant="h6"
            component="h6"
            aria-label="filter-message"
          >
            {t('loading.filter_message')}
          </Typography>
        </NoResultsPaper>
      )}
      <Paper
        square
        sx={viewStyle === 'card' ? cardPaperStyle : tableClassStyle}
        className="tour-dataview-data"
      >
        <PageRouting
          loggedInAnonymously={loggedInAnonymously}
          view={view}
          location={location}
        />
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
    loggedInAnonymously: boolean;
    linearProgressHeight: string;
  }): React.ReactElement => {
    const {
      view,
      loadedCount,
      totalDataCount,
      location,
      loggedInAnonymously,
      linearProgressHeight,
    } = props;
    const displayFilterMessage = loadedCount && totalDataCount === 0;

    return (
      <SwitchRouting>
        {/* For "landing" paths, don't use a containing Paper */}
        <Route
          exact
          path={Object.values(paths.landing).concat(
            Object.values(paths.studyHierarchy.landing)
          )}
          render={() => (
            <PageRouting
              loggedInAnonymously={loggedInAnonymously}
              view={view}
              location={location}
            />
          )}
        />
        {/* For "toggle" paths, check state for the current view to determine styling */}
        <Route exact path={togglePaths}>
          <StyledRouting
            viewStyle={view}
            view={view}
            location={location}
            loggedInAnonymously={loggedInAnonymously}
            displayFilterMessage={displayFilterMessage}
            linearProgressHeight={linearProgressHeight}
          />
        </Route>

        {/* Otherwise, use the paper styling for tables*/}
        <Route>
          <StyledRouting
            viewStyle={'table'}
            view={view}
            location={location}
            loggedInAnonymously={loggedInAnonymously}
            displayFilterMessage={displayFilterMessage}
            linearProgressHeight={linearProgressHeight}
          />
        </Route>
      </SwitchRouting>
    );
  }
);
ViewRouting.displayName = 'ViewRouting';

const storeDataView = (view: NonNullable<ViewsType>): void => {
  localStorage.setItem('dataView', view);
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

const DataviewPageContainer: React.FC = () => {
  const location = useLocation();
  const { push } = useHistory();
  const prevLocationRef = React.useRef(location);
  const { view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const [totalDataCount, setTotalDataCount] = React.useState(0);

  // exclude size and count queries from showing the linear progress bar for performance
  const isFetchingNum = useIsFetching({
    predicate: (query) =>
      !query.queryHash.includes('Size') &&
      !query.queryHash.includes('DatasetCount') &&
      !query.queryHash.includes('DatafileCount'),
  });
  const loading = isFetchingNum > 0;

  const [linearProgressHeight, setlinearProgressHeight] = React.useState(
    loading ? '4px' : '0px'
  );

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

  React.useEffect(() => {
    loading ? setlinearProgressHeight('4px') : setlinearProgressHeight('0px');
  }, [loading]);

  const isCountFetchingNum = useIsFetching('count', {
    exact: false,
  });
  const loadedCount = isCountFetchingNum === 0;

  const { data: cartItems } = useCart();

  const pushView = useUpdateView('push');
  const replaceView = useUpdateView('replace');

  const handleButtonChange = React.useCallback((): void => {
    const nextView = view !== 'card' ? 'card' : 'table';

    // Set the view in local storage.
    storeDataView(nextView);

    // push the view to query parameters.
    pushView(nextView);
  }, [pushView, view]);

  const navigateToDownload = React.useCallback(() => push('/download'), [push]);

  const isisRouteMatch = useRouteMatch(isisPaths);
  const dlsRouteMatch = useRouteMatch(dlsPaths);
  const isISISRoute = isisRouteMatch !== null;
  const isDLSRoute = dlsRouteMatch !== null;

  const navigateToSearch = React.useCallback(() => {
    if (isISISRoute) {
      return push('/search/isis');
    } else if (isDLSRoute) {
      return push('/search/dls');
    } else {
      return push('/search/data');
    }
  }, [push, isISISRoute, isDLSRoute]);

  React.useEffect(() => {
    prevLocationRef.current = location;
  });
  const prevLocation = prevLocationRef.current;
  const prevView = React.useMemo(
    () => parseSearchToQuery(prevLocation.search).view,
    [prevLocation]
  );

  React.useEffect(() => {
    // If the view query parameter was not found and the previously
    // stored view is in localstorage, update our current query with the view.
    if (getToggle(location.pathname, view) && !view) {
      //Replace rather than push here to ensure going back doesn't just go to the same
      //page without the query which would execute this code again
      replaceView('card');
    }
  }, [location.pathname, view, prevView, prevLocation.pathname, replaceView]);

  //Determine whether logged in anonymously (assume this if username is null)
  const username = readSciGatewayToken().username;
  const loggedInAnonymously = username === null || username === 'anon/anon';

  const { filters } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const dlsDefaultFilters = {
    startDate: {
      endDate: `${new Date(Date.now()).toISOString().split('T')[0]}`,
    },
  };

  const disabled =
    Object.keys(filters).length === 0 ||
    (location.pathname === paths.myData.dls &&
      JSON.stringify(filters) === JSON.stringify(dlsDefaultFilters))
      ? true
      : false;

  const pushFilters = useUpdateQueryParam('filters', 'push');

  const handleButtonClearFilters = (): void => {
    if (location.pathname === paths.myData.dls) {
      pushFilters(dlsDefaultFilters);
    } else {
      pushFilters({});
    }
  };

  return (
    <Paper square elevation={0} style={{ backgroundColor: 'inherit' }}>
      <NavBar
        entityCount={totalDataCount ?? 0}
        cartItems={cartItems ?? []}
        navigateToSearch={navigateToSearch}
        navigateToDownload={navigateToDownload}
        loggedInAnonymously={loggedInAnonymously}
      />

      <StyledGrid container>
        <Grid item xs={12} style={{ marginTop: '10px', marginBottom: '10px' }}>
          <StyledGrid container alignItems="baseline">
            {/* Toggle between the table and card view */}
            <Grid item style={{ display: 'flex', alignItems: 'baseline' }}>
              <Route
                exact
                path={Object.values(paths.myData)}
                render={() => <RoleSelector />}
              />
              <Route
                exact
                path={togglePaths}
                render={() => (
                  <ViewButton
                    viewCards={view === 'card'}
                    handleButtonChange={handleButtonChange}
                  />
                )}
              />
              <Route
                exact
                path={Object.values(paths.myData).concat(
                  Object.values(paths.toggle),
                  Object.values(paths.standard),
                  Object.values(paths.studyHierarchy.toggle),
                  Object.values(paths.studyHierarchy.standard)
                )}
                render={() => (
                  <ClearFiltersButton
                    handleButtonClearFilters={handleButtonClearFilters}
                    disabled={disabled}
                  />
                )}
              />
            </Grid>
            <Grid item xs={true}>
              <SelectionAlert
                selectedItems={cartItems ?? []}
                navigateToSelection={navigateToDownload}
                marginSide={'8px'}
                loggedInAnonymously={loggedInAnonymously}
              />
            </Grid>
          </StyledGrid>
        </Grid>

        {/* Show loading progress if data is still being loaded */}
        {loading && (
          <Grid item xs={12}>
            <LinearProgress
              color="secondary"
              style={{ height: linearProgressHeight }}
            />
          </Grid>
        )}

        {/* Hold the view for remainder of the page */}
        <Grid item xs={12} aria-label="page-view">
          <ViewRouting
            view={view}
            location={location}
            loadedCount={loadedCount}
            loggedInAnonymously={loggedInAnonymously}
            totalDataCount={totalDataCount ?? 0}
            linearProgressHeight={linearProgressHeight}
          />
        </Grid>
      </StyledGrid>
    </Paper>
  );
};

const PageContainer: React.FC = () => {
  const location = useLocation();

  return (
    <SwitchRouting location={location}>
      {/* Load the homepage */}
      <Route exact path={paths.homepage} component={TranslatedHomePage} />
      <Route exact path={paths.doiRedirect}>
        <DoiRedirect />
      </Route>
      {/* Load the standard dataview pageContainer */}
      <Route>
        <DataviewPageContainer />
      </Route>
    </SwitchRouting>
  );
};

export default PageContainer;
