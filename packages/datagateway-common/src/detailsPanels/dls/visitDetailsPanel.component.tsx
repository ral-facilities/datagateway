import React from 'react';
import {
  Typography,
  Grid,
  Divider,
  Tabs,
  Tab,
  Button,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatBytes } from '../../table/cellRenderers/cellContentRenderers';
import {
  useInvestigationDetails,
  useInvestigationSize,
} from '../../api/investigations';
import { Entity, Investigation } from '../../app.types';

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

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
        <StyledGrid container direction="column">
          <Grid item xs>
            <Typography variant="h6">
              <b>{investigationData.name}</b>
            </Typography>
            <StyledDivider />
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
        </StyledGrid>
      </div>
      {investigationData.investigationUsers && (
        <div
          id="visit-users-panel"
          aria-labelledby="visit-users-tab"
          role="tabpanel"
          hidden={value !== 'users'}
        >
          <StyledGrid container direction="column">
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
          </StyledGrid>
        </div>
      )}
      {investigationData.samples && (
        <div
          id="visit-samples-panel"
          aria-labelledby="visit-samples-tab"
          role="tabpanel"
          hidden={value !== 'samples'}
        >
          <StyledGrid container direction="column">
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
          </StyledGrid>
        </div>
      )}
      {investigationData.publications && (
        <div
          id="visit-publications-panel"
          aria-labelledby="visit-publications-tab"
          role="tabpanel"
          hidden={value !== 'publications'}
        >
          <StyledGrid container direction="column">
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
          </StyledGrid>
        </div>
      )}
    </div>
  );
};

export default VisitDetailsPanel;
