import React from 'react';
import {
  Entity,
  Investigation,
  formatBytes,
  useInvestigationDetails,
  useInvestigationSize,
} from 'datagateway-common';
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
  detailsPanelResize?: () => void;
}

const VisitDetailsPanel = (
  props: VisitDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize } = props;
  const [value, setValue] = React.useState<
    'details' | 'users' | 'samples' | 'publications'
  >('details');
  const [t] = useTranslation();

  const classes = useStyles();

  const { data } = useInvestigationDetails(rowData.id);
  const { data: size, refetch: fetchSize } = useInvestigationSize(rowData.id);
  const investigationData: Investigation = {
    ...data,
    ...(rowData as Investigation),
    size,
  };

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
        aria-label={t('investigations.details.tabs_label')}
      >
        <Tab
          id="visit-details-tab"
          aria-controls="visit-details-panel"
          label={t('investigations.details.label')}
          value="details"
        />
        {investigationData.investigationUsers && (
          <Tab
            id="visit-users-tab"
            aria-controls="visit-users-panel"
            label={t('investigations.details.users.label')}
            value="users"
          />
        )}
        {investigationData.samples && (
          <Tab
            id="visit-samples-tab"
            aria-controls="visit-samples-panel"
            label={t('investigations.details.samples.label')}
            value="samples"
          />
        )}
        {investigationData.publications && (
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
              <b>{investigationData.name}</b>
            </Typography>
            <Divider className={classes.divider} />
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.title')}
            </Typography>
            <Typography>
              <b>{investigationData.title}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.visit_id')}
            </Typography>
            <Typography>
              <b>{investigationData.visitId}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.summary')}
            </Typography>
            <Typography>
              <b>
                {investigationData.summary &&
                investigationData.summary !== 'null'
                  ? investigationData.summary
                  : `${t('investigations.details.summary')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.start_date')}
            </Typography>
            <Typography>
              <b>
                {investigationData.startDate &&
                investigationData.startDate !== 'null'
                  ? investigationData.startDate
                  : `${t('investigations.details.start_date')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.end_date')}
            </Typography>
            <Typography>
              <b>
                {investigationData.endDate &&
                investigationData.endDate !== 'null'
                  ? investigationData.endDate
                  : `${t('investigations.details.end_date')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.size')}
            </Typography>
            <Typography>
              <b>
                {investigationData.size ? (
                  formatBytes(investigationData.size)
                ) : (
                  <Button
                    onClick={() => {
                      fetchSize();
                    }}
                    variant="outlined"
                    color="secondary"
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
      {investigationData.investigationUsers && (
        <div
          id="visit-users-panel"
          aria-labelledby="visit-users-tab"
          role="tabpanel"
          hidden={value !== 'users'}
        >
          <Grid container className={classes.root} direction="column">
            {investigationData.investigationUsers.map((investigationUser) => {
              if (investigationUser.user) {
                return (
                  <Grid key={investigationUser.user.id} item xs>
                    <Typography variant="overline">
                      {t('investigations.details.users.name')}
                    </Typography>
                    <Typography>
                      <b>
                        {investigationUser.user.fullName ||
                          investigationUser.user.name}
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
      {investigationData.samples && (
        <div
          id="visit-samples-panel"
          aria-labelledby="visit-samples-tab"
          role="tabpanel"
          hidden={value !== 'samples'}
        >
          <Grid container className={classes.root} direction="column">
            {investigationData.samples.map((sample) => {
              return (
                <Grid key={sample.id} item xs>
                  <Typography variant="overline">
                    {t('investigations.details.samples.name')}
                  </Typography>
                  <Typography>
                    <b>{sample.name}</b>
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        </div>
      )}
      {investigationData.publications && (
        <div
          id="visit-publications-panel"
          aria-labelledby="visit-publications-tab"
          role="tabpanel"
          hidden={value !== 'publications'}
        >
          <Grid container className={classes.root} direction="column">
            {investigationData.publications.map((publication) => {
              return (
                <Grid key={publication.id} item xs>
                  <Typography variant="overline">
                    {t('investigations.details.publications.reference')}
                  </Typography>
                  <Typography>
                    <b>{publication.fullReference}</b>
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
