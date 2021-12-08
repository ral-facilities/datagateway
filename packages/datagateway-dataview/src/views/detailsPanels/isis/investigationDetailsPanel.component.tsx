import React from 'react';
import {
  Entity,
  Investigation,
  useInvestigationDetails,
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
  Link as MuiLink,
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

interface InvestigationDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
  viewDatasets?: (id: number) => void;
}

const InvestigationDetailsPanel = (
  props: InvestigationDetailsPanelProps
): React.ReactElement => {
  const { rowData, viewDatasets, detailsPanelResize } = props;
  const [value, setValue] = React.useState<
    'details' | 'users' | 'samples' | 'publications'
  >('details');

  const [t] = useTranslation();

  const classes = useStyles();

  const { data } = useInvestigationDetails(rowData.id);
  const investigationData: Investigation = {
    ...data,
    ...(rowData as Investigation),
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
          {investigationData.studyInvestigations &&
            investigationData.studyInvestigations.map((studyInvestigation) => {
              if (studyInvestigation.study) {
                return (
                  <Grid key={studyInvestigation.id} item xs>
                    <Typography variant="overline">
                      {t('investigations.details.pid')}
                    </Typography>
                    <Typography>
                      <MuiLink
                        href={`https://doi.org/${studyInvestigation.study.pid}`}
                        data-testid="investigation-details-panel-pid-link"
                      >
                        {studyInvestigation.study.pid}
                      </MuiLink>
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
              {investigationData.doi && investigationData.doi !== 'null' ? (
                <MuiLink
                  href={`https://doi.org/${investigationData.doi}`}
                  data-testid="investigation-details-panel-doi-link"
                >
                  {investigationData.doi}
                </MuiLink>
              ) : (
                <b>{`${t('investigations.details.doi')} not provided`}</b>
              )}
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
            <Typography variant="overline">
              {investigationData.samples.length <= 1
                ? t('investigations.details.samples.name')
                : t('investigations.details.samples.name') + 's'}
            </Typography>
            {investigationData.samples.map((sample) => {
              return (
                <Grid key={sample.id} item xs>
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
            {investigationData.publications.length > 0 ? (
              <Typography variant="overline">
                {investigationData.publications.length <= 1
                  ? t('investigations.details.publications.reference')
                  : t('investigations.details.publications.reference') + 's'}
              </Typography>
              investigationData.publications.map((publication) => {
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
              })
            ) : (
              <Typography data-testid="visit-details-panel-no-publications">
                {t('investigations.details.publications.no_publications')}
              </Typography>
            )}
          </Grid>
        </div>
      )}
    </div>
  );
};

export default InvestigationDetailsPanel;
