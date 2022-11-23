import React from 'react';
import {
  Box,
  LinearProgress,
  Paper,
  styled,
  Tab,
  Tabs,
  tabsClasses,
} from '@mui/material';
import {
  CartProps,
  DatasearchType,
  useUpdateQueryParam,
  ViewCartButton,
  ViewsType,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useIsFetching } from 'react-query';
import { useSelector } from 'react-redux';
import { getFilters, getSorts } from './searchPageContainer.component';
import type { StateType } from './state/app.types';
import InvestigationSearchTable from './table/investigationSearchTable.component';
import InvestigationCardView from './card/investigationSearchCardView.component';
import DatafileSearchTable from './table/datafileSearchTable.component';
import DatasetCardView from './card/datasetSearchCardView.component';
import DatasetSearchTable from './table/datasetSearchTable.component';
import SearchTabLabel from './searchTabLabel.component';

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps): React.ReactElement {
  const { children, value, index, ...other } = props;

  return (
    <Box
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      border={0}
      {...other}
    >
      <Box pt={1}>{children}</Box>
    </Box>
  );
}

function a11yProps(index: string): React.ReactFragment {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  [`& .${tabsClasses.root}`]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    backgroundColor: (theme as any).colours?.tabsGrey,
    //Fixes contrast issue for unselected tabs in darkmode
    color:
      theme.palette.mode === 'dark'
        ? '#FFFFFF'
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (theme as any).colours?.blue,
    boxShadow: 'none',
  },
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  backgroundColor: (theme as any).colours?.tabsGrey,
}));

export interface SearchTabsProps {
  view: ViewsType;
  containerHeight: string;
  hierarchy: string;
  onTabChange: (currentTab: string) => void;
  currentTab: string;
}

/**
 * Stores number of search results for each entity type.
 */
type SearchResultCounts = {
  [TType in DatasearchType]?: SearchResultCount;
};

export interface SearchResultCount {
  type: DatasearchType;
  count: number;
  hasMore: boolean;
}

/**
 * Dispatch this action to notify {@link SearchTabs} of the current count of
 * the search results of the given {@link DatasearchType}.
 */
export interface UpdateSearchResultCountAction {
  type: 'UPDATE_SEARCH_RESULT_COUNT';
  payload: SearchResultCount;
}

/**
 * Dispatch this action to notify {@link SearchTabs} to reset the search results
 * of the given {@link DatasearchType}.
 * {@link SearchTabs} will forget the current count and will display its count as unknown.
 */
export interface ResetSearchResultCountAction {
  type: 'RESET_SEARCH_RESULT_COUNT';
  payload: DatasearchType;
}

type SearchResultCountAction =
  | UpdateSearchResultCountAction
  | ResetSearchResultCountAction;

/**
 * Handles actions dispatched by search tables.
 */
function searchResultCountsReducer(
  state: SearchResultCounts,
  action: SearchResultCountAction
): SearchResultCounts {
  switch (action.type) {
    case 'RESET_SEARCH_RESULT_COUNT':
      // make a copy of the current state
      // and remove the search result count of the given data search type.
      const next: SearchResultCounts = { ...state };
      delete next[action.payload];
      return next;

    case 'UPDATE_SEARCH_RESULT_COUNT':
      return {
        ...state,
        [action.payload.type]: action.payload,
      };

    default:
      return state;
  }
}

/**
 * Context for dispatching search result count after they are available.
 * Default value is the identity function (I don't want to deal with null values).
 */
const SearchResultCountDispatch = React.createContext<
  React.Dispatch<SearchResultCountAction>
>((_) => _);

const SearchTabs = ({
  view,
  containerHeight,
  hierarchy,
  onTabChange,
  currentTab,
  cartItems,
  navigateToDownload,
}: SearchTabsProps & CartProps): React.ReactElement => {
  const isDatasetTabEnabled = useSelector(
    (state: StateType) => state.dgsearch.tabs.datasetTab
  );
  const isDatafileTabEnabled = useSelector(
    (state: StateType) => state.dgsearch.tabs.datafileTab
  );
  const isInvestigationTabEnabled = useSelector(
    (state: StateType) => state.dgsearch.tabs.investigationTab
  );
  const [t] = useTranslation();

  // stores the search result counts of various data search type.
  // since only the actual data views (e.g. search tables) are responsible for fetching the actual search result
  // for its own data search type (e.g. investigation search table fetches investigation search results)
  // only they know the number of search results returned.
  //
  // since this component is responsible for displaying the search result counts next
  // to each tab, it needs to obtain the counts from the data views.
  // this is done by passing down the dispatch function that data views can call
  // to pass the correct search result count when it is available.
  // data views can also reset the count through the dispatch function.
  // doing so erases the current search result count, and it will be shown as unknown to the users.
  // for example, they can reset the count when they are fetching fresh data.
  //
  // the dispatch function is available through SearchResultCountContext.
  const [searchResultCounts, dispatch] = React.useReducer(
    searchResultCountsReducer,
    {}
  );

  const isFetchingNum = useIsFetching({
    predicate: (query) =>
      !query.queryHash.includes('InvestigationCount') &&
      !query.queryHash.includes('DatasetCount') &&
      !query.queryHash.includes('DatafileCount'),
  });
  const loading = isFetchingNum > 0;

  const replaceFilters = useUpdateQueryParam('filters', 'replace');
  const replaceSorts = useUpdateQueryParam('sort', 'replace');

  function handleChange(
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void {
    onTabChange(newValue);

    replaceFilters({});
    replaceSorts({});
  }

  /**
   * Formats the given {@link SearchResultCount} as a user-facing label.
   * If count is unknown, a question mark is shown.
   * If count is concrete, the count is displayed literally.
   * If there are more search results available,
   * the count only counts the number of rows fetched,
   * so a '+' is appended at the end of the count to indicate more rows are available.
   *
   * @param count The count to be formatted
   */
  function formatSearchResultCount(
    count: SearchResultCount | undefined
  ): string {
    if (count) {
      return `${count.count}${count.hasMore ? '+' : ''}`;
    }
    return '?';
  }

  React.useEffect(() => {
    const filters = getFilters(currentTab);
    const sorts = getSorts(currentTab);
    if (filters) replaceFilters(filters);
    if (sorts) replaceSorts(sorts);
  }, [currentTab, replaceFilters, replaceSorts]);

  return (
    <div>
      {/* Show loading progress if data is still being loaded */}
      {loading && <LinearProgress color="secondary" />}
      <StyledBox
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
        height="100%"
        boxSizing="border-box"
      >
        <StyledTabs
          className="tour-search-tab-select"
          indicatorColor="secondary"
          textColor="secondary"
          value={currentTab}
          onChange={handleChange}
          aria-label={t('searchPageTable.tabs_arialabel')}
        >
          {isInvestigationTabEnabled ? (
            <Tab
              label={
                <SearchTabLabel
                  id="investigation-badge"
                  label={t('tabs.investigation')}
                  count={formatSearchResultCount(
                    searchResultCounts.Investigation
                  )}
                />
              }
              value="investigation"
              {...a11yProps('investigation')}
            />
          ) : (
            <Tab value="investigation" sx={{ display: 'none' }} />
          )}
          {isDatasetTabEnabled ? (
            <Tab
              label={
                <SearchTabLabel
                  id="dataset-badge"
                  label={t('tabs.dataset')}
                  count={formatSearchResultCount(searchResultCounts.Dataset)}
                />
              }
              value="dataset"
              {...a11yProps('dataset')}
            />
          ) : (
            <Tab value="dataset" sx={{ display: 'none' }} />
          )}
          {isDatafileTabEnabled ? (
            <Tab
              label={
                <SearchTabLabel
                  id="datafile-badge"
                  label={t('tabs.datafile')}
                  count={formatSearchResultCount(searchResultCounts.Datafile)}
                />
              }
              value="datafile"
              {...a11yProps('datafile')}
            />
          ) : (
            <Tab value="datafile" sx={{ display: 'none' }} />
          )}
        </StyledTabs>
        <StyledBox marginLeft="auto">
          <ViewCartButton
            cartItems={cartItems}
            navigateToDownload={navigateToDownload}
          />
        </StyledBox>
      </StyledBox>
      <SearchResultCountDispatch.Provider value={dispatch}>
        <Box>
          <TabPanel value={currentTab} index="investigation">
            {view === 'card' ? (
              <InvestigationCardView hierarchy={hierarchy} />
            ) : (
              <Paper
                sx={{
                  height: `calc(${containerHeight} - 56px)`,
                  minHeight: `calc(500px - 56px)`,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                }}
                elevation={0}
              >
                <InvestigationSearchTable hierarchy={hierarchy} />
              </Paper>
            )}
          </TabPanel>
          <TabPanel value={currentTab} index="dataset">
            {view === 'card' ? (
              <DatasetCardView hierarchy={hierarchy} />
            ) : (
              <Paper
                sx={{
                  height: `calc(${containerHeight} - 56px)`,
                  minHeight: `calc(500px - 56px)`,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                }}
                elevation={0}
              >
                <DatasetSearchTable hierarchy={hierarchy} />
              </Paper>
            )}
          </TabPanel>
          <TabPanel value={currentTab} index="datafile">
            <Paper
              sx={{
                height: `calc(${containerHeight} - 56px)`,
                minHeight: `calc(500px - 56px)`,
                overflowX: 'auto',
                overflowY: 'hidden',
              }}
              elevation={0}
            >
              <DatafileSearchTable hierarchy={hierarchy} />
            </Paper>
          </TabPanel>
        </Box>
      </SearchResultCountDispatch.Provider>
    </div>
  );
};

export default SearchTabs;
export { SearchResultCountDispatch };
