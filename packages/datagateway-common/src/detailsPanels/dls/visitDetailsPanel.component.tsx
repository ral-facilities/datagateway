import React from 'react';
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
import { formatBytes } from '../../table/cellRenderers/cellContentRenderers';
import {
  useInvestigationDetails,
  useInvestigationSize,
} from '../../api/investigations';
import { Entity, Investigation } from '../../app.types';

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
    'details' | 'users' | 'samples' | 'publications' | 'parameters'
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
        {investigationData.parameters && (
          <Tab
            id="visit-parameters-tab"
            aria-controls="visit-parameters-panel"
            label={t('investigations.details.parameters.label')}
            value="parameters"
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
                  ? new Date(investigationData.startDate).toLocaleDateString()
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
                  ? new Date(investigationData.endDate).toLocaleDateString()
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
                {investigationData.size !== undefined ? (
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
            <Typography variant="overline">
              {t('investigations.details.users.name', {
                count: investigationData.investigationUsers.length,
              })}
            </Typography>
            {investigationData.investigationUsers.length > 0 ? (
              investigationData.investigationUsers.map((investigationUser) => {
                if (investigationUser.user) {
                  return (
                    <Grid key={investigationUser.user.id} item xs>
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
              })
            ) : (
              <Typography data-testid="visit-details-panel-no-name">
                <b>{t('investigations.details.users.no_name')}</b>
              </Typography>
            )}
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
            <Typography variant="overline">
              {t('investigations.details.samples.name', {
                count: investigationData.samples.length,
              })}
            </Typography>
            {investigationData.samples.length > 0 ? (
              investigationData.samples.map((sample) => {
                return (
                  <Grid key={sample.id} item xs>
                    <Typography>
                      {sample.type?.name ? `${sample.type.name}: ` : ''}
                      <b>{sample.name}</b>
                    </Typography>
                  </Grid>
                );
              })
            ) : (
              <Typography data-testid="visit-details-panel-no-samples">
                <b>{t('investigations.details.samples.no_samples')}</b>
              </Typography>
            )}
          </Grid>
        </div>
      )}
      {investigationData.parameters && (
        <div
          id="investigation-parameters-panel"
          aria-labelledby="investigation-parameters-tab"
          role="tabpanel"
          hidden={value !== 'parameters'}
        >
          <Grid
            id="parameter-grid"
            container
            className={classes.root}
            direction="column"
          >
            {investigationData.parameters.length > 0 ? (
              investigationData.parameters.map((parameter) => {
                if (parameter.type) {
                  switch (parameter.type.valueType) {
                    case 'STRING':
                      return (
                        <Grid key={parameter.id} item xs>
                          <Typography variant="overline">
                            {parameter.type.name}
                          </Typography>
                          <Typography>
                            <b>{parameter.stringValue}</b>
                          </Typography>
                        </Grid>
                      );
                    case 'NUMERIC':
                      return (
                        <Grid key={parameter.id} item xs>
                          <Typography variant="overline">
                            {parameter.type.name}
                          </Typography>
                          <Typography>
                            <b>{parameter.numericValue}</b>{' '}
                            {parameter.type.units}
                          </Typography>
                        </Grid>
                      );
                    case 'DATE_AND_TIME':
                      return (
                        <Grid key={parameter.id} item xs>
                          <Typography variant="overline">
                            {parameter.type.name}
                          </Typography>
                          <Typography>
                            <b>
                              {parameter.dateTimeValue &&
                                parameter.dateTimeValue.split(' ')[0]}
                            </b>
                          </Typography>
                        </Grid>
                      );
                    default:
                      return null;
                  }
                } else {
                  return null;
                }
              })
            ) : (
              <Typography data-testid="investigation-details-panel-no-parameters">
                <b>{t('investigations.details.parameters.no_parameters')}</b>
              </Typography>
            )}
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
            <Typography variant="overline">
              {t('investigations.details.publications.reference', {
                count: investigationData.publications.length,
              })}
            </Typography>
            {investigationData.publications.length > 0 ? (
              investigationData.publications.map((publication) => {
                return (
                  <Grid key={publication.id} item xs>
                    <Typography>
                      <b>{publication.fullReference}</b>
                    </Typography>
                  </Grid>
                );
              })
            ) : (
              <Typography data-testid="visit-details-panel-no-publications">
                <b>
                  {t('investigations.details.publications.no_publications')}
                </b>
              </Typography>
            )}
          </Grid>
        </div>
      )}
    </div>
  );
};

export default VisitDetailsPanel;
