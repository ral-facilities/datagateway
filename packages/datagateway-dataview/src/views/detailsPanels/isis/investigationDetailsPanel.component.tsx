import React from 'react';
import { Entity, Investigation } from 'datagateway-common';
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
import { Action } from 'redux';

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

interface InvestigationDetailsPanelProps {
  rowData: Entity;
  fetchDetails: (investigationId: number) => Promise<void>;
  detailsPanelResize?: () => void;
  viewDatasets?: (id: number) => Action;
}

const InvestigationDetailsPanel = (
  props: InvestigationDetailsPanelProps
): React.ReactElement => {
  const { rowData, fetchDetails, viewDatasets, detailsPanelResize } = props;
  const [value, setValue] = React.useState<
    'details' | 'users' | 'samples' | 'publications'
  >('details');

  const [t] = useTranslation();

  const classes = useStyles();

  const investigationData = rowData as Investigation;

  React.useEffect(() => {
    if (
      !investigationData.investigationUsers ||
      !investigationData.samples ||
      !investigationData.publications
    ) {
      fetchDetails(investigationData.id);
    }
  }, [
    investigationData.investigationUsers,
    investigationData.samples,
    investigationData.publications,
    investigationData.id,
    fetchDetails,
  ]);

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
          id="investigation-details-tab"
          aria-controls="investigation-details-panel"
          label={t('investigations.details.label')}
          value="details"
        />
        {investigationData.investigationUsers && (
          <Tab
            id="investigation-users-tab"
            aria-controls="investigation-users-panel"
            label={t('investigations.details.users.label')}
            value="users"
          />
        )}
        {investigationData.samples && (
          <Tab
            id="investigation-samples-tab"
            aria-controls="investigation-samples-panel"
            label={t('investigations.details.samples.label')}
            value="samples"
          />
        )}
        {investigationData.publications && (
          <Tab
            id="investigation-publications-tab"
            aria-controls="investigation-publications-panel"
            label={t('investigations.details.publications.label')}
            value="publications"
          />
        )}
        {viewDatasets && (
          <Tab
            id="investigation-datasets-tab"
            label={t('investigations.details.datasets')}
            onClick={() => viewDatasets(investigationData.id)}
          />
        )}
      </Tabs>
      <div
        id="investigation-details-panel"
        aria-labelledby="investigation-details-tab"
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
              {t('investigations.details.visitId')}
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
                  : t('entity_card.no_description')}
              </b>
            </Typography>
          </Grid>
          {investigationData.studyInvestigations &&
            investigationData.studyInvestigations.map((studyInvestigation) => {
              if (studyInvestigation.study) {
                return (
                  <Grid key={studyInvestigation.id} item xs>
                    <Typography variant="overline">
                      {t('investigations.details.pid')}
                    </Typography>
                    <Typography>
                      <Link
                        href={`https://doi.org/${studyInvestigation.study.pid}`}
                      >
                        {studyInvestigation.study.pid}
                      </Link>
                    </Typography>
                  </Grid>
                );
              } else {
                return null;
              }
            })}
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.doi')}
            </Typography>
            <Typography>
              <b>{investigationData.doi}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.start_date')}
            </Typography>
            <Typography>
              <b>{investigationData.startDate}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('investigations.details.end_date')}
            </Typography>
            <Typography>
              <b>{investigationData.endDate}</b>
            </Typography>
          </Grid>
        </Grid>
      </div>
      {investigationData.investigationUsers && (
        <div
          id="investigation-users-panel"
          aria-labelledby="investigation-users-tab"
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
          id="investigation-samples-panel"
          aria-labelledby="investigation-samples-tab"
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
          id="investigation-publications-panel"
          aria-labelledby="investigation-publications-tab"
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

export default InvestigationDetailsPanel;
