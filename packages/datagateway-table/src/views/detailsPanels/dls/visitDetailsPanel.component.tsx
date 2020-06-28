import React from 'react';
import { Entity, Investigation, formatBytes } from 'datagateway-common';
import { Typography, Tabs, Tab, Button } from '@material-ui/core';

interface VisitDetailsPanelProps {
  rowData: Entity;
  fetchDetails: (investigationId: number) => Promise<void>;
  detailsPanelResize?: () => void;
}

const VisitDetailsPanel = (
  props: VisitDetailsPanelProps
): React.ReactElement => {
  const { rowData, fetchDetails, detailsPanelResize } = props;
  const [value, setValue] = React.useState<
    'details' | 'users' | 'samples' | 'publications'
  >('details');

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
    if (detailsPanelResize) detailsPanelResize();
  }, [value, detailsPanelResize]);

  return (
    <div>
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        aria-label="visit-details-tabs"
      >
        <Tab
          id="visit-details-tab"
          aria-controls="visit-details-panel"
          label="Visit Details"
          value="details"
        />
        {investigationData.INVESTIGATIONUSER && (
          <Tab
            id="visit-users-tab"
            aria-controls="visit-users-panel"
            label="Visit Users"
            value="users"
          />
        )}
        {investigationData.SAMPLE && (
          <Tab
            id="visit-samples-tab"
            aria-controls="visit-samples-panel"
            label="Visit Samples"
            value="samples"
          />
        )}
        {investigationData.PUBLICATION && (
          <Tab
            id="visit-publications-tab"
            aria-controls="visit-publications-panel"
            label="Publications"
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
          <b>Proposal:</b> {investigationData.NAME}
        </Typography>
        <Typography variant="body2">
          <b>Visit Id:</b> {investigationData.VISIT_ID}
        </Typography>
        <Typography variant="body2">
          <b>Title:</b> {investigationData.TITLE}
        </Typography>
        <Typography variant="body2">
          <b>Summary:</b> {investigationData.SUMMARY}
        </Typography>
        <Typography variant="body2">
          <b>Start Date:</b> {investigationData.STARTDATE}
        </Typography>
        <Typography variant="body2">
          <b>Description:</b> {investigationData.ENDDATE}
        </Typography>
        <Typography variant="body2">
          <b>Total File Size:</b>{' '}
          {investigationData.SIZE ? (
            formatBytes(investigationData.SIZE)
          ) : (
            <Button
              onClick={() => {
                // TODO
              }}
              variant="outlined"
              color="primary"
              size="small"
            >
              Calculate
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
          {investigationData.INVESTIGATIONUSER.map(investigationUser => {
            if (investigationUser.USER_) {
              return (
                <Typography key={investigationUser.USER_ID} variant="body2">
                  <b>Investigator:</b>{' '}
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
          {investigationData.SAMPLE.map(sample => {
            return (
              <Typography key={sample.ID} variant="body2">
                <b>Sample:</b> {sample.NAME}
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
          {investigationData.PUBLICATION.map(publication => {
            return (
              <Typography key={publication.ID} variant="body2">
                <b>Reference:</b> {publication.FULLREFERENCE}
              </Typography>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisitDetailsPanel;
