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
import { SelectionAlert, useCart, useLuceneSearch } from 'datagateway-common';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

const badgeStyles = (theme: Theme): StyleRules =>
  createStyles({
    badge: {
      backgroundColor: '#fff',
      color: theme.palette.primary.main,
      fontSize: 'inherit',
      lineHeight: 'inherit',
      top: '0.875em',
    },
  });

interface SearchTableProps {
  containerHeight: string;
  hierarchy: string;
}

interface SearchTableStoreProps {
  searchText: string;
  startDate: MaterialUiPickersDate;
  endDate: MaterialUiPickersDate;
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

const SearchPageTable = (
  props: SearchTableProps & SearchTableStoreProps & SearchTableDispatchProps
): React.ReactElement => {
  const {
    searchText,
    startDate,
    endDate,
    investigationTab,
    datasetTab,
    datafileTab,
    currentTab,
    setCurrentTab,
    containerHeight,
    hierarchy,
  } = props;
  const [t] = useTranslation();

  const { data: investigation } = useLuceneSearch('Investigation', {
    searchText,
    startDate,
    endDate,
  });
  const { data: dataset } = useLuceneSearch('Dataset', {
    searchText,
    startDate,
    endDate,
  });
  const { data: datafile } = useLuceneSearch('Datafile', {
    searchText,
    startDate,
    endDate,
  });

  useEffect(() => {
    if (investigationTab) {
      setCurrentTab('investigation');
    } else if (datasetTab) {
      setCurrentTab('dataset');
    } else if (datafileTab) {
      setCurrentTab('datafile');
    }
  }, [setCurrentTab, investigationTab, datasetTab, datafileTab]);

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void => {
    setCurrentTab(newValue);
  };

  const badgeDigits = (length?: number): 3 | 2 | 1 => {
    return length ? (length >= 100 ? 3 : length >= 10 ? 2 : 1) : 1;
  };

  const { data: cartItems } = useCart();

  return (
    <div>
      <AppBar position="static">
        <Tabs
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
                  badgeContent={investigation?.length ?? 0}
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
                  badgeContent={dataset?.length ?? 0}
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
                  badgeContent={datafile?.length ?? 0}
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
        </Tabs>
      </AppBar>

      <SelectionAlert selectedItems={cartItems ?? []} widthPercent={-1} />

      {investigationTab ? (
        <TabPanel value={currentTab} index={'investigation'}>
          <Paper
            style={{
              height: `calc(${containerHeight} - 96px)`,
              minHeight: 230,
              overflowX: 'auto',
            }}
            elevation={0}
          >
            <InvestigationSearchTable hierarchy={hierarchy} />
          </Paper>
        </TabPanel>
      ) : null}
      {datasetTab ? (
        <TabPanel value={currentTab} index={'dataset'}>
          <Paper
            style={{
              height: `calc(${containerHeight} - 96px)`,
              minHeight: 230,
              overflowX: 'auto',
            }}
            elevation={0}
          >
            <DatasetSearchTable hierarchy={hierarchy} />
          </Paper>
        </TabPanel>
      ) : null}
      {datafileTab ? (
        <TabPanel value={currentTab} index={'datafile'}>
          <Paper
            style={{
              height: `calc(${containerHeight} - 96px)`,
              minHeight: 230,
              overflowX: 'auto',
            }}
            elevation={0}
          >
            <DatafileSearchTable hierarchy={hierarchy} />
          </Paper>
        </TabPanel>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: StateType): SearchTableStoreProps => {
  return {
    searchText: state.dgsearch.searchText,
    startDate: state.dgsearch.selectDate.startDate,
    endDate: state.dgsearch.selectDate.endDate,
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
