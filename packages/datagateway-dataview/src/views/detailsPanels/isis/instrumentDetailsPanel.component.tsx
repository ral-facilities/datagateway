import React from 'react';
import { Entity, Instrument } from 'datagateway-common';
import {
  Typography,
  Grid,
  createStyles,
  makeStyles,
  Theme,
  Divider,
  Tabs,
  Tab,
  Link,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
    divider: {
      marginBottom: theme.spacing(2),
    },
  })
);

interface InstrumentDetailsPanelProps {
  rowData: Entity;
  fetchDetails: (instrumentId: number) => Promise<void>;
  detailsPanelResize?: () => void;
}

const InstrumentDetailsPanel = (
  props: InstrumentDetailsPanelProps
): React.ReactElement => {
  const { rowData, fetchDetails, detailsPanelResize } = props;
  const [value, setValue] = React.useState<'details' | 'users'>('details');
  const [t] = useTranslation();

  const instrumentData = rowData as Instrument;

  const classes = useStyles();

  React.useEffect(() => {
    if (!instrumentData.INSTRUMENTSCIENTIST) {
      fetchDetails(instrumentData.ID);
    }
  }, [instrumentData.INSTRUMENTSCIENTIST, instrumentData.ID, fetchDetails]);

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [value, detailsPanelResize]);

  return (
    <div id="details-panel" style={{ minWidth: 0 }}>
      <Tabs
        variant="scrollable"
        scrollButtons="auto"
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        aria-label={t('instruments.details.tabs_label')}
      >
        <Tab
          id="instrument-details-tab"
          aria-controls="instrument-details-panel"
          label={t('instruments.details.label')}
          value="details"
        />
        {instrumentData.INSTRUMENTSCIENTIST && (
          <Tab
            id="instrument-users-tab"
            aria-controls="instrument-users-panel"
            label={t('instruments.details.instrument_scientists.label')}
            value="users"
          />
        )}
      </Tabs>
      <div
        id="instrument-details-panel"
        aria-labelledby="instrument-details-tab"
        role="tabpanel"
        hidden={value !== 'details'}
      >
        <Grid container className={classes.root} direction="column">
          <Grid item xs>
            <Typography variant="h6">
              <b>{instrumentData.FULLNAME}</b>
            </Typography>
            <Divider className={classes.divider} />
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('instruments.details.description')}
            </Typography>
            <Typography>
              <b>{instrumentData.DESCRIPTION}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('instruments.details.type')}
            </Typography>
            <Typography>
              <b>{instrumentData.TYPE}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('instruments.details.url')}
            </Typography>
            <Typography>
              <b>
                <Link href={instrumentData.URL}>{instrumentData.URL}</Link>
              </b>
            </Typography>
          </Grid>
        </Grid>
      </div>
      {instrumentData.INSTRUMENTSCIENTIST && (
        <div
          id="instrument-users-panel"
          aria-labelledby="instrument-users-tab"
          role="tabpanel"
          hidden={value !== 'users'}
        >
          <Grid container className={classes.root} direction="column">
            {instrumentData.INSTRUMENTSCIENTIST.map((instrumentScientist) => {
              if (instrumentScientist.USER_) {
                return (
                  <Grid key={instrumentScientist.USER_ID} item xs>
                    <Typography variant="overline">
                      {t('instruments.details.instrument_scientists.name')}
                    </Typography>
                    <Typography>
                      <b>
                        {instrumentScientist.USER_.FULL_NAME ||
                          instrumentScientist.USER_.NAME}
                      </b>
                    </Typography>
                  </Grid>
                );
              } else {
                return null;
              }
            })}
          </Grid>
        </div>
      )}
    </div>
  );
};

export default InstrumentDetailsPanel;
