import React from 'react';
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
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
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

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const SearchPageTable = (props: SearchTableStoreProps): any => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
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

            // indicatorColor="primary"
            // textColor="primary"
          >
            <Tab label="Datafile" {...a11yProps(0)} />
            <Tab label="Dataset" {...a11yProps(1)} />
            <Tab label="Investigation" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
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
        <TabPanel value={value} index={1}>
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
        <TabPanel value={value} index={2}>
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
  };
};

export default connect(mapStateToProps)(SearchPageTable);
