import React from 'react';
import { Entity, Investigation, formatBytes } from 'datagateway-common';
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

interface VisitDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize: () => void;
  fetchDetails: (investigationId: number) => Promise<void>;
  fetchSize: (datasetId: number) => Promise<void>;
}

const VisitDetailsPanel = (
  props: VisitDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize, fetchDetails, fetchSize } = props;
  const [value, setValue] = React.useState<
    'details' | 'users' | 'samples' | 'publications'
  >('details');
  const [t] = useTranslation();

  const classes = useStyles();

  const investigationData = rowData as Investigation;

  React.useEffect(() => {
    if (
      !investigationData.INVESTIGATIONUSER ||
      !investigationData.SAMPLE ||
      !investigationData.PUBLICATION
    ) {
      fetchDetails(investigationData.ID);
    }
  }, [
    investigationData.INVESTIGATIONUSER,
    investigationData.SAMPLE,
    investigationData.PUBLICATION,
    investigationData.ID,
    fetchDetails,
  ]);

  React.useLayoutEffect(() => {
    detailsPanelResize();
  }, [value, detailsPanelResize]);

  return (
    <div id="details-panel">
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        aria-label={t('investigations.details.tabs_label')}
      >
        <Tab
          id="visit-details-tab"
          aria-controls="visit-details-panel"
          label={t('investigations.details.label')}
          value="details"
        />
        {investigationData.INVESTIGATIONUSER && (
          <Tab
            id="visit-users-tab"
            aria-controls="visit-users-panel"
            label={t('investigations.details.users.label')}
            value="users"
          />
        )}
        {investigationData.SAMPLE && (
          <Tab
            id="visit-samples-tab"
            aria-controls="visit-samples-panel"
            label={t('investigations.details.samples.label')}
            value="samples"
          />
        )}
        {investigationData.PUBLICATION && (
          <Tab
            id="visit-publications-tab"
            aria-controls="visit-publications-panel"
            label={t('investigations.details.publications.label')}
            value="publications"
          />
        )}
      </Tabs>
      <div
        id="visit-details-panel"
        aria-labelledby="visit-details-tab"
        role="tabpanel"
        hidden={value !== 'details'}
      >
        <Grid container className={classes.root} direction="column">
          <Grid item xs>
            <Typography variant="h6">
              <b>{investigationData.NAME}</b>
            </Typography>
            <Divider className={classes.divider} />
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.title')}
            </Typography>
            <Typography>
              <b>{investigationData.TITLE}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.visit_id')}
            </Typography>
            <Typography>
              <b>{investigationData.VISIT_ID}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.summary')}
            </Typography>
            <Typography>
              <b>{investigationData.SUMMARY}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.start_date')}
            </Typography>
            <Typography>
              <b>{investigationData.STARTDATE}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.end_date')}
            </Typography>
            <Typography>
              <b>{investigationData.ENDDATE}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.size')}
            </Typography>
            <Typography>
              <b>
                {investigationData.SIZE ? (
                  formatBytes(investigationData.SIZE)
                ) : (
                  <Button
                    onClick={() => {
                      fetchSize(investigationData.ID);
                    }}
                    variant="outlined"
                    color="primary"
                    size="small"
                    id="calculate-size-btn"
                  >
                    {t('investigations.details.calculate')}
                  </Button>
                )}
              </b>
            </Typography>
          </Grid>
        </Grid>
      </div>
      {investigationData.INVESTIGATIONUSER && (
        <div
          id="visit-users-panel"
          aria-labelledby="visit-users-tab"
          role="tabpanel"
          hidden={value !== 'users'}
        >
          <Grid container className={classes.root} direction="column">
            {investigationData.INVESTIGATIONUSER.map((investigationUser) => {
              if (investigationUser.USER_) {
                return (
                  <Grid key={investigationUser.USER_ID} item xs>
                    <Typography variant="overline">
                      {t('investigations.details.users.name')}
                    </Typography>
                    <Typography>
                      <b>
                        {investigationUser.USER_.FULL_NAME ||
                          investigationUser.USER_.NAME}
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
      {investigationData.SAMPLE && (
        <div
          id="visit-samples-panel"
          aria-labelledby="visit-samples-tab"
          role="tabpanel"
          hidden={value !== 'samples'}
        >
          <Grid container className={classes.root} direction="column">
            {investigationData.SAMPLE.map((sample) => {
              return (
                <Grid key={sample.ID} item xs>
                  <Typography variant="overline">
                    {t('investigations.details.samples.name')}
                  </Typography>
                  <Typography>
                    <b>{sample.NAME}</b>
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        </div>
      )}
      {investigationData.PUBLICATION && (
        <div
          id="visit-publications-panel"
          aria-labelledby="visit-publications-tab"
          role="tabpanel"
          hidden={value !== 'publications'}
        >
          <Grid container className={classes.root} direction="column">
            {investigationData.PUBLICATION.map((publication) => {
              return (
                <Grid key={publication.ID} item xs>
                  <Typography variant="overline">
                    {t('investigations.details.publications.reference')}
                  </Typography>
                  <Typography>
                    <b>{publication.FULLREFERENCE}</b>
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        </div>
      )}
    </div>
  );
};

export default VisitDetailsPanel;
