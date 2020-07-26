import React from 'react';
import { Entity, Instrument } from 'datagateway-common';
import { Typography, Tabs, Tab, Link } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface InstrumentDetailsPanelProps {
  rowData: Entity;
  fetchDetails: (instrumentId: number) => Promise<void>;
  detailsPanelResize?: () => void;
}

const InstrumentDetailsPanel = (
  props: InstrumentDetailsPanelProps
): React.ReactElement => {
  const { rowData, fetchDetails, detailsPanelResize } = props;
  const [value, setValue] = React.useState<'details' | 'users'>('details');
  const [t] = useTranslation();

  const instrumentData = rowData as Instrument;

  React.useEffect(() => {
    if (!instrumentData.INSTRUMENTSCIENTIST) {
      fetchDetails(instrumentData.ID);
    }
  }, [instrumentData.INSTRUMENTSCIENTIST, instrumentData.ID, fetchDetails]);

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [value, detailsPanelResize]);

  return (
    <div>
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        aria-label={t('instruments.details.tabs_label')}
      >
        <Tab
          id="instrument-details-tab"
          aria-controls="instrument-details-panel"
          label={t('instruments.details.label')}
          value="details"
        />
        {instrumentData.INSTRUMENTSCIENTIST && (
          <Tab
            id="instrument-users-tab"
            aria-controls="instrument-users-panel"
            label={t('instruments.details.instrument_scientists.label')}
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
          <b>{t('instruments.details.name')}:</b> {instrumentData.FULLNAME}
        </Typography>
        <Typography variant="body2">
          <b>{t('instruments.details.description')}:</b>{' '}
          {instrumentData.DESCRIPTION}
        </Typography>
        <Typography variant="body2">
          <b>{t('instruments.details.type')}:</b> {instrumentData.TYPE}
        </Typography>
        {instrumentData.URL && (
          <Typography variant="body2">
            <b>{t('instruments.details.url')}:</b>{' '}
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
          {instrumentData.INSTRUMENTSCIENTIST.map((instrumentScientist) => {
            if (instrumentScientist.USER_) {
              return (
                <Typography key={instrumentScientist.USER_ID} variant="body2">
                  <b>{t('instruments.details.instrument_scientists.name')}:</b>{' '}
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
