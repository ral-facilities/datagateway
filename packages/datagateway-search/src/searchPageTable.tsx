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
interface SearchTableStoreProps {
  requestReceived: boolean;
  datafile: number[];
  dataset: number[];
  investigation: number[];
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
  props: SearchTableStoreProps & SearchTableDispatchProps
): React.ReactElement => {
  const {
    requestReceived,
    investigation,
    dataset,
    datafile,
    investigationTab,
    datasetTab,
    datafileTab,
    currentTab,
    setCurrentTab,
  } = props;
  const [t] = useTranslation();

  useEffect(() => {
    let newState = 'none';
    if (investigationTab) {
      newState = 'investigation';
    } else if (datasetTab) {
      newState = 'dataset';
    } else if (datafileTab) {
      newState = 'datafile';
    }
    setCurrentTab(newState);
  }, [setCurrentTab, investigationTab, datasetTab, datafileTab]);

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: string
  ): void => {
    setCurrentTab(newValue);
  };

  const badgeDigits = (length: number): 3 | 2 | 1 => {
    return length >= 100 ? 3 : length >= 10 ? 2 : 1;
  };

  if (requestReceived) {
    return (
      <div>
        <AppBar position="static">
          <Tabs
            value={currentTab}
            onChange={handleChange}
            aria-label={t('searchPageTable.tabs_arialabel')}
          >
            {investigationTab ? (
              <Tab
                label={
                  <StyledBadge
                    id="investigation-badge"
                    badgeContent={investigation.length}
                    showZero
                  >
                    <span
                      style={{
                        paddingRight: '1ch',
                        marginRight: `calc(0.5 * ${badgeDigits(
                          investigation.length
                        )}ch + 6px)`,
                        marginLeft: `calc(-0.5 * ${badgeDigits(
                          investigation.length
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
            ) : null}
            {datasetTab ? (
              <Tab
                label={
                  <StyledBadge
                    id="dataset-badge"
                    badgeContent={dataset.length}
                    showZero
                  >
                    <span
                      style={{
                        paddingRight: '1ch',
                        marginRight: `calc(0.5 * ${badgeDigits(
                          dataset.length
                        )}ch + 6px)`,
                        marginLeft: `calc(-0.5 * ${badgeDigits(
                          dataset.length
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
            ) : null}
            {datafileTab ? (
              <Tab
                label={
                  <StyledBadge
                    id="datafile-badge"
                    badgeContent={datafile.length}
                    showZero
                  >
                    <span
                      style={{
                        paddingRight: '1ch',
                        marginRight: `calc(0.5 * ${badgeDigits(
                          datafile.length
                        )}ch + 6px)`,
                        marginLeft: `calc(-0.5 * ${badgeDigits(
                          datafile.length
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
            ) : null}
          </Tabs>
        </AppBar>

        {investigationTab ? (
          <TabPanel value={currentTab} index={'investigation'}>
            <Paper
              style={{
                height: 'calc(75vh)',
              }}
              elevation={0}
            >
              <InvestigationSearchTable />
            </Paper>
          </TabPanel>
        ) : null}
        {datasetTab ? (
          <TabPanel value={currentTab} index={'dataset'}>
            <Paper
              style={{
                height: 'calc(75vh)',
              }}
              elevation={0}
            >
              <DatasetSearchTable />
            </Paper>
          </TabPanel>
        ) : null}
        {datafileTab ? (
          <TabPanel value={currentTab} index={'datafile'}>
            <Paper
              style={{
                height: 'calc(75vh)',
              }}
              elevation={0}
            >
              <DatafileSearchTable />
            </Paper>
          </TabPanel>
        ) : null}
      </div>
    );
  } else
    return (
      <Box color="secondary.main" px={3} py={1}>
        <h2>{t('searchPageTable.header')}</h2>
        {t('searchPageTable.text')}
      </Box>
    );
};

const mapStateToProps = (state: StateType): SearchTableStoreProps => {
  return {
    requestReceived: state.dgsearch.requestReceived,
    datafile: state.dgsearch.searchData.datafile,
    dataset: state.dgsearch.searchData.dataset,
    investigation: state.dgsearch.searchData.investigation,
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
