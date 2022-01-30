import React, { useEffect } from 'react';
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
import DatafileSearchTable from './table/datafileSearchTable.component';
import { useTranslation } from 'react-i18next';
import {
  parseSearchToQuery,
  useDatafileCount,
  useDatasetCount,
  useInvestigationCount,
  useLuceneSearch,
  useUpdateQueryParam,
} from 'datagateway-common';
import InvestigationCardView from './card/investigationSearchCardView.component';
import DatasetCardView from './card/datasetSearchCardView.component';
import { useLocation } from 'react-router-dom';
import { useIsFetching } from 'react-query';
import {
  getFilters,
  getPage,
  getResults,
  getSorts,
  storeFilters,
  storePage,
  storeResults,
  storeSorts,
} from './searchPageContainer.component';

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

export interface SearchCardViewProps {
  containerHeight: string;
  hierarchy: string;
  onCurrentTab: (currentTab: string) => void;
  currentTab: string | null;
}

interface SearchCardViewStoreProps {
  maxNumResults: number;
  datasetTab: boolean;
  datafileTab: boolean;
  searchableEntities: string[];
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
      {value === index && <Box p={3}>{children}</Box>}
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

const SearchPageCardView = (
  props: SearchCardViewProps & SearchCardViewStoreProps
): React.ReactElement => {
  const {
    maxNumResults,
    investigationTab,
    datasetTab,
    datafileTab,
    searchableEntities,
    containerHeight,
    hierarchy,
    onCurrentTab,
    currentTab,
  } = props;
  const [t] = useTranslation();

  const location = useLocation();
  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const { startDate, endDate } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const { data: investigation } = useLuceneSearch('Investigation', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });
  const { data: dataset } = useLuceneSearch('Dataset', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });
  const { data: datafile } = useLuceneSearch('Datafile', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });

  const isFetchingNum = useIsFetching({
    predicate: (query) =>
      !query.queryHash.includes('InvestigationCount') &&
      !query.queryHash.includes('DatasetCount') &&
      !query.queryHash.includes('DatafileCount'),
  });
  const loading = isFetchingNum > 0;

  const { filters, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const boolSearchableEntities = [investigationTab, datasetTab, datafileTab];

  const checkedBoxes = boolSearchableEntities.flatMap((b, i) =>
    b ? searchableEntities[i] : []
  );
  const searchCurrentTab =
    currentTab && checkedBoxes.includes(currentTab)
      ? currentTab
      : checkedBoxes.length !== 0
      ? checkedBoxes[0]
      : searchableEntities[0];

  const updateFilters = useUpdateQueryParam('filters');
  const updateSorts = useUpdateQueryParam('sort');
  const updatePage = useUpdateQueryParam('page');
  const updateResults = useUpdateQueryParam('results');

  // Setting a tab based on user selection and what tabs are available
  useEffect(() => {
    if (searchCurrentTab === 'investigation') {
      onCurrentTab('investigation');
    } else if (searchCurrentTab === 'dataset') {
      onCurrentTab('dataset');
    } else {
      onCurrentTab('datafile');
    }
  }, [
    investigationTab,
    datasetTab,
    datafileTab,
    onCurrentTab,
    searchCurrentTab,
  ]);

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void => {
    storeFilters(filters, searchCurrentTab);
    storeSorts(sort, searchCurrentTab);
    if (page) {
      storePage(page, searchCurrentTab);
    }
    if (results) {
      storeResults(results, searchCurrentTab);
    }

    onCurrentTab(newValue);

    updateFilters({});
    updateSorts({});
    updatePage(null);
    updateResults(null);
  };

  React.useEffect(() => {
    if (currentTab) {
      updateFilters(getFilters(currentTab));
      updateSorts(getSorts(currentTab));
      updatePage(getPage(currentTab));
      updateResults(getResults(currentTab));
    }
  }, [currentTab, updateFilters, updatePage, updateResults, updateSorts]);

  const { data: investigationDataCount } = useInvestigationCount(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: investigation || [] },
        }),
      },
    ],
    getFilters('investigation'),
    searchCurrentTab
  );

  const { data: datasetDataCount } = useDatasetCount(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: dataset || [] },
        }),
      },
    ],
    getFilters('dataset'),
    searchCurrentTab
  );

  const { data: datafileDataCount } = useDatafileCount(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: datafile || [] },
        }),
      },
    ],
    getFilters('datafile'),
    searchCurrentTab
  );

  const badgeDigits = (length?: number): 3 | 2 | 1 => {
    return length ? (length >= 100 ? 3 : length >= 10 ? 2 : 1) : 1;
  };

  return (
    <div>
      {/* Show loading progress if data is still being loaded */}
      {loading && <LinearProgress color="secondary" />}
      <AppBar position="static" elevation={0}>
        <StyledTabs
          className="tour-search-tab-select"
          value={searchCurrentTab}
          onChange={handleChange}
          aria-label={t('searchPageCardView.tabs_arialabel')}
        >
          {investigationTab ? (
            <Tab
              label={
                <StyledBadge
                  id="investigation-badge"
                  badgeContent={investigationDataCount ?? 0}
                  showZero
                  max={999}
                >
                  <span
                    style={{
                      paddingRight: '1ch',
                      marginRight: `calc(0.5 * ${badgeDigits(
                        investigation?.length
                      )}ch + 6px)`,
                      marginLeft: `calc(-0.5 * ${badgeDigits(
                        investigation?.length
                      )}ch - 6px)`,
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
                  badgeContent={datasetDataCount ?? 0}
                  showZero
                  max={999}
                >
                  <span
                    style={{
                      paddingRight: '1ch',
                      marginRight: `calc(0.5 * ${badgeDigits(
                        dataset?.length
                      )}ch + 6px)`,
                      marginLeft: `calc(-0.5 * ${badgeDigits(
                        dataset?.length
                      )}ch - 6px)`,
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
                  badgeContent={datafileDataCount ?? 0}
                  showZero
                  max={999}
                >
                  <span
                    style={{
                      paddingRight: '1ch',
                      marginRight: `calc(0.5 * ${badgeDigits(
                        datafile?.length
                      )}ch + 6px)`,
                      marginLeft: `calc(-0.5 * ${badgeDigits(
                        datafile?.length
                      )}ch - 6px)`,
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
      </AppBar>

      {searchCurrentTab === 'investigation' && (
        <TabPanel value={searchCurrentTab} index={'investigation'}>
          <InvestigationCardView hierarchy={hierarchy} />
        </TabPanel>
      )}

      {searchCurrentTab === 'dataset' && (
        <TabPanel value={searchCurrentTab} index={'dataset'}>
          <DatasetCardView hierarchy={hierarchy} />
        </TabPanel>
      )}

      {searchCurrentTab === 'datafile' && (
        <TabPanel value={searchCurrentTab} index={'datafile'}>
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

const mapStateToProps = (state: StateType): SearchCardViewStoreProps => {
  return {
    maxNumResults: state.dgsearch.maxNumResults,
    datasetTab: state.dgsearch.tabs.datasetTab,
    datafileTab: state.dgsearch.tabs.datafileTab,
    investigationTab: state.dgsearch.tabs.investigationTab,
    searchableEntities: state.dgsearch.searchableEntities,
  };
};

export default connect(mapStateToProps)(SearchPageCardView);
