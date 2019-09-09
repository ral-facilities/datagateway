import React from 'react';
import { Entity, Instrument } from 'datagateway-common';
import { Typography, Tabs, Tab, Link } from '@material-ui/core';

interface InstrumentDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize: () => void;
  fetchDetails: (instrumentId: number) => Promise<void>;
}

const InstrumentDetailsPanel = (
  props: InstrumentDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize, fetchDetails } = props;
  const [value, setValue] = React.useState<'details' | 'users'>('details');

  const instrumentData = rowData as Instrument;

  React.useEffect(() => {
    if (!instrumentData.INSTRUMENTSCIENTIST) {
      fetchDetails(instrumentData.ID);
    }
  }, [instrumentData, fetchDetails]);

  React.useLayoutEffect(() => {
    detailsPanelResize();
  }, [value, detailsPanelResize]);

  return (
    <div>
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        aria-label="instrument-details-tabs"
      >
        <Tab
          id="instrument-details-tab"
          aria-controls="instrument-details-panel"
          label="Instrument Details"
          value="details"
        />
        {instrumentData.INSTRUMENTSCIENTIST && (
          <Tab
            id="instrument-users-tab"
            aria-controls="instrument-users-panel"
            label="Instrument Scientists"
            value="users"
          />
        )}
      </Tabs>
      <div
        id="instrument-details-panel"
        aria-labelledby="instrument-details-tab"
        role="tabpanel"
        hidden={value !== 'details'}
      >
        <Typography variant="body2">
          <b>Name:</b> {instrumentData.FULLNAME}
        </Typography>
        <Typography variant="body2">
          <b>Description:</b> {instrumentData.DESCRIPTION}
        </Typography>
        <Typography variant="body2">
          <b>Type:</b> {instrumentData.TYPE}
        </Typography>
        {instrumentData.URL && (
          <Typography variant="body2">
            <b>URL:</b>{' '}
            <Link href={instrumentData.URL}>{instrumentData.URL}</Link>
          </Typography>
        )}
      </div>
      {instrumentData.INSTRUMENTSCIENTIST && (
        <div
          id="instrument-users-panel"
          aria-labelledby="instrument-users-tab"
          role="tabpanel"
          hidden={value !== 'users'}
        >
          {instrumentData.INSTRUMENTSCIENTIST.map(instrumentScientist => {
            if (instrumentScientist.USER_) {
              return (
                <Typography key={instrumentScientist.USER_ID} variant="body2">
                  <b>Name:</b>{' '}
                  {instrumentScientist.USER_.FULL_NAME ||
                    instrumentScientist.USER_.NAME}
                </Typography>
              );
            } else {
              return null;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default InstrumentDetailsPanel;
