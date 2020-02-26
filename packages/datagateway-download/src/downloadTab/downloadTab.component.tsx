import React from 'react';

import {
  makeStyles,
  Paper,
  Tabs,
  Typography,
  Box,
  Grid,
  IconButton,
  CircularProgress,
} from '@material-ui/core';
import Tab from '@material-ui/core/Tab';

import DownloadCartTable from '../downloadCart/downloadCartTable.component';
import DownloadStatusTable from '../downloadStatus/downloadStatusTable.component';

import RefreshIcon from '@material-ui/icons/Refresh';
import BlackTooltip from '../tooltip.component';

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
    // TODO: Should be div or Box? Not a typography component?
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

  // Setting the selected tab in session storage is required
  // as the selected tab information is lost with each re-render
  // (e.g. opening/closing the navigation drawer).
  const getTab = (): number => {
    let savedTab = sessionStorage.getItem('downloadStatusTab');
    // console.log('Saved tab in sessionStorage: ', savedTab);

    // If the tab has not been saved, then set it to the initial cart view (0).
    if (!savedTab) sessionStorage.setItem('downloadStatusTab', '0');
    else return parseInt(savedTab);

    return 0;
  };

  // Set the initial tab.
  const [selectedTab, setSelectedTab] = React.useState(getTab());
  const [refreshDownloads, setRefreshDownloads] = React.useState(false);
  const [lastChecked, setLastChecked] = React.useState('');

  // TODO: We are not using the event here?
  const handleChange = (event: React.ChangeEvent<{}>, setTab: number): void => {
    // Set the tab in the session storage.
    sessionStorage.setItem('downloadStatusTab', setTab.toString());
    setSelectedTab(setTab);
  };

  // console.log('Refresh status: ', refreshDownloads);

  return (
    <Paper className={classes.root}>
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Cart" aria-label="Cart tab" {...a11yProps(0)} />
        <Tab label="Downloads" aria-label="Downloads tab" {...a11yProps(1)} />
      </Tabs>

      <TabPanel value={selectedTab} index={0} aria-label="Download cart panel">
        {/* Provide a link to the status table for the download confirmation dialog to use */}
        <DownloadCartTable statusLink={() => setSelectedTab(1)} />
      </TabPanel>

      <TabPanel
        value={selectedTab}
        index={1}
        aria-label="Download status panel"
      >
        <Grid container spacing={1}>
          {/* Place the last updated time above the table. */}
          <Grid item xs={12} aria-label="Last updated time">
            <Typography
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                float: 'right',
              }}
              variant="subtitle1"
              component="h3"
            >
              {/* Show refresh icon and re-populate the download status table. */}
              {!refreshDownloads ? (
                <BlackTooltip title="Refresh Downloads" enterDelay={500}>
                  <IconButton
                    color="secondary"
                    aria-label="Refresh download status table"
                    onClick={() => setRefreshDownloads(true)}
                  >
                    <RefreshIcon />
                  </IconButton>
                </BlackTooltip>
              ) : (
                <CircularProgress size={20} />
              )}

              {!refreshDownloads ? (
                <p style={{ paddingLeft: '10px ' }}>
                  <b>Last checked: </b> {lastChecked}
                </p>
              ) : (
                <p style={{ paddingLeft: '20px ' }}>
                  <i>Refreshing downloads...</i>
                </p>
              )}
            </Typography>
          </Grid>

          <Grid item xs>
            <DownloadStatusTable
              refreshTable={refreshDownloads}
              setRefreshTable={setRefreshDownloads}
              setLastChecked={() => setLastChecked(new Date().toLocaleString())}
            />
          </Grid>
        </Grid>
      </TabPanel>
    </Paper>
  );
};

export default DownloadTabs;
