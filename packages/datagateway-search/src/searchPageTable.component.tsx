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
import InvestigationSearchTable from './table/investigationSearchTable.component';
import DatasetSearchTable from './table/datasetSearchTable.component';
import DatafileSearchTable from './table/datafileSearchTable.component';
import { useTranslation } from 'react-i18next';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { setCurrentTab } from './state/actions/actions';
import {
  FiltersType,
  parseSearchToQuery,
  SearchableEntities,
  SortType,
  useDatafileCount,
  useDatasetCount,
  useInvestigationCount,
  useLuceneSearch,
  useUpdateFilter,
  useUpdateSort,
  useClearFilters,
  useClearSort,
} from 'datagateway-common';
import { useLocation } from 'react-router-dom';
import { useIsFetching } from 'react-query';

const badgeStyles = (theme: Theme): StyleRules =>
  createStyles({
    badge: {
      backgroundColor: '#fff',
      color: '#000000',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      top: '0.875em',
    },
  });

const tabStyles = (theme: Theme): StyleRules =>
  createStyles({
    indicator: {
      //Use white for all modes except use red for dark high contrast mode as this is much clearer
      backgroundColor:
        theme.palette.type === 'dark' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (theme as any).colours?.type === 'contrast'
          ? '#FF0000'
          : '#FFFFFF',
    },
  });

interface SearchTableProps {
  containerHeight: string;
  hierarchy: string;
}

interface SearchTableStoreProps {
  maxNumResults: number;
  datasetTab: boolean;
  datafileTab: boolean;
  investigationTab: boolean;
  currentTab: string;
}

interface SearchTableDispatchProps {
  setCurrentTab: (newValue: string) => Action;
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

const SearchPageTable = (
  props: SearchTableProps & SearchTableStoreProps & SearchTableDispatchProps
): React.ReactElement => {
  const {
    maxNumResults,
    investigationTab,
    datasetTab,
    datafileTab,
    currentTab,
    setCurrentTab,
    containerHeight,
    hierarchy,
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

  const storeFilters = (
    filters: FiltersType,
    searchableEntities: SearchableEntities
  ): void => {
    const filter = (searchableEntities as string) + 'Filters';

    localStorage.setItem(filter, JSON.stringify(filters));
  };

  const storeSort = (
    sorts: SortType,
    searchableEntities: SearchableEntities
  ): void => {
    const sort = (searchableEntities as string) + 'Sort';

    localStorage.setItem(sort, JSON.stringify(sorts));
  };

  const getFilters = (
    searchableEntities: SearchableEntities
  ): FiltersType | null => {
    const filter = (searchableEntities as string) + 'Filters';
    const savedFilters = localStorage.getItem(filter);
    if (savedFilters) {
      return JSON.parse(savedFilters) as FiltersType;
    } else {
      return null;
    }
  };

  const getSort = (searchableEntities: SearchableEntities): SortType | null => {
    const sort = (searchableEntities as string) + 'Sort';
    const savedSort = localStorage.getItem(sort);
    if (savedSort) {
      return JSON.parse(savedSort) as SortType;
    } else {
      return null;
    }
  };

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const clearFilters = useClearFilters();
  const clearSort = useClearSort();

  const replaceFilters = useUpdateFilter('replace');
  const replaceHandleSort = useUpdateSort('replace');

  const updateFilters = (filter: FiltersType | null): void => {
    if (filter) {
      Object.entries(filter).map(([key, value]) => replaceFilters(key, value));
    }
  };

  const clearAllFilters = (filter: FiltersType): void => {
    if (filter) {
      Object.entries(filter).map(([key, value]) => clearFilters(key, value));
    }
  };

  const updateSort = (sort: SortType | null): void => {
    if (sort) {
      Object.entries(sort).map(([key, value]) => replaceHandleSort(key, value));
    }
  };

  const clearAllSort = (sort: SortType): void => {
    if (sort) {
      Object.entries(sort).map(([key, value]) => clearSort(key, value));
    }
  };

  // Setting a tab based on user selection and what tabs are available
  useEffect(() => {
    if (currentTab === 'investigation') {
      if (!investigationTab) {
        if (datasetTab) {
          setCurrentTab('dataset');
        } else if (datafileTab) {
          setCurrentTab('datafile');
        }
      }
    } else if (currentTab === 'dataset') {
      if (!datasetTab) {
        if (investigationTab) {
          setCurrentTab('investigation');
        } else if (datafileTab) {
          setCurrentTab('datafile');
        } else {
          setCurrentTab('investigation');
        }
      }
    } else {
      if (!datafileTab) {
        if (investigationTab) {
          setCurrentTab('investigation');
        } else if (datasetTab) {
          setCurrentTab('dataset');
        } else {
          setCurrentTab('investigation');
        }
      }
    }
  }, [setCurrentTab, investigationTab, datasetTab, datafileTab, currentTab]);

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void => {
    if (currentTab === 'investigation') {
      storeFilters(filters, 'investigation');
      storeSort(sort, 'investigation');
    }

    if (currentTab === 'dataset') {
      storeFilters(filters, 'dataset');
      storeSort(sort, 'dataset');
    }

    if (currentTab === 'datafile') {
      storeFilters(filters, 'datafile');
      storeSort(sort, 'datafile');
    }
    setCurrentTab(newValue);

    clearAllFilters(filters);
    clearAllSort(sort);

    if (newValue === 'investigation') {
      updateFilters(getFilters('investigation'));
      updateSort(getSort('investigation'));
    }

    if (newValue === 'dataset') {
      updateFilters(getFilters('dataset'));
      updateSort(getSort('dataset'));
    }

    if (newValue === 'datafile') {
      updateFilters(getFilters('datafile'));
      updateSort(getSort('datafile'));
    }
  };

  React.useEffect(() => {
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
  }, []);

  const { data: investigationDataCount } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: investigation || [] },
      }),
    },
  ]);

  const { data: datasetDataCount } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: dataset || [] },
      }),
    },
  ]);

  const { data: datafileDataCount } = useDatafileCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: datafile || [] },
      }),
    },
  ]);

  const badgeDigits = (length?: number): 3 | 2 | 1 => {
    return length ? (length >= 100 ? 3 : length >= 10 ? 2 : 1) : 1;
  };

  return (
    <div>
      {/* Show loading progress if data is still being loaded */}
      {loading && <LinearProgress color="secondary" />}
      <AppBar position="static">
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
    maxNumResults: state.dgsearch.maxNumResults,
    datasetTab: state.dgsearch.tabs.datasetTab,
    datafileTab: state.dgsearch.tabs.datafileTab,
    investigationTab: state.dgsearch.tabs.investigationTab,
    currentTab: state.dgsearch.tabs.currentTab,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): SearchTableDispatchProps => ({
  setCurrentTab: (newValue: string) => dispatch(setCurrentTab(newValue)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchPageTable);
