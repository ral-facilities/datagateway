import React from 'react';
import { Entity, Investigation, formatBytes } from 'datagateway-common';
import { Typography, Tabs, Tab, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

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
    <div>
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
        <Typography variant="body2">
          <b>{t('investigations.details.name')}:</b> {investigationData.NAME}
        </Typography>
        <Typography variant="body2">
          <b>{t('investigations.details.visit_id')}:</b>{' '}
          {investigationData.VISIT_ID}
        </Typography>
        <Typography variant="body2">
          <b>{t('investigations.details.title')}:</b> {investigationData.TITLE}
        </Typography>
        <Typography variant="body2">
          <b>{t('investigations.details.summary')}:</b>{' '}
          {investigationData.SUMMARY}
        </Typography>
        <Typography variant="body2">
          <b>{t('investigations.details.start_date')}:</b>{' '}
          {investigationData.STARTDATE}
        </Typography>
        <Typography variant="body2">
          <b>{t('investigations.details.end_date')}:</b>{' '}
          {investigationData.ENDDATE}
        </Typography>
        <Typography variant="body2">
          <b>{t('investigations.details.size')}:</b>{' '}
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
        </Typography>
      </div>
      {investigationData.INVESTIGATIONUSER && (
        <div
          id="visit-users-panel"
          aria-labelledby="visit-users-tab"
          role="tabpanel"
          hidden={value !== 'users'}
        >
          {investigationData.INVESTIGATIONUSER.map((investigationUser) => {
            if (investigationUser.USER_) {
              return (
                <Typography key={investigationUser.USER_ID} variant="body2">
                  <b>{t('investigations.details.users.name')}:</b>{' '}
                  {investigationUser.USER_.FULL_NAME ||
                    investigationUser.USER_.NAME}
                </Typography>
              );
            } else {
              return null;
            }
          })}
        </div>
      )}
      {investigationData.SAMPLE && (
        <div
          id="visit-samples-panel"
          aria-labelledby="visit-samples-tab"
          role="tabpanel"
          hidden={value !== 'samples'}
        >
          {investigationData.SAMPLE.map((sample) => {
            return (
              <Typography key={sample.ID} variant="body2">
                <b>{t('investigations.details.samples.name')}:</b> {sample.NAME}
              </Typography>
            );
          })}
        </div>
      )}
      {investigationData.PUBLICATION && (
        <div
          id="visit-publications-panel"
          aria-labelledby="visit-publications-tab"
          role="tabpanel"
          hidden={value !== 'publications'}
        >
          {investigationData.PUBLICATION.map((publication) => {
            return (
              <Typography key={publication.ID} variant="body2">
                <b>{t('investigations.details.publications.reference')}:</b>{' '}
                {publication.FULLREFERENCE}
              </Typography>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisitDetailsPanel;
