import React from 'react';
import {
  AppBar,
  Badge,
  badgeClasses,
  Box,
  Paper,
  styled,
  Tab,
  Tabs,
  tabsClasses,
} from '@mui/material';
import {
  CartProps,
  parseSearchToQuery,
  useDatafileCount,
  useDatasetCount,
  useInvestigationCount,
  useLuceneSearch,
  useUpdateQueryParam,
  ViewCartButton,
  ViewsType,
} from 'datagateway-common';
import {
  getFilters,
  getSorts,
  storeFilters,
  storeSort,
} from './searchPageContainer.component';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { StateType } from './state/app.types';
import InvestigationSearchTable from './table/investigationSearchTable.component';
import InvestigationCardView from './card/investigationSearchCardView.component';
import DatafileSearchTable from './table/datafileSearchTable.component';
import DatasetCardView from './card/datasetSearchCardView.component';
import DatasetSearchTable from './table/datasetSearchTable.component';

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

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const replaceFilters = useUpdateQueryParam('filters', 'replace');
  const replaceSorts = useUpdateQueryParam('sort', 'replace');

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void => {
    storeFilters(filters, currentTab);
    storeSort(sort, currentTab);

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

  const { data: investigationDataCount } = useInvestigationCount(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: investigation || [] },
        }),
      },
    ],
    getFilters('investigation') ?? {},
    currentTab
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
    getFilters('dataset') ?? {},
    currentTab
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
    getFilters('datafile') ?? {},
    currentTab
  );

  return (
    <div>
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
                        {investigationDataCount ?? 0}
                      </span>
                    }
                    showZero
                    max={999}
                  >
                    <span
                      style={{
                        paddingRight: '1ch',
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
                    badgeContent={datasetDataCount ?? 0}
                    showZero
                    max={999}
                  >
                    <span
                      style={{
                        paddingRight: '1ch',
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
                    badgeContent={datafileDataCount ?? 0}
                    showZero
                    max={999}
                  >
                    <span
                      style={{
                        paddingRight: '1ch',
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
    maxNumResults: state.dgsearch.maxNumResults,
    datasetTab: state.dgsearch.tabs.datasetTab,
    datafileTab: state.dgsearch.tabs.datafileTab,
    investigationTab: state.dgsearch.tabs.investigationTab,
  };
};

export default connect(mapStateToProps)(SearchTabs);
