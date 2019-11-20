import React from 'react';
import { Entity, Investigation } from 'datagateway-common';
import { Typography, Tabs, Tab, Link } from '@material-ui/core';

interface InvestigationDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize: () => void;
  fetchDetails: (investigationId: number) => Promise<void>;
}

const InvestigationDetailsPanel = (
  props: InvestigationDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize, fetchDetails } = props;
  const [value, setValue] = React.useState<
    'details' | 'users' | 'samples' | 'publications'
  >('details');

  const investigationData = rowData as Investigation;

  React.useEffect(() => {
    if (
      !(
        investigationData.INVESTIGATIONUSER ||
        investigationData.SAMPLE ||
        investigationData.PUBLICATION
      )
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
        aria-label="investigation-details-tabs"
      >
        <Tab
          id="investigation-details-tab"
          aria-controls="investigation-details-panel"
          label="Visit Details"
          value="details"
        />
        {investigationData.INVESTIGATIONUSER && (
          <Tab
            id="investigation-users-tab"
            aria-controls="investigation-users-panel"
            label="Visit Users"
            value="users"
          />
        )}
        {investigationData.SAMPLE && (
          <Tab
            id="investigation-samples-tab"
            aria-controls="investigation-samples-panel"
            label="Visit Samples"
            value="samples"
          />
        )}
        {investigationData.PUBLICATION && (
          <Tab
            id="investigation-publications-tab"
            aria-controls="investigation-publications-panel"
            label="Publications"
            value="publications"
          />
        )}
      </Tabs>
      <div
        id="investigation-details-panel"
        aria-labelledby="investigation-details-tab"
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
        {investigationData.STUDYINVESTIGATION &&
          investigationData.STUDYINVESTIGATION.map(studyInvestigation => {
            if (studyInvestigation.STUDY) {
              return (
                <Typography key={studyInvestigation.ID} variant="body2">
                  <b>DOI:</b>{' '}
                  <Link
                    href={`https://doi.org/${studyInvestigation.STUDY.PID}`}
                  >
                    {studyInvestigation.STUDY.PID}
                  </Link>
                </Typography>
              );
            } else {
              return null;
            }
          })}
        <Typography variant="body2">
          <b>Part DOI:</b>{' '}
          <Link href={`https://doi.org/${investigationData.DOI}`}>
            {investigationData.DOI}
          </Link>
        </Typography>
        <Typography variant="body2">
          <b>Start Date:</b> {investigationData.STARTDATE}
        </Typography>
        <Typography variant="body2">
          <b>End Date:</b> {investigationData.ENDDATE}
        </Typography>
      </div>
      {investigationData.INVESTIGATIONUSER && (
        <div
          id="investigation-users-panel"
          aria-labelledby="investigation-users-tab"
          role="tabpanel"
          hidden={value !== 'users'}
        >
          {investigationData.INVESTIGATIONUSER.map(investigationUser => {
            if (investigationUser.USER_) {
              return (
                <Typography key={investigationUser.USER_ID} variant="body2">
                  <b>Name:</b>{' '}
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
          id="investigation-samples-panel"
          aria-labelledby="investigation-samples-tab"
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
          id="investigation-publications-panel"
          aria-labelledby="investigation-publications-tab"
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

export default InvestigationDetailsPanel;
