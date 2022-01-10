import React from 'react';
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

interface SearchPageContainerStoreProps {
  sideLayout: boolean;
  searchableEntities: string[];
  maxNumResults: number;
  datafileTab: boolean;
  datasetTab: boolean;
  investigationTab: boolean;
  currentTab: string;
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
    currentTab,
  } = props;

  const location = useLocation();
  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const { view, startDate, endDate } = queryParams;
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

  const [searchText, setSearchText] = React.useState(
    queryParams.searchText ? queryParams.searchText : ''
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

  const {
    refetch: searchInvestigations,
    isIdle: investigationsIdle,
    isFetching: investigationsFetching,
  } = useLuceneSearch('Investigation', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });
  const {
    refetch: searchDatasets,
    isIdle: datasetsIdle,
    isFetching: datasetsFetching,
  } = useLuceneSearch('Dataset', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });
  const {
    refetch: searchDatafiles,
    isIdle: datafilesIdle,
    isFetching: datafilesFetching,
  } = useLuceneSearch('Datafile', {
    searchText,
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
  }, [
    searchText,
    datafile,
    dataset,
    investigation,
    pushSearchText,
    searchDatafiles,
    searchDatasets,
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
      initiateSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Table should take up page but leave room for: SG appbar, SG footer,
  // grid padding, search box, checkboxes, date selectors, example search text, limited results message, padding.
  const spacing = 2;
  // TODO: Container height is too small on smaller screens (e.g. laptops).
  const containerHeight = `calc(100vh - 64px - 48px - ${spacing}*16px - (69px + 19rem/16) - 42px - (53px + 19rem/16) - 21px - 24px - 8px${
    loading ? '-' : '-4px'
  })`;

  const { data: cartItems } = useCart();
  const { push } = useHistory();

  const navigateToDownload = React.useCallback(() => push('/download'), [push]);

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
            spacing={spacing}
            style={{ margin: 0, width: '100%' }}
          >
            <Grid item id="container-search-filters">
              {sideLayout ? (
                <Paper style={{ height: '100%', width: '100%' }}>
                  <SearchBoxContainerSide
                    searchText={searchText}
                    initiateSearch={initiateSearch}
                    onSearchTextChange={handleSearchTextChange}
                  />
                </Paper>
              ) : (
                <Paper
                  style={{
                    height: '100%',
                    width: '70vw',
                    minWidth: 584, // Minimum width to ensure search box contents stay aligned
                  }}
                >
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
                  <Grid
                    container
                    style={{
                      width: '98vw',
                      minWidth: 584,
                      backgroundColor: '#00000000',
                    }}
                  >
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
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container justify="center" id="container-search-table">
                  <Paper
                    style={{
                      // Only use height for the paper component if the view is table.
                      ...(view === 'table' ? { height: containerHeight } : {}),
                      minHeight: 326,
                      width: '98vw',
                      minWidth: 584,
                      backgroundColor: '#00000000',
                    }}
                  >
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
                      />
                    ) : (
                      <SearchPageTable
                        containerHeight={containerHeight}
                        hierarchy={match.params.hierarchy}
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
  currentTab: state.dgsearch.tabs.currentTab,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchPageContainer);
