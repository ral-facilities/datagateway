import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import {
  Badge,
  Paper,
  Theme,
  createStyles,
  withStyles,
  LinearProgress,
} from '@material-ui/core';

import { StyleRules } from '@material-ui/core/styles';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import InvestigationSearchTable from './table/investigationSearchTable.component';
import DatasetSearchTable from './table/datasetSearchTable.component';
import DatafileSearchTable from './table/datafileSearchTable.component';
import { useTranslation } from 'react-i18next';
import {
  ViewCartButton,
  CartProps,
  parseSearchToQuery,
  useLuceneSearchInfinite,
  SearchResponse,
} from 'datagateway-common';
import { useLocation } from 'react-router-dom';
import { InfiniteData, useIsFetching } from 'react-query';

const badgeStyles = (theme: Theme): StyleRules =>
  createStyles({
    badge: {
      backgroundColor: '#CCCCCC',
      //Increase contrast on high contrast modes by using black text
      color:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (theme as any).colours?.type === 'contrast' ? '#000000' : '#333333',
      fontSize: '14px',
      fontWeight: 'bold',
      lineHeight: 'inherit',
      top: '1em',
    },
  });

const tabStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      backgroundColor: (theme as any).colours?.tabsGrey,
      //Fixes contrast issue for unselected tabs in darkmode
      color:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (theme as any).palette.type === 'dark'
          ? '#FFFFFF'
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (theme as any).colours?.blue,
      boxShadow: 'none',
    },
    indicator: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      backgroundColor: (theme as any).colours?.blue,
    },
  });

const boxStyles = (theme: Theme): StyleRules =>
  createStyles({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    root: { backgroundColor: (theme as any).colours?.tabsGrey },
  });

export interface SearchTableProps {
  containerHeight: string;
  hierarchy: string;
  onTabChange: (currentTab: string) => void;
  currentTab: string;
}

interface SearchTableStoreProps {
  minNumResults: number;
  maxNumResults: number;
  datasetTab: boolean;
  datafileTab: boolean;
  investigationTab: boolean;
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

const StyledBadge = withStyles(badgeStyles)(Badge);
const StyledTabs = withStyles(tabStyles)(Tabs);
const StyledBox = withStyles(boxStyles)(Box);

const SearchPageTable = (
  props: SearchTableProps & SearchTableStoreProps & CartProps
): React.ReactElement => {
  const {
    minNumResults,
    maxNumResults,
    investigationTab,
    datasetTab,
    datafileTab,
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
      sort,
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

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void => {
    onTabChange(newValue);
  };

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
              <Tab value="investigation" style={{ display: 'none' }} />
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
              <Tab value="dataset" style={{ display: 'none' }} />
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
              <Tab value="datafile" style={{ display: 'none' }} />
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
          <Paper
            style={{
              height: `calc(${containerHeight} - 56px)`,
              minHeight: `calc(500px - 56px)`,
              overflowX: 'auto',
              overflowY: 'hidden',
            }}
            elevation={0}
          >
            <InvestigationSearchTable hierarchy={hierarchy} />
          </Paper>
        </TabPanel>
      )}
      {currentTab === 'dataset' && (
        <TabPanel value={currentTab} index={'dataset'}>
          <Paper
            style={{
              height: `calc(${containerHeight} - 56px)`,
              minHeight: `calc(500px - 56px)`,
              overflowX: 'auto',
              overflowY: 'hidden',
            }}
            elevation={0}
          >
            <DatasetSearchTable hierarchy={hierarchy} />
          </Paper>
        </TabPanel>
      )}
      {currentTab === 'datafile' && (
        <TabPanel value={currentTab} index={'datafile'}>
          <Paper
            style={{
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

const mapStateToProps = (state: StateType): SearchTableStoreProps => {
  return {
    minNumResults: state.dgsearch.minNumResults,
    maxNumResults: state.dgsearch.maxNumResults,
    datasetTab: state.dgsearch.tabs.datasetTab,
    datafileTab: state.dgsearch.tabs.datafileTab,
    investigationTab: state.dgsearch.tabs.investigationTab,
  };
};

export default connect(mapStateToProps)(SearchPageTable);
