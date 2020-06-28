import React from 'react';
import { Entity, Datafile } from 'datagateway-common';
import { Typography, Tabs, Tab } from '@material-ui/core';

interface DatafileDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize: () => void;
  fetchDetails: (datafileId: number) => Promise<void>;
}

const DatafileDetailsPanel = (
  props: DatafileDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize, fetchDetails } = props;
  const [value, setValue] = React.useState<'details' | 'parameters'>('details');

  const datafileData = rowData as Datafile;

  React.useEffect(() => {
    if (!datafileData.DATAFILEPARAMETER) {
      fetchDetails(datafileData.ID);
    }
  }, [datafileData.DATAFILEPARAMETER, datafileData.ID, fetchDetails]);

  React.useLayoutEffect(() => {
    detailsPanelResize();
  }, [value, detailsPanelResize]);

  return (
    <div>
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        aria-label="datafile-details-tabs"
      >
        <Tab
          id="datafile-details-tab"
          aria-controls="datafile-details-panel"
          label="Datafile Details"
          value="details"
        />
        {datafileData.DATAFILEPARAMETER && (
          <Tab
            id="datafile-parameters-tab"
            aria-controls="datafile-parameters-panel"
            label="Datafile Parameters"
            value="parameters"
          />
        )}
      </Tabs>
      <div
        id="datafile-details-panel"
        aria-labelledby="datafile-details-tab"
        role="tabpanel"
        hidden={value !== 'details'}
      >
        <Typography variant="body2">
          <b>Name:</b> {datafileData.NAME}
        </Typography>
        <Typography variant="body2">
          <b>Description:</b> {datafileData.DESCRIPTION}
        </Typography>
        <Typography variant="body2">
          <b>Location:</b> {datafileData.LOCATION}
        </Typography>
      </div>
      {datafileData.DATAFILEPARAMETER && (
        <div
          id="datafile-parameters-panel"
          aria-labelledby="datafile-parameters-tab"
          role="tabpanel"
          hidden={value !== 'parameters'}
        >
          {datafileData.DATAFILEPARAMETER.map(parameter => {
            if (parameter.PARAMETERTYPE) {
              switch (parameter.PARAMETERTYPE.VALUETYPE) {
                case 'STRING':
                  return (
                    <Typography key={parameter.ID} variant="body2">
                      <b>{parameter.PARAMETERTYPE.NAME}:</b>{' '}
                      {parameter.STRING_VALUE}
                    </Typography>
                  );
                case 'NUMERIC':
                  return (
                    <Typography key={parameter.ID} variant="body2">
                      <b>{parameter.PARAMETERTYPE.NAME}:</b>{' '}
                      {parameter.NUMERIC_VALUE}
                    </Typography>
                  );
                case 'DATE_AND_TIME':
                  return (
                    <Typography key={parameter.ID} variant="body2">
                      <b>{parameter.PARAMETERTYPE.NAME}:</b>{' '}
                      {parameter.DATETIME_VALUE &&
                        parameter.DATETIME_VALUE.split(' ')[0]}
                    </Typography>
                  );
                default:
                  return null;
              }
            } else {
              return null;
            }
          })}
        </div>
      )}
    </div>
  );
};

export default DatafileDetailsPanel;
