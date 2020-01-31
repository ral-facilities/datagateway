import React from 'react';

import {
  makeStyles,
  Paper,
  Tabs,
  Typography,
  Box,
  Grid,
  IconButton,
} from '@material-ui/core';
import Tab from '@material-ui/core/Tab';

import DownloadCartTable from './downloadCart/downloadCartTable.component';
import DownloadStatusTable from './downloadStatus/downloadStatusTable.component';

import RefreshIcon from '@material-ui/icons/Refresh';
import BlackTooltip from './tooltip.component';

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
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  // TODO: Needs a function that can be passed to the cart component and
  //       to the modal in order to move from cart to status page.
  // const tabActions = React.useRef<TabsActions>();
  // const handleRerender = useCallback(event => {
  //   console.log('Caught inside Tabs: ', event);
  //   const action = (event as CustomEvent).detail;
  //   if (action.type === 'scigateway:api:plugin_rerender') {
  //     if (tabActions.current) {
  //       tabActions.current.updateIndicator();
  //       console.log('test');
  //     }
  //   }
  // }, []);

  // React.useEffect(() => {
  //   document.addEventListener('scigateway', handleRerender);

  //   return () => {
  //     document.removeEventListener('scigateway', handleRerender);
  //   };
  // }, [handleRerender]);

  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: number
  ): void => {
    setValue(newValue);
  };

  return (
    <Paper className={classes.root}>
      <Tabs
        // action={tabActions}
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
        {/* Provide a link to the status table for the download confirmation dialog to use */}
        <DownloadCartTable statusLink={() => setValue(1)} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={1}>
          {/* Place the last updated time above the table. */}
          <Grid item xs={12} aria-label="Last updated time">
            <Typography
              style={{
                display: 'flex',
                alignItems: 'center',
                float: 'right',
              }}
              variant="subtitle1"
              component="h3"
            >
              {/* // TODO: Make this icon clickable and refresh the tab/page to show updated status table. */}
              <BlackTooltip title="Refresh Downloads" enterDelay={250}>
                <IconButton
                  color="secondary"
                  aria-label="Refresh download status table"
                  style={{ paddingLeft: '10px' }}
                >
                  <RefreshIcon />
                </IconButton>
              </BlackTooltip>

              <p>
                <i>Last checked: </i> {new Date().toLocaleString()}
              </p>
            </Typography>
          </Grid>

          <Grid item xs aria-label="Download status table">
            <DownloadStatusTable />
          </Grid>
        </Grid>
      </TabPanel>
    </Paper>
  );
};

export default DownloadTabs;
