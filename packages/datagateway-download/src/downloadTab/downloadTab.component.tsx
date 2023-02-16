import React from 'react';

import {
  Paper,
  Tabs,
  Typography,
  Box,
  Grid,
  IconButton,
  CircularProgress,
  Theme,
} from '@material-ui/core';
import Tab from '@material-ui/core/Tab';

import DownloadCartTable from '../downloadCart/downloadCartTable.component';
import DownloadStatusTable from '../downloadStatus/downloadStatusTable.component';

import RefreshIcon from '@material-ui/icons/Refresh';
import BlackTooltip from '../tooltip.component';
import { useTranslation } from 'react-i18next';
import { StyleRules, createStyles, withStyles } from '@material-ui/core/styles';

const paperStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
    },
  });

const StyledPaper = withStyles(paperStyles)(Paper);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps): React.ReactElement {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
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
  // Set the initial tab.
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [refreshDownloads, setRefreshDownloads] = React.useState(false);
  const [lastChecked, setLastChecked] = React.useState('');
  const [t] = useTranslation();

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    setTab: number
  ): void => {
    setSelectedTab(setTab);
  };

  return (
    <StyledPaper square>
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        indicatorColor="secondary"
        textColor="secondary"
        centered
      >
        <Tab
          className="tour-download-cart-tab"
          label={t('downloadTab.cart_tab')}
          aria-label={t('downloadTab.cart_tab_arialabel')}
          {...a11yProps(0)}
        />
        <Tab
          className="tour-download-downloads-tab"
          label={t('downloadTab.downloads_tab')}
          aria-label={t('downloadTab.downloads_tab_arialabel')}
          {...a11yProps(1)}
        />
      </Tabs>

      <TabPanel
        value={selectedTab}
        index={0}
        aria-label={t('downloadTab.download_cart_panel_arialabel')}
      >
        {/* Provide a link to the status table for the download confirmation dialog to use */}
        <DownloadCartTable statusTabRedirect={() => setSelectedTab(1)} />
      </TabPanel>

      <TabPanel
        value={selectedTab}
        index={1}
        aria-label={t('downloadTab.download_status_panel_arialabel')}
      >
        <Grid container spacing={1}>
          {/* Place the last updated time above the table. */}
          <Grid
            item
            xs={12}
            aria-label={t('downloadTab.last_updated_time_arialabel')}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                float: 'right',
              }}
            >
              {/* Show refresh icon and re-populate the download status table. */}
              {!refreshDownloads ? (
                <BlackTooltip title="Refresh Downloads" enterDelay={500}>
                  <IconButton
                    color="secondary"
                    aria-label={t(
                      'downloadTab.refresh_download_status_arialabel'
                    )}
                    onClick={() => setRefreshDownloads(true)}
                  >
                    <RefreshIcon />
                  </IconButton>
                </BlackTooltip>
              ) : (
                <CircularProgress size={20} />
              )}

              <Typography variant="subtitle1" component="h3">
                {!refreshDownloads ? (
                  <p style={{ paddingLeft: '10px ' }}>
                    <b>{t('downloadTab.last_checked')}: </b> {lastChecked}
                  </p>
                ) : (
                  <p style={{ paddingLeft: '20px ' }}>
                    <i>{t('downloadTab.refreshing_downloads')}</i>
                  </p>
                )}
              </Typography>
            </div>
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
    </StyledPaper>
  );
};

export default DownloadTabs;
