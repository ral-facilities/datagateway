import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import {
  Link,
  Route,
  RouteComponentProps,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom';

import { Grid, Paper, styled } from '@mui/material';

import SearchBoxContainer from './searchBoxContainer.component';
import SearchBoxContainerSide from './searchBoxContainerSide.component';
import SearchTabs from './searchTabs.component';
import {
  ClearFiltersButton,
  FiltersType,
  parseSearchToQuery,
  readSciGatewayToken,
  SelectionAlert,
  SortType,
  useCart,
  usePushCurrentTab,
  usePushSearchRestrict,
  usePushSearchText,
  useUpdateQueryParam,
  useUpdateView,
  ViewButton,
  ViewsType,
} from 'datagateway-common';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  setDatafileTab,
  setDatasetTab,
  setInvestigationTab,
} from './state/actions/actions';

export const storeFilters = (
  filters: FiltersType,
  searchableEntities: string
): void => {
  const filter = (searchableEntities as string) + 'Filters';

  if (Object.keys(filters).length !== 0)
    localStorage.setItem(filter, JSON.stringify(filters));
};

export const storeSort = (
  sorts: SortType,
  searchableEntities: string
): void => {
  const sort = (searchableEntities as string) + 'Sort';

  if (Object.keys(sorts).length !== 0)
    localStorage.setItem(sort, JSON.stringify(sorts));
};

export const storePage = (page: number, searchableEntities: string): void => {
  const pageNumber = (searchableEntities as string) + 'Page';

  if (page !== 1) localStorage.setItem(pageNumber, JSON.stringify(page));
};

export const storeResults = (
  results: number,
  searchableEntities: string
): void => {
  const resultsNumber = (searchableEntities as string) + 'Results';

  if (results !== 10)
    localStorage.setItem(resultsNumber, JSON.stringify(results));
};

export const getFilters = (searchableEntities: string): FiltersType | null => {
  const filter = (searchableEntities as string) + 'Filters';
  const savedFilters = localStorage.getItem(filter);
  if (savedFilters) {
    return JSON.parse(savedFilters) as FiltersType;
  } else {
    return null;
  }
};

export const getSorts = (searchableEntities: string): SortType | null => {
  const sort = (searchableEntities as string) + 'Sort';
  const savedSort = localStorage.getItem(sort);
  if (savedSort) {
    return JSON.parse(savedSort) as SortType;
  } else {
    return null;
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
      : getView() === 'card'
    : false;
};

const TopSearchBoxPaper = styled(Paper)(() => ({
  height: '100%',
  // make width of box bigger on smaller screens to prevent overflow
  // decreasing the space for the search results
  width: '100%',
  '@media (min-width: 1000px) and (min-height: 700px)': {
    width: '98%',
  },
  margin: '0 auto',
}));

const SideSearchBoxPaper = styled(Paper)(() => ({
  height: '100%',
  width: '100%',
}));

const DataViewPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'view' && prop !== 'containerHeight',
})<{ view: ViewsType; containerHeight: string }>(
  ({ view, containerHeight }) => ({
    // Only use height for the paper component if the view is table.
    // also ensure we account for the potential horizontal scrollbar
    height: view !== 'card' ? containerHeight : 'auto',
    minHeight: 500,
    width: '98%',
    backgroundColor: '#00000000',
  })
);

interface SearchPageContainerStoreProps {
  sideLayout: boolean;
  searchableEntities: string[];
  minNumResults: number;
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
    investigationTab,
    datasetTab,
    datafileTab,
    sideLayout,
    searchableEntities,
  } = props;

  const location = useLocation();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { view } = queryParams;

  const searchTextURL = queryParams.searchText ? queryParams.searchText : '';

  const boolSearchableEntities = [investigationTab, datasetTab, datafileTab];
  const checkedBoxes = boolSearchableEntities.flatMap((b, i) =>
    b ? searchableEntities[i] : []
  );
  const currentTab =
    queryParams.currentTab && checkedBoxes.includes(queryParams.currentTab)
      ? queryParams.currentTab
      : checkedBoxes.length !== 0
      ? checkedBoxes[0]
      : searchableEntities[0];

  //Do not allow these to be searched if they are not searchable (prevents URL
  //forcing them to be searched)]
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
  const pushSearchRestrict = usePushSearchRestrict();
  const replaceFilters = useUpdateQueryParam('filters', 'replace');
  const replacePage = useUpdateQueryParam('page', 'replace');
  const replaceResults = useUpdateQueryParam('results', 'replace');

  React.useEffect(() => {
    if (currentTab !== queryParams.currentTab) pushCurrentTab(currentTab);
  }, [checkedBoxes, currentTab, pushCurrentTab, queryParams.currentTab]);

  const [searchText, setSearchText] = React.useState(searchTextURL);
  const [isSearchInitiated, setIsSearchInitiated] = React.useState(
    Boolean(searchText)
  );
  const [shouldRestrictSearch, setShouldRestrictSearch] = React.useState(
    parseSearchToQuery(location.search).restrict
  );

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

  const initiateSearch = React.useCallback(() => {
    // TODO: should probably combine all search params into one object then push it to the URL.
    pushSearchText(searchText);
    pushSearchRestrict(shouldRestrictSearch);

    localStorage.removeItem('investigationFilters');
    localStorage.removeItem('datasetFilters');
    localStorage.removeItem('datafileFilters');
    localStorage.removeItem('investigationPage');
    localStorage.removeItem('datasetPage');
    localStorage.removeItem('investigationResults');
    localStorage.removeItem('datasetResults');

    if (Object.keys(queryParams.filters).length !== 0) replaceFilters({});
    if (queryParams.page !== null) replacePage(null);
    if (queryParams.results !== null) replaceResults(null);

    setIsSearchInitiated(true);
  }, [
    pushSearchText,
    searchText,
    pushSearchRestrict,
    shouldRestrictSearch,
    queryParams.filters,
    queryParams.page,
    queryParams.results,
    replaceFilters,
    replacePage,
    replaceResults,
  ]);

  React.useEffect(() => {
    if (dataset || datafile || investigation) {
      // Set the appropriate tabs.
      setDatafileTab(datafile);
      setDatasetTab(dataset);
      setInvestigationTab(investigation);
    }
  }, [
    dataset,
    datafile,
    investigation,
    setDatafileTab,
    setDatasetTab,
    setInvestigationTab,
  ]);

  React.useEffect(() => {
    // Sync search text in URL with local search text state
    setSearchText(searchTextURL);
  }, [searchTextURL]);

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
  const containerHeight = `calc(100vh - 64px - 36px - ${searchBoxHeight}px - 8px - 49px)`;

  const { data: cartItems } = useCart();
  const { push } = useHistory();

  const navigateToDownload = React.useCallback(() => push('/download'), [push]);

  const username = readSciGatewayToken().username;
  const loggedInAnonymously = username === null || username === 'anon/anon';

  const disabled = Object.keys(queryParams.filters).length === 0;

  const pushFilters = useUpdateQueryParam('filters', 'push');

  const handleButtonClearFilters = (): void => {
    pushFilters({});
  };

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
            justifyContent="center"
            alignItems="center"
            rowSpacing={1}
            sx={{ margin: 0, width: '100%' }}
          >
            <Grid
              item
              id="container-search-filters"
              ref={searchBoxRef}
              sx={{ width: '100%' }}
            >
              {sideLayout ? (
                <SideSearchBoxPaper>
                  <SearchBoxContainerSide
                    searchText={searchText}
                    restrict={shouldRestrictSearch}
                    initiateSearch={initiateSearch}
                    onSearchTextChange={handleSearchTextChange}
                    onMyDataCheckboxChange={(restrict) =>
                      setShouldRestrictSearch(restrict)
                    }
                  />
                </SideSearchBoxPaper>
              ) : (
                <TopSearchBoxPaper>
                  <SearchBoxContainer
                    searchText={searchText}
                    restrict={shouldRestrictSearch}
                    initiateSearch={initiateSearch}
                    onSearchTextChange={handleSearchTextChange}
                    onMyDataCheckboxChange={(restrict) =>
                      setShouldRestrictSearch(restrict)
                    }
                  />
                </TopSearchBoxPaper>
              )}
            </Grid>

            {isSearchInitiated && (
              <div style={{ width: '100%' }}>
                <Grid container justifyContent="center">
                  <Grid
                    container
                    sx={{ width: '98%', backgroundColor: '#00000000' }}
                  >
                    <Grid item xs={'auto'}>
                      <ViewButton
                        viewCards={view === 'card'}
                        handleButtonChange={handleButtonChange}
                        disabled={currentTab === 'datafile'}
                      />
                      <ClearFiltersButton
                        handleButtonClearFilters={handleButtonClearFilters}
                        disabled={disabled}
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
                <Grid
                  container
                  justifyContent="center"
                  id="container-search-table"
                >
                  <DataViewPaper view={view} containerHeight={containerHeight}>
                    <SearchTabs
                      view={view}
                      containerHeight={containerHeight}
                      hierarchy={match.params.hierarchy}
                      onTabChange={pushCurrentTab}
                      currentTab={currentTab}
                      cartItems={cartItems ?? []}
                      navigateToDownload={navigateToDownload}
                    />
                  </DataViewPaper>
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
  minNumResults: state.dgsearch.minNumResults,
  maxNumResults: state.dgsearch.maxNumResults,
  datafileTab: state.dgsearch.tabs.datafileTab,
  datasetTab: state.dgsearch.tabs.datasetTab,
  investigationTab: state.dgsearch.tabs.investigationTab,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPageContainer);
