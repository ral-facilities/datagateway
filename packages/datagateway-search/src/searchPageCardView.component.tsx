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
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { setCurrentTab } from './state/actions/actions';
import {
  parseSearchToQuery,
  useDatafileCount,
  useDatasetCount,
  useInvestigationCount,
  useLuceneSearch,
} from 'datagateway-common';
import InvestigationCardView from './card/investigationSearchCardView.component';
import DatasetCardView from './card/datasetSearchCardView.component';
import { useLocation } from 'react-router-dom';
import { useIsFetching } from 'react-query';

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

interface SearchCardViewProps {
  containerHeight: string;
  hierarchy: string;
}

interface SearchCardViewStoreProps {
  maxNumResults: number;
  datasetTab: boolean;
  datafileTab: boolean;
  investigationTab: boolean;
  currentTab: string;
}

interface SearchCardViewDispatchProps {
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
  props: SearchCardViewProps &
    SearchCardViewStoreProps &
    SearchCardViewDispatchProps
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
    setCurrentTab(newValue);
  };

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
      <AppBar position="static" elevation={0}>
        <StyledTabs
          className="tour-search-tab-select"
          value={currentTab}
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

      {currentTab === 'investigation' && (
        <TabPanel value={currentTab} index={'investigation'}>
          <InvestigationCardView hierarchy={hierarchy} />
        </TabPanel>
      )}

      {currentTab === 'dataset' && (
        <TabPanel value={currentTab} index={'dataset'}>
          <DatasetCardView hierarchy={hierarchy} />
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

const mapStateToProps = (state: StateType): SearchCardViewStoreProps => {
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
): SearchCardViewDispatchProps => ({
  setCurrentTab: (newValue: string) => dispatch(setCurrentTab(newValue)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchPageCardView);
