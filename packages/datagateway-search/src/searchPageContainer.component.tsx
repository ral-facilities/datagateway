import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import { Switch, Route, RouteComponentProps } from 'react-router';
import { Link, useLocation } from 'react-router-dom';

import {
  Grid,
  Paper,
  LinearProgress,
  Button,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core';

import SearchPageTable from './searchPageTable.component';
import SearchPageCardView from './searchPageCardView.component';
import SearchBoxContainer from './searchBoxContainer.component';
import SearchBoxContainerSide from './searchBoxContainerSide.component';

import { useHistory } from 'react-router-dom';
import {
  useLuceneSearch,
  ViewsType,
  parseSearchToQuery,
  useUpdateView,
  usePushSearchText,
  useCart,
  SelectionAlert,
  readSciGatewayToken,
  FiltersType,
  SortType,
  usePushCurrentTab,
} from 'datagateway-common';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  setDatafileTab,
  setDatasetTab,
  setInvestigationTab,
} from './state/actions/actions';
import { useTranslation } from 'react-i18next';
import ViewListIcon from '@material-ui/icons/ViewList';
import ViewAgendaIcon from '@material-ui/icons/ViewAgenda';
import { StyleRules } from '@material-ui/core/styles';

export const storeFilters = (
  filters: FiltersType,
  searchableEntities: string
): void => {
  const filter = (searchableEntities as string) + 'Filters';

  localStorage.setItem(filter, JSON.stringify(filters));
};

export const storeSort = (
  sorts: SortType,
  searchableEntities: string
): void => {
  const sort = (searchableEntities as string) + 'Sort';

  localStorage.setItem(sort, JSON.stringify(sorts));
};

export const storePage = (page: number, searchableEntities: string): void => {
  const pageNumber = (searchableEntities as string) + 'Page';

  localStorage.setItem(pageNumber, JSON.stringify(page));
};

export const storeResults = (
  results: number,
  searchableEntities: string
): void => {
  const resultsNumber = (searchableEntities as string) + 'Results';

  localStorage.setItem(resultsNumber, JSON.stringify(results));
};

export const getFilters = (searchableEntities: string): FiltersType => {
  const filter = (searchableEntities as string) + 'Filters';
  const savedFilters = localStorage.getItem(filter);
  if (savedFilters) {
    return JSON.parse(savedFilters) as FiltersType;
  } else {
    return {};
  }
};

export const getSorts = (searchableEntities: string): SortType => {
  const sort = (searchableEntities as string) + 'Sort';
  const savedSort = localStorage.getItem(sort);
  if (savedSort) {
    return JSON.parse(savedSort) as SortType;
  } else {
    return {};
  }
};

export const getPage = (searchableEntities: string): number | null => {
  const pageNumber = (searchableEntities as string) + 'Page';
  const savedPage = localStorage.getItem(pageNumber);
  if (savedPage) {
    return JSON.parse(savedPage) as number;
  } else {
    return null;
  }
};

export const getResults = (searchableEntities: string): number | null => {
  const resultsNumber = (searchableEntities as string) + 'Results';
  const savedResults = localStorage.getItem(resultsNumber);
  if (savedResults) {
    return JSON.parse(savedResults) as number;
  } else {
    return null;
  }
};

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

const togglePaths = ['/search/data'];

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

const viewButtonStyles = makeStyles(
  (theme: Theme): StyleRules =>
    createStyles({
      root: {
        padding: `${theme.spacing(1)}px 0px ${theme.spacing(1)}px 0px`,
        marginRight: theme.spacing(1),
      },
    })
);

const ViewButton = (props: {
  viewCards: boolean;
  handleButtonChange: () => void;
  disabled: boolean;
}): React.ReactElement => {
  const [t] = useTranslation();
  const classes = viewButtonStyles();

  return (
    <div className={classes.root}>
      <Button
        className="tour-dataview-view-button"
        aria-label="container-view-button"
        variant="contained"
        color="primary"
        size="small"
        startIcon={props.viewCards ? <ViewListIcon /> : <ViewAgendaIcon />}
        onClick={() => props.handleButtonChange()}
        disabled={props.disabled}
      >
        {props.viewCards && !props.disabled
          ? t('app.view_table')
          : t('app.view_cards')}
      </Button>
    </div>
  );
};

const searchPageStyles = makeStyles<
  Theme,
  { view: ViewsType; containerHeight: string }
>((theme: Theme) => {
  return createStyles({
    root: {
      margin: 0,
      width: '100%',
    },
    topLayout: {
      height: '100%',
      // make width of box bigger on smaller screens to prevent overflow
      // decreasing the space for the search results
      width: '100%',
      '@media (min-width: 1000px) and (min-height: 700px)': {
        width: '98%',
      },
      margin: '0 auto',
    },
    sideLayout: {
      height: '100%',
      width: '100%',
    },
    dataViewTopBar: {
      width: '98%',
      backgroundColor: '#00000000',
    },
    dataView: {
      // Only use height for the paper component if the view is table.
      // also ensure we account for the potential horizontal scrollbar
      height: ({ view, containerHeight }) =>
        view !== 'card' ? containerHeight : 'auto',
      minHeight: 500,
      width: '98%',
      backgroundColor: '#00000000',
    },
  });
});

interface SearchPageContainerStoreProps {
  sideLayout: boolean;
  searchableEntities: string[];
  maxNumResults: number;
  datafileTab: boolean;
  datasetTab: boolean;
  investigationTab: boolean;
}

interface SearchPageContainerDispatchProps {
  setDatasetTab: (toggleOption: boolean) => Action;
  setDatafileTab: (toggleOption: boolean) => Action;
  setInvestigationTab: (toggleOption: boolean) => Action;
}

type SearchPageContainerCombinedProps = SearchPageContainerStoreProps &
  SearchPageContainerDispatchProps;

const SearchPageContainer: React.FC<SearchPageContainerCombinedProps> = (
  props: SearchPageContainerCombinedProps
) => {
  const {
    setDatafileTab,
    setDatasetTab,
    setInvestigationTab,
    sideLayout,
    searchableEntities,
    maxNumResults,
  } = props;

  const location = useLocation();
  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const { view, startDate, endDate, currentTab } = queryParams;

  const searchTextURL = queryParams.searchText ? queryParams.searchText : '';

  //Do not allow these to be searched if they are not searchable (prevents URL
  //forcing them to be searched)
  const investigation = searchableEntities.includes('investigation')
    ? queryParams.investigation
    : false;
  const dataset = searchableEntities.includes('dataset')
    ? queryParams.dataset
    : false;
  const datafile = searchableEntities.includes('datafile')
    ? queryParams.datafile
    : false;

  const pushView = useUpdateView('push');
  const replaceView = useUpdateView('replace');
  const pushSearchText = usePushSearchText();
  const pushCurrentTab = usePushCurrentTab();

  const [searchText, setSearchText] = React.useState(searchTextURL);
  const [searchOnNextRender, setSearchOnNextRender] = React.useState(false);

  const handleSearchTextChange = (searchText: string): void => {
    setSearchText(searchText);
  };

  const handleButtonChange = React.useCallback((): void => {
    const nextView = view !== 'card' ? 'card' : 'table';

    // Set the view in local storage.
    storeDataView(nextView);

    // push the view to query parameters.
    pushView(nextView);
  }, [pushView, view]);

  React.useEffect(() => {
    // If the view query parameter was not found and the previously
    // stored view is in localstorage, update our current query with the view.
    if (getToggle(location.pathname, view) && !view) {
      //Replace rather than push here to ensure going back doesn't just go to the same
      //page without the query which would execute this code again
      replaceView('card');
    }
  }, [location.pathname, view, replaceView]);

  const {
    refetch: searchInvestigations,
    isIdle: investigationsIdle,
    isFetching: investigationsFetching,
  } = useLuceneSearch('Investigation', {
    searchText: searchTextURL,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });
  const {
    refetch: searchDatasets,
    isIdle: datasetsIdle,
    isFetching: datasetsFetching,
  } = useLuceneSearch('Dataset', {
    searchText: searchTextURL,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });
  const {
    refetch: searchDatafiles,
    isIdle: datafilesIdle,
    isFetching: datafilesFetching,
  } = useLuceneSearch('Datafile', {
    searchText: searchTextURL,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });

  const requestReceived =
    !investigationsIdle || !datasetsIdle || !datafilesIdle;

  const loading =
    investigationsFetching || datasetsFetching || datafilesFetching;

  const initiateSearch = React.useCallback(() => {
    pushSearchText(searchText);
    setSearchOnNextRender(true);

    localStorage.removeItem('investigationFilters');
    localStorage.removeItem('datasetFilters');
    localStorage.removeItem('datafileFilters');
    localStorage.removeItem('investigationSort');
    localStorage.removeItem('datasetSort');
    localStorage.removeItem('datafileSort');
    localStorage.removeItem('investigationPage');
    localStorage.removeItem('datasetPage');
    localStorage.removeItem('investigationResults');
    localStorage.removeItem('datasetResults');
  }, [searchText, pushSearchText]);

  React.useEffect(() => {
    if (searchOnNextRender) {
      if (dataset) {
        // Fetch lucene datasets
        searchDatasets();
      }

      if (datafile) {
        // Fetch lucene datafiles
        searchDatafiles();
      }
      if (investigation) {
        // Fetch lucene investigations
        searchInvestigations();
      }

      if (dataset || datafile || investigation) {
        // Set the appropriate tabs.
        setDatafileTab(datafile);
        setDatasetTab(dataset);
        setInvestigationTab(investigation);
      }

      setSearchOnNextRender(false);
    }
  }, [
    searchOnNextRender,
    dataset,
    datafile,
    investigation,
    searchDatasets,
    searchDatafiles,
    searchInvestigations,
    setDatafileTab,
    setDatasetTab,
    setInvestigationTab,
  ]);

  React.useEffect(() => {
    //Start search automatically if URL has been supplied with parameters (other than just the checkbox states)
    if (
      queryParams.searchText !== null ||
      queryParams.startDate ||
      queryParams.endDate
    )
      setSearchOnNextRender(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [searchBoxHeight, setSearchBoxHeight] = React.useState(0);

  const searchBoxResizeObserver = React.useRef<ResizeObserver>(
    new ResizeObserver((entries) => {
      if (entries[0].contentRect.height)
        setSearchBoxHeight(entries[0].contentRect.height);
    })
  );

  // need to use a useCallback instead of a useRef for this
  // see https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const searchBoxRef = React.useCallback((container: HTMLDivElement) => {
    if (container !== null) {
      searchBoxResizeObserver.current.observe(container);
    }
    // When element is unmounted we know container is null so time to clean up
    else {
      if (searchBoxResizeObserver.current)
        searchBoxResizeObserver.current.disconnect();
    }
  }, []);

  // Table should take up page but leave room for: SG appbar, SG footer,
  // search box, search box padding, display as cards button, loading bar
  const containerHeight = `calc(100vh - 64px - 36px - ${searchBoxHeight}px - 8px - 47px${
    loading ? '' : ' - 4px'
  })`;

  const { data: cartItems } = useCart();
  const { push } = useHistory();

  const navigateToDownload = React.useCallback(() => push('/download'), [push]);

  const username = readSciGatewayToken().username;
  const loggedInAnonymously = username === null || username === 'anon/anon';
  const classes = searchPageStyles({ view, containerHeight });

  return (
    <Switch>
      <Route
        exact
        path="/"
        render={() => <Link to="/search/data">Search data</Link>}
      />
      <Route
        path="/search/:hierarchy"
        render={({ match }: RouteComponentProps<{ hierarchy: string }>) => (
          <Grid
            container
            direction={sideLayout ? 'row' : 'column'}
            justify="center"
            alignItems="center"
            spacing={1}
            className={classes.root}
          >
            <Grid
              item
              id="container-search-filters"
              ref={searchBoxRef}
              style={{ width: '100%' }}
            >
              {sideLayout ? (
                <Paper className={classes.sideLayout}>
                  <SearchBoxContainerSide
                    searchText={searchText}
                    initiateSearch={initiateSearch}
                    onSearchTextChange={handleSearchTextChange}
                  />
                </Paper>
              ) : (
                <Paper className={classes.topLayout}>
                  <SearchBoxContainer
                    searchText={searchText}
                    initiateSearch={initiateSearch}
                    onSearchTextChange={handleSearchTextChange}
                  />
                </Paper>
              )}
            </Grid>

            {requestReceived && (
              <div style={{ width: '100%' }}>
                <Grid container justify="center">
                  <Grid container className={classes.dataViewTopBar}>
                    <Grid item xs={'auto'}>
                      <ViewButton
                        viewCards={view === 'card'}
                        handleButtonChange={handleButtonChange}
                        disabled={currentTab === 'datafile'}
                      />
                    </Grid>
                    <Grid item xs={true}>
                      <SelectionAlert
                        selectedItems={cartItems ?? []}
                        navigateToSelection={navigateToDownload}
                        loggedInAnonymously={loggedInAnonymously}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container justify="center" id="container-search-table">
                  <Paper className={classes.dataView}>
                    {/* Show loading progress if data is still being loaded */}
                    {loading && (
                      <Grid item xs={12}>
                        <LinearProgress color="secondary" />
                      </Grid>
                    )}
                    {view === 'card' ? (
                      <SearchPageCardView
                        containerHeight={containerHeight}
                        hierarchy={match.params.hierarchy}
                        onCurrentTab={pushCurrentTab}
                        currentTab={currentTab}
                      />
                    ) : (
                      <SearchPageTable
                        containerHeight={containerHeight}
                        hierarchy={match.params.hierarchy}
                        onCurrentTab={pushCurrentTab}
                        currentTab={currentTab}
                      />
                    )}
                  </Paper>
                </Grid>
              </div>
            )}
          </Grid>
        )}
      />
    </Switch>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): SearchPageContainerDispatchProps => ({
  setDatasetTab: (toggleOption: boolean) =>
    dispatch(setDatasetTab(toggleOption)),
  setDatafileTab: (toggleOption: boolean) =>
    dispatch(setDatafileTab(toggleOption)),
  setInvestigationTab: (toggleOption: boolean) =>
    dispatch(setInvestigationTab(toggleOption)),
});

const mapStateToProps = (state: StateType): SearchPageContainerStoreProps => ({
  sideLayout: state.dgsearch.sideLayout,
  searchableEntities: state.dgsearch.searchableEntities,
  maxNumResults: state.dgsearch.maxNumResults,
  datafileTab: state.dgsearch.tabs.datafileTab,
  datasetTab: state.dgsearch.tabs.datasetTab,
  investigationTab: state.dgsearch.tabs.investigationTab,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPageContainer);
