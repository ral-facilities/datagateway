import React from 'react';
import {
  AppBar,
  Badge,
  badgeClasses,
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
  parseSearchToQuery,
  useLuceneSearchInfinite,
  useUpdateQueryParam,
  SearchResponse,
  ViewCartButton,
  ViewsType,
} from 'datagateway-common';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { InfiniteData, useIsFetching } from 'react-query';
import { connect } from 'react-redux';
import { getFilters, getSorts } from './searchPageContainer.component';
import type { StateType } from './state/app.types';
import InvestigationSearchTable from './table/investigationSearchTable.component';
import InvestigationCardView from './card/investigationSearchCardView.component';
import DatafileSearchTable from './table/datafileSearchTable.component';
import DatasetCardView from './card/datasetSearchCardView.component';
import DatasetSearchTable from './table/datasetSearchTable.component';

export interface SearchTableProps {
  containerHeight: string;
  hierarchy: string;
  onTabChange: (currentTab: string) => void;
  currentTab: string;
}

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
      {value === index && <Box pt={1}>{children}</Box>}
    </Box>
  );
}

function a11yProps(index: string): React.ReactFragment {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  [`& .${badgeClasses.badge}`]: {
    backgroundColor: '#CCCCCC',
    //Increase contrast on high contrast modes by using black text
    color:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (theme as any).colours?.type === 'contrast' ? '#000000' : '#333333',
    fontSize: '14px',
    fontWeight: 'bold',
    lineHeight: 'inherit',
    transform: 'none',
    position: 'static',
  },
}));

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

interface SearchTabsStoreProps {
  minNumResults: number;
  maxNumResults: number;
  datasetTab: boolean;
  datafileTab: boolean;
  investigationTab: boolean;
}

export interface SearchTabsProps {
  view: ViewsType;
  containerHeight: string;
  hierarchy: string;
  onTabChange: (currentTab: string) => void;
  currentTab: string;
}

const SearchTabs = (
  props: SearchTabsProps & SearchTabsStoreProps & CartProps
): React.ReactElement => {
  const {
    minNumResults,
    maxNumResults,
    investigationTab,
    datasetTab,
    datafileTab,
    view,
    containerHeight,
    hierarchy,
    onTabChange,
    currentTab,
    cartItems,
    navigateToDownload,
  } = props;
  const [t] = useTranslation();

  const location = useLocation();
  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const { startDate, endDate, sort, filters, restrict } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const {
    data: investigations,
    hasNextPage: investigationsHasNextPage,
  } = useLuceneSearchInfinite(
    'Investigation',
    {
      searchText: searchText,
      startDate,
      endDate,
      minCount: minNumResults,
      maxCount: maxNumResults,
      restrict,
      facets: [
        { target: 'Investigation' },
        {
          target: 'InvestigationParameter',
          dimensions: [{ dimension: 'type.name' }],
        },
        {
          target: 'Sample',
          dimensions: [{ dimension: 'type.name' }],
        },
      ],
    },
    filters
  );
  const {
    data: datasets,
    hasNextPage: datasetsHasNextPage,
  } = useLuceneSearchInfinite(
    'Dataset',
    {
      searchText: searchText,
      startDate,
      endDate,
      sort,
      minCount: minNumResults,
      maxCount: maxNumResults,
      restrict,
      facets: [{ target: 'Dataset' }],
    },
    filters
  );
  const {
    data: datafiles,
    hasNextPage: datafilesHasNextPage,
  } = useLuceneSearchInfinite(
    'Datafile',
    {
      searchText: searchText,
      startDate,
      endDate,
      sort,
      minCount: minNumResults,
      maxCount: maxNumResults,
      restrict: restrict,
      facets: [
        { target: 'Datafile' },
        {
          target: 'DatafileParameter',
          dimensions: [{ dimension: 'type.name' }],
        },
      ],
    },
    filters
  );

  const countSearchResults = (
    searchResponses: InfiniteData<SearchResponse> | undefined,
    hasNextPage: boolean | undefined
  ): string => {
    if (searchResponses) {
      let numResults = 0;
      searchResponses.pages.forEach((searchResponse) => {
        numResults += searchResponse.results?.length ?? 0;
      });
      return String(numResults) + (hasNextPage ? '+' : '');
    }
    return '?';
  };

  const investigationCount = React.useMemo(
    () => countSearchResults(investigations, investigationsHasNextPage),
    [investigations, investigationsHasNextPage]
  );

  const datasetCount = React.useMemo(
    () => countSearchResults(datasets, datasetsHasNextPage),
    [datasets, datasetsHasNextPage]
  );

  const datafileCount = React.useMemo(
    () => countSearchResults(datafiles, datafilesHasNextPage),
    [datafiles, datafilesHasNextPage]
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

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void => {
    onTabChange(newValue);

    replaceFilters({});
    replaceSorts({});
  };

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
      <AppBar position="static" elevation={0}>
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
            {investigationTab ? (
              <Tab
                label={
                  <StyledBadge
                    id="investigation-badge"
                    badgeContent={
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginTop: '1px',
                        }}
                      >
                        {investigationCount}
                      </span>
                    }
                    showZero
                    max={999}
                  >
                    <span
                      style={{
                        paddingRight: '1ch',
                        marginRight: `calc(0.5 * ${investigationCount.length}ch + 6px)`,
                        marginLeft: `calc(-0.5 * ${investigationCount.length}ch - 6px)`,
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      {t('tabs.investigation')}
                    </span>
                  </StyledBadge>
                }
                value="investigation"
                {...a11yProps('investigation')}
              />
            ) : (
              <Tab value="investigation" sx={{ display: 'none' }} />
            )}
            {datasetTab ? (
              <Tab
                label={
                  <StyledBadge
                    id="dataset-badge"
                    badgeContent={datasetCount}
                    showZero
                    max={999}
                  >
                    <span
                      style={{
                        paddingRight: '1ch',
                        marginRight: `calc(0.5 * ${datasetCount.length}ch + 6px)`,
                        marginLeft: `calc(-0.5 * ${datasetCount.length}ch - 6px)`,
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      {t('tabs.dataset')}
                    </span>
                  </StyledBadge>
                }
                value="dataset"
                {...a11yProps('dataset')}
              />
            ) : (
              <Tab value="dataset" sx={{ display: 'none' }} />
            )}
            {datafileTab ? (
              <Tab
                label={
                  <StyledBadge
                    id="datafile-badge"
                    badgeContent={datafileCount}
                    showZero
                    max={999}
                  >
                    <span
                      style={{
                        paddingRight: '1ch',
                        marginRight: `calc(0.5 * ${datafileCount.length}ch + 6px)`,
                        marginLeft: `calc(-0.5 * ${datafileCount.length}ch - 6px)`,
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      {t('tabs.datafile')}
                    </span>
                  </StyledBadge>
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
      </AppBar>
      {currentTab === 'investigation' && (
        <TabPanel value={currentTab} index={'investigation'}>
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
      )}
      {currentTab === 'dataset' && (
        <TabPanel value={currentTab} index={'dataset'}>
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
      )}
      {currentTab === 'datafile' && (
        <TabPanel value={currentTab} index={'datafile'}>
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
      )}
    </div>
  );
};

const mapStateToProps = (state: StateType): SearchTabsStoreProps => {
  return {
    minNumResults: state.dgsearch.minNumResults,
    maxNumResults: state.dgsearch.maxNumResults,
    datasetTab: state.dgsearch.tabs.datasetTab,
    datafileTab: state.dgsearch.tabs.datafileTab,
    investigationTab: state.dgsearch.tabs.investigationTab,
  };
};

export default connect(mapStateToProps)(SearchTabs);
