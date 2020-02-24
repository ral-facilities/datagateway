import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { StateType } from './state/app.types';
import { connect } from 'react-redux';

import { Switch, Route, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

// import InvestigationSearchTable from './table/investigationSearchTable.component';
// import DatasetTable from './table/datasetTable.component';
import DatafileSearchTable from './table/datafileSearchTable.component';

interface SearchTableStoreProps {
  requestSent: boolean;
  luceneDatafile: any;
  luceneDataset: any;
  luceneInvestigation: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const SearchPageTable = (props: SearchTableStoreProps): any => {
  const {
    requestSent,
    luceneDatafile,
    luceneDataset,
    luceneInvestigation,
  } = props;
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  if (props.requestSent) {
    return (
      <div>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="simple tabs example"
          >
            <Tab label="Datafile" {...a11yProps(0)} />
            <Tab label="Dataset" {...a11yProps(1)} />
            <Tab label="Investigation" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          {/* <DatafileSearchTable /> */}
          <DatafileSearchTable />
        </TabPanel>
        <TabPanel value={value} index={1}>
          Dataset table goes here
        </TabPanel>
        <TabPanel value={value} index={2}>
          Investigation table goes here
        </TabPanel>
      </div>
    );
  } else
    return (
      <Box color="primary.main">
        <h1>Search</h1>Fill out form to the left and then click search.
      </Box>
    );
};
// };

const mapStateToProps = (state: StateType): SearchTableStoreProps => {
  return {
    requestSent: state.dgsearch.requestSent,
    luceneDataset: state.dgsearch.searchData.dataset,
    luceneDatafile: state.dgsearch.searchData.datafile,
    luceneInvestigation: state.dgsearch.searchData.investigation,
  };
};

export default connect(mapStateToProps)(SearchPageTable);
