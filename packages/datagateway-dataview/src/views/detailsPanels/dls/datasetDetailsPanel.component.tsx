import React from 'react';
import { Entity, Dataset, formatBytes } from 'datagateway-common';
import {
  Typography,
  Grid,
  createStyles,
  makeStyles,
  Theme,
  Divider,
  Tabs,
  Tab,
  Button,
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

interface DatasetDetailsPanelProps {
  rowData: Entity;
  fetchDetails: (datasetId: number) => Promise<void>;
  detailsPanelResize?: () => void;
  fetchSize: (datasetId: number) => Promise<void>;
}

const DatasetDetailsPanel = (
  props: DatasetDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize, fetchDetails, fetchSize } = props;
  const [value, setValue] = React.useState<'details' | 'type'>('details');
  const [t] = useTranslation();
  const classes = useStyles();

  const datasetData = rowData as Dataset;

  React.useEffect(() => {
    if (!datasetData.type) {
      fetchDetails(datasetData.id);
    }
  }, [datasetData.type, datasetData.id, fetchDetails]);

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
        aria-label={t('datasets.details.tabs_label')}
      >
        <Tab
          id="dataset-details-tab"
          aria-controls="dataset-details-panel"
          label={t('datasets.details.label')}
          value="details"
        />
        {datasetData.type && (
          <Tab
            id="dataset-type-tab"
            aria-controls="dataset-type-panel"
            label={t('datasets.details.type.label')}
            value="type"
          />
        )}
      </Tabs>
      <div
        id="dataset-details-panel"
        aria-labelledby="dataset-details-tab"
        role="tabpanel"
        hidden={value !== 'details'}
      >
        <Grid container className={classes.root} direction="column">
          <Grid item xs>
            <Typography variant="h6">
              <b>{datasetData.name}</b>
            </Typography>
            <Divider className={classes.divider} />
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('datasets.details.description')}
            </Typography>
            <Typography>
              <b>
                {datasetData.description && datasetData.description !== 'null'
                  ? datasetData.description
                  : `${t('datasets.details.description')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('datasets.details.start_date')}
            </Typography>
            <Typography>
              <b>
                {datasetData.startDate && datasetData.startDate !== 'null'
                  ? datasetData.startDate
                  : `${t('datasets.details.start_date')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('datasets.details.end_date')}
            </Typography>
            <Typography>
              <b>
                {datasetData.endDate && datasetData.endDate !== 'null'
                  ? datasetData.endDate
                  : `${t('datasets.details.end_date')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('datasets.details.size')}
            </Typography>
            <Typography>
              <b>
                {datasetData.size ? (
                  formatBytes(datasetData.size)
                ) : (
                  <Button
                    onClick={() => {
                      fetchSize(datasetData.id);
                    }}
                    variant="outlined"
                    color="secondary"
                    size="small"
                    id="calculate-size-btn"
                  >
                    {t('datasets.details.calculate')}
                  </Button>
                )}
              </b>
            </Typography>
          </Grid>
        </Grid>
      </div>
      {datasetData.type && (
        <div
          id="dataset-type-panel"
          aria-labelledby="dataset-type-tab"
          role="tabpanel"
          hidden={value !== 'type'}
        >
          <Grid container className={classes.root} direction="column">
            <Grid item xs>
              <Typography variant="h6">
                <b>{datasetData.type.name}</b>
              </Typography>
              <Divider className={classes.divider} />
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('datasets.details.type.description')}
              </Typography>
              <Typography>
                <b>
                  {datasetData.type?.description &&
                  datasetData.type?.description !== 'null'
                    ? datasetData.type.description
                    : `${t('datasets.details.type.description')} not provided`}
                </b>
              </Typography>
            </Grid>
          </Grid>
        </div>
      )}
    </div>
  );
};

export default DatasetDetailsPanel;
