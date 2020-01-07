import React from 'react';

import { makeStyles, Paper, Tabs, Typography, Box } from '@material-ui/core';
import Tab from '@material-ui/core/Tab';

import DownloadCartTable from './downloadCart/downloadCartTable.component';
import DownloadStatusTable from './downloadStatus/downloadStatusTable.component';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps): React.ReactElement {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

function a11yProps(
  index: number
): { id: string; [ariaControls: string]: string } {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const DownloadTabs: React.FC = () => {
  // TODO: Needs a function that can be passed to the cart component and
  //       to the modal in order to move from cart to status page.

  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: number
  ): void => {
    setValue(newValue);
  };

  return (
    <Paper className={classes.root}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Cart" {...a11yProps(0)} />
        <Tab label="Downloads" {...a11yProps(1)} />
      </Tabs>

      <TabPanel value={value} index={0}>
        <DownloadCartTable />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <DownloadStatusTable />
      </TabPanel>
    </Paper>
  );
};

export default DownloadTabs;
