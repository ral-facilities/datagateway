import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import {
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Theme,
  Typography,
  styled,
} from '@mui/material';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import {
  ArrowTooltip,
  CartProps,
  ClearFiltersButton,
  SelectionAlert,
  Sticky,
  ViewButton,
  ViewCartButton,
  ViewsType,
  parseSearchToQuery,
  useCart,
  useUpdateQueryParam,
  useUpdateView,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';
import DOITypeSelector from '../views/doiTypeSelector.component';
import RoleSelector from '../views/roleSelector.component';
import PageBreadcrumbs from './breadcrumbs.component';

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
  genericRedirect:
    '/redirect/:facilityName/:entityName/:entityField/:fieldValue',
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
    dlsDataPublicationLanding: '/browse/dataPublication/:dataPublicationId',
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
  dataPublications: {
    dls: { myDOIs: '/my-dois/DLS', allDOIs: '/browse/dataPublication' },
    root: '/browseDataPublications',
    toggle: {
      isisInstrument: '/browseDataPublications/instrument',
      isisStudyDataPublication:
        '/browseDataPublications/instrument/:instrumentId/dataPublication',
      isisInvestigationDataPublication:
        '/browseDataPublications/instrument/:instrumentId/dataPublication/:studyDataPublicationId/investigation',
      isisDataPublication:
        '/browseDataPublications/instrument/:instrumentId/dataPublication',
      isisDataset:
        '/browseDataPublications/instrument/:instrumentId/dataPublication/:dataPublicationId/investigation/:investigationId/dataset',
    },
    standard: {
      isisDatafile:
        '/browseDataPublications/instrument/:instrumentId/dataPublication/:dataPublicationId/investigation/:investigationId/dataset/:datasetId/datafile',
    },
    landing: {
      isisDataPublicationLanding:
        '/browseDataPublications/instrument/:instrumentId/dataPublication/:dataPublicationId',
      isisInvestigationLanding:
        '/browseDataPublications/instrument/:instrumentId/dataPublication/:dataPublicationId/investigation/:investigationId',
      isisDatasetLanding:
        '/browseDataPublications/instrument/:instrumentId/dataPublication/:dataPublicationId/investigation/:investigationId/dataset/:datasetId',
    },
  },
  // defines routes for datafile previews
  preview: {
    isisDatafilePreview:
      '/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId/dataset/:datasetId/datafile/:datafileId',
    isisDataPublicationDatafilePreview:
      '/browseDataPublications/instrument/:instrumentId/dataPublication/:dataPublicationId/investigation/:investigationId/dataset/:datasetId/datafile/:datafileId',
  },
};

const togglePaths = Object.values(paths.toggle).concat(
  Object.values(paths.dataPublications.toggle)
);

// ISIS base paths - required for linking to correct search view
const isisPaths = [
  paths.myData.isis,
  paths.toggle.isisInstrument,
  paths.dataPublications.root,
];

// DLS base paths - required for linking to correct search view
const dlsPaths = [
  paths.myData.dls,
  paths.dataPublications.dls.myDOIs,
  paths.dataPublications.dls.allDOIs,
  paths.toggle.dlsProposal,
  paths.landing.dlsDataPublicationLanding,
];

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
    const { pathname } = useLocation();
    const isDataPublication = [
      ...Object.values(paths.dataPublications.toggle),
      ...Object.values(paths.dataPublications.standard),
    ].some((pathPattern) => matchPath(pathPattern, pathname) !== null);
    const isISISRoute = isisPaths.some(
      (pathPattern) => matchPath(pathPattern, pathname) !== null
    );
    const landingPages = isDataPublication
      ? paths.dataPublications.landing
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
            {/* show breadcrumbs on browse routes */}
            {[paths.root, paths.dataPublications.root].some(
              (pathPattern) =>
                matchPath({ path: pathPattern, end: false }, pathname) !== null
            ) && <PageBreadcrumbs landingPageEntities={landingPageEntities} />}
          </Grid>

          {props.loggedInAnonymously || isDataPublication ? (
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
                          {isDataPublication
                            ? t(
                                'app.open_data_warning.datapublications_tooltip'
                              )
                            : t('app.open_data_warning.tooltip')}
                          <br />
                          <br />
                          <a
                            href={t('app.open_data_warning.tooltip_link_url')}
                            style={{ color: '#6793FF' }}
                          >
                            {t('app.open_data_warning.tooltip_link_text')}
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
          {Object.values(paths.myData)
            .concat(
              [
                paths.dataPublications.dls.allDOIs,
                paths.dataPublications.dls.myDOIs,
              ],
              Object.values(paths.toggle),
              Object.values(paths.standard),
              Object.values(paths.dataPublications.toggle),
              Object.values(paths.dataPublications.standard)
            )
            .some(
              (pathPattern) => matchPath(pathPattern, pathname) !== null
            ) && (
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
          )}
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
  displayFilterMessage: boolean;
  linearProgressHeight: string;
}): React.ReactElement => {
  const { viewStyle, displayFilterMessage, linearProgressHeight } = props;

  const breadcrumbDiv = document.getElementById('breadcrumbs');

  const [breadcrumbHeight, setBreadcrumbHeight] = React.useState(
    breadcrumbDiv ? `${breadcrumbDiv.clientHeight}px` : '30px'
  );

  React.useEffect(() => {
    if (breadcrumbDiv) setBreadcrumbHeight(`${breadcrumbDiv.clientHeight}px`);
    else setBreadcrumbHeight('30px');
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
    <div data-testid="styled-routing">
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
        <Outlet />
      </Paper>
    </div>
  );
};

const ViewRouting = React.memo(
  (props: {
    view: ViewsType;
    loadedCount: boolean;
    totalDataCount: number;
    linearProgressHeight: string;
  }): React.ReactElement => {
    const { view, loadedCount, totalDataCount, linearProgressHeight } = props;
    const displayFilterMessage =
      loadedCount &&
      totalDataCount === 0 &&
      Object.values(paths.preview).every(
        (pathPattern) => matchPath(pathPattern, location.pathname) === null
      ) &&
      !matchPath(
        paths.landing.dlsDataPublicationLanding + '/edit',
        location.pathname
      );

    /* For "landing" paths, don't use a containing Paper */
    if (
      [
        ...Object.values(paths.landing),
        ...Object.values(paths.dataPublications.landing),
        ...Object.values(paths.preview),
      ].some(
        (pathPattern) => matchPath(pathPattern, location.pathname) !== null
      )
    )
      return <Outlet />;

    /* For "toggle" paths, check state for the current view to determine styling */
    if (
      togglePaths.some(
        (pathPattern) => matchPath(pathPattern, location.pathname) !== null
      )
    )
      return (
        <StyledRouting
          viewStyle={view}
          displayFilterMessage={displayFilterMessage}
          linearProgressHeight={linearProgressHeight}
        />
      );

    /* Otherwise, use the paper styling for tables*/

    return (
      <StyledRouting
        viewStyle={'table'}
        displayFilterMessage={displayFilterMessage}
        linearProgressHeight={linearProgressHeight}
      />
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

const PageContainer = (props: {
  loggedInAnonymously: boolean;
  view: ViewsType;
}) => {
  const { loggedInAnonymously, view } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const prevLocationRef = React.useRef(location);
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
    const count = (queryClient.getQueriesData<number>({
      queryKey: ['count'],
      exact: false,
      type: 'active',
    }) ?? 0)?.[0]?.[1];
    if (typeof count !== 'undefined' && count !== totalDataCount)
      setTotalDataCount(count);
  });

  React.useEffect(() => {
    if (loading) setlinearProgressHeight('4px');
    else setlinearProgressHeight('0px');
  }, [loading]);

  const isCountFetchingNum = useIsFetching({
    queryKey: ['count'],
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

  const navigateToDownload = React.useCallback(
    () => navigate('/download'),
    [navigate]
  );

  const isISISRoute = isisPaths.some(
    (pathPattern) => matchPath(pathPattern, location.pathname) !== null
  );
  const isDLSRoute = dlsPaths.some(
    (pathPattern) => matchPath(pathPattern, location.pathname) !== null
  );

  const navigateToSearch = React.useCallback(() => {
    if (isISISRoute) {
      return navigate('/search/isis');
    } else if (isDLSRoute) {
      return navigate('/search/dls');
    } else {
      return navigate('/search/data');
    }
  }, [navigate, isISISRoute, isDLSRoute]);

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
            <Grid container item alignItems="end">
              {Object.values(paths.myData).some(
                (pathPattern) =>
                  matchPath(pathPattern, location.pathname) !== null
              ) && (
                <Grid item ml={1} xs="auto">
                  <RoleSelector />
                </Grid>
              )}
              {matchPath(
                paths.dataPublications.dls.myDOIs,
                location.pathname
              ) !== null && <DOITypeSelector type="myDOIs" />}
              {matchPath(
                paths.dataPublications.dls.allDOIs,
                location.pathname
              ) !== null && <DOITypeSelector type="allDOIs" />}
              {Object.values(togglePaths).some(
                (pathPattern) =>
                  matchPath(pathPattern, location.pathname) !== null
              ) && (
                <ViewButton
                  viewCards={view === 'card'}
                  handleButtonChange={handleButtonChange}
                />
              )}
              {Object.values(paths.myData)
                .concat(
                  [
                    paths.dataPublications.dls.allDOIs,
                    paths.dataPublications.dls.myDOIs,
                  ],
                  Object.values(paths.toggle),
                  Object.values(paths.standard),
                  Object.values(paths.dataPublications.toggle),
                  Object.values(paths.dataPublications.standard)
                )
                .some(
                  (pathPattern) =>
                    matchPath(pathPattern, location.pathname) !== null
                ) && (
                <Grid item ml={1} xs="auto">
                  <ClearFiltersButton
                    handleButtonClearFilters={handleButtonClearFilters}
                    disabled={disabled}
                  />
                </Grid>
              )}
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
            loadedCount={loadedCount}
            totalDataCount={totalDataCount ?? 0}
            linearProgressHeight={linearProgressHeight}
          />
        </Grid>
      </StyledGrid>
    </Paper>
  );
};

export default PageContainer;
