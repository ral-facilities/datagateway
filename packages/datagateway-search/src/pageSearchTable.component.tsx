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

// this is where tabs and checking if a request has been sent is handled

// class PageTable extends React.Component {
//   public render(): React.ReactNode {
//     return <DatafileSearchTable />;
//   }
// }
// export default PageTable;

interface SearchTableStoreProps {
  requestSent: boolean;
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

const PageTable = (props: SearchTableStoreProps): any => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  //   if (this.props.requestSent) {
  return (
    <div>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="Datafiles" {...a11yProps(0)} />
          <Tab label="Item Two" {...a11yProps(1)} />
          <Tab label="Item Three" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <DatafileSearchTable />
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
    </div>
  );
};
// };

const mapStateToProps = (state: StateType): SearchTableStoreProps => {
  return {
    requestSent: state.dgsearch.requestSent,
  };
};

export default connect(mapStateToProps)(PageTable);
