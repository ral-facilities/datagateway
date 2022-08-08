import React from 'react';
import {
  Typography,
  Grid,
  Divider,
  Tabs,
  Tab,
  Link as MuiLink,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useInvestigationDetails } from '../../api';
import { Entity, Investigation } from '../../app.types';
import type { IsisInvestigationDetailsPanelChangeTabPayload } from '../../state/actions/actions.types';
import { IsisInvestigationDetailsPanelChangeTabType } from '../../state/actions/actions.types';
import type { StateType } from '../../state/app.types';
import type { Action } from '../../state/reducers/createReducer';

const DEFAULT_TAB: IsisInvestigationDetailsPanelTab = 'details';

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface InvestigationDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
  viewDatasets?: (id: number) => void;
}

/**
 * Available tabs for the ISIS investigation details panel.
 */
export type IsisInvestigationDetailsPanelTab =
  | 'details'
  | 'users'
  | 'samples'
  | 'publications';

const InvestigationDetailsPanel = (
  props: InvestigationDetailsPanelProps
): React.ReactElement => {
  const { rowData, viewDatasets, detailsPanelResize } = props;

  const [t] = useTranslation();
  const { data } = useInvestigationDetails(rowData.id);
  const investigationData: Investigation = {
    ...data,
    ...(rowData as Investigation),
  };
  const selectedTab = useSelector<
    StateType,
    IsisInvestigationDetailsPanelTab | undefined
  >(
    (state) =>
      data && state.dgcommon.isisInvestigationDetailsPanel[data.id]?.selectedTab
  );
  const dispatch = useDispatch();

  const changeTab = React.useCallback(
    (newTab: IsisInvestigationDetailsPanelTab) => {
      const id = data?.id;
      if (id) {
        dispatch<Action>({
          type: IsisInvestigationDetailsPanelChangeTabType,
          payload: {
            newTab,
            investigationId: id,
          } as IsisInvestigationDetailsPanelChangeTabPayload,
        });
      }
    },
    [data?.id, dispatch]
  );

  React.useLayoutEffect(() => {
    if (detailsPanelResize && selectedTab) detailsPanelResize();
  }, [selectedTab, detailsPanelResize]);

  React.useEffect(() => {
    if (data && !selectedTab) {
      // register the selected tab for this investigation's details panel
      // for the first time.
      // go to the default tab on first render
      changeTab(DEFAULT_TAB);
    }
  }, [data, selectedTab, changeTab]);

  return (
    <div id="details-panel" style={{ minWidth: 0 }}>
      <Tabs
        variant="scrollable"
        textColor="secondary"
        indicatorColor="secondary"
        scrollButtons="auto"
        value={selectedTab ?? DEFAULT_TAB}
        onChange={(event, newValue) => changeTab(newValue)}
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
        hidden={selectedTab !== 'details'}
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
        </StyledGrid>
      </div>
      {investigationData.investigationUsers && (
        <div
          id="investigation-users-panel"
          aria-labelledby="investigation-users-tab"
          role="tabpanel"
          hidden={selectedTab !== 'users'}
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
              <Typography data-testid="investigation-details-panel-no-name">
                <b>{t('investigations.details.users.no_name')}</b>
              </Typography>
            )}
          </StyledGrid>
        </div>
      )}
      {investigationData.samples && (
        <div
          id="investigation-samples-panel"
          aria-labelledby="investigation-samples-tab"
          role="tabpanel"
          hidden={selectedTab !== 'samples'}
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
              <Typography data-testid="n">
                <b>{t('investigations.details.samples.no_samples')}</b>
              </Typography>
            )}
          </StyledGrid>
        </div>
      )}
      {investigationData.publications && (
        <div
          id="investigation-publications-panel"
          aria-labelledby="investigation-publications-tab"
          role="tabpanel"
          hidden={selectedTab !== 'publications'}
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
              <Typography data-testid="investigation-details-panel-no-publications">
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

export default InvestigationDetailsPanel;
