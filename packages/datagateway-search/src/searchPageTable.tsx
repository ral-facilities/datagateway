import React, { useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import { Paper } from '@material-ui/core';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';
import InvestigationSearchTable from './table/investigationSearchTable.component';
import DatasetSearchTable from './table/datasetSearchTable.component';
import DatafileSearchTable from './table/datafileSearchTable.component';

interface SearchTableStoreProps {
  requestReceived: boolean;
  datafile: number[];
  dataset: number[];
  investigation: number[];
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

// eslint-disable-next-line
const SearchPageTable = (props: SearchTableStoreProps): React.ReactElement => {
  let [value, setValue] = React.useState('investigation');

  useEffect(() => {
    let newState = 'investigation';
    if (!props.investigationTab) {
      if (props.datasetTab) {
        newState = 'dataset';
      } else {
        if (props.datafileTab) {
          newState = 'datafile';
        } else {
          newState = 'none';
        }
      }
    }
    setValue(newState);
  }, [props.investigationTab, props.datasetTab, props.datafileTab]);

  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: string
  ): void => {
    setValue(newValue);
  };

  if (props.requestReceived) {
    return (
      <div>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="simple tabs example"
          >
            {props.investigationTab ? (
              <Tab
                label="Investigation"
                value="investigation"
                {...a11yProps('investigation')}
              />
            ) : null}
            {props.datasetTab ? (
              <Tab label="Dataset" value="dataset" {...a11yProps('dataset')} />
            ) : null}
            {props.datafileTab ? (
              <Tab
                label="Datafile"
                value="datafile"
                {...a11yProps('datafile')}
              />
            ) : null}
          </Tabs>
        </AppBar>

        {props.investigationTab ? (
          <TabPanel value={value} index={'investigation'}>
            <Paper
              style={{
                height: 'calc(80vh)',
                width: 'calc(70vw)',
              }}
              elevation={0}
            >
              <InvestigationSearchTable />
            </Paper>
          </TabPanel>
        ) : null}
        {props.datasetTab ? (
          <TabPanel value={value} index={'dataset'}>
            <Paper
              style={{
                height: 'calc(80vh)',
                width: 'calc(70vw)',
              }}
              elevation={0}
            >
              <DatasetSearchTable />
            </Paper>
          </TabPanel>
        ) : null}
        {props.datafileTab ? (
          <TabPanel value={value} index={'datafile'}>
            <Paper
              style={{
                height: 'calc(80vh)',
                width: 'calc(70vw)',
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
      <Box color="primary.main" px={3} py={1}>
        <h2>Search</h2>
        Fill out form to the left and then click search.
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
  };
};

export default connect(mapStateToProps)(SearchPageTable);
