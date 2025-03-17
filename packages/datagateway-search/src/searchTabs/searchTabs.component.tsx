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
import { CartProps, ViewCartButton, ViewsType } from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useIsFetching } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { StateType } from '../state/app.types';
import InvestigationSearchTable from '../table/investigationSearchTable.component';
import InvestigationCardView from '../card/investigationSearchCardView.component';
import DatafileSearchTable from '../table/datafileSearchTable.component';
import DatasetCardView from '../card/datasetSearchCardView.component';
import DatasetSearchTable from '../table/datasetSearchTable.component';
import SearchTabLabel from './searchTabLabel.component';
import {
  SearchResultCount,
  SearchResultCountDispatch,
  useSearchResultCounts,
} from './useSearchResultCounter';

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
      data-testid={`tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      border={0}
      {...other}
    >
      <Box pt={1}>{children}</Box>
    </Box>
  );
}

function a11yProps(index: string): { id: string; 'aria-controls': string } {
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

  const [searchResultCounts, dispatch] = useSearchResultCounts();

  const isFetchingNum = useIsFetching({
    predicate: (query) =>
      !query.queryHash.includes('InvestigationCount') &&
      !query.queryHash.includes('DatasetCount') &&
      !query.queryHash.includes('DatafileCount'),
  });
  const loading = isFetchingNum > 0;

  function handleChange(
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void {
    onTabChange(newValue);
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
              aria-label={t('tabs.investigation')}
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
              aria-label={t('tabs.dataset')}
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
              aria-label={t('tabs.datafile')}
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
        <TabPanel value={currentTab} index="investigation">
          {view === 'card' ? (
            <InvestigationCardView hierarchy={hierarchy} />
          ) : (
            <Paper
              sx={{
                height: `calc(${containerHeight} - 56px)`,
                minHeight: `calc(500px - 56px)`,
                overflow: 'auto',
                bgcolor: 'background.default',
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
                overflow: 'auto',
                bgcolor: 'background.default',
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
              overflow: 'auto',
              bgcolor: 'background.default',
            }}
            elevation={0}
          >
            <DatafileSearchTable hierarchy={hierarchy} />
          </Paper>
        </TabPanel>
      </SearchResultCountDispatch.Provider>
    </div>
  );
};

export default SearchTabs;
