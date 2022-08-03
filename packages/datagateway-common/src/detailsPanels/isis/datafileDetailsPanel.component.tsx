import React from 'react';
import { Typography, Grid, Divider, Tabs, Tab, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Datafile, Entity } from '../../app.types';
import { useDatafileDetails } from '../../api/datafiles';

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface DatafileDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
}

const DatafileDetailsPanel = (
  props: DatafileDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize } = props;
  const [value, setValue] = React.useState<'details' | 'parameters'>('details');
  const [t] = useTranslation();

  const { data } = useDatafileDetails(rowData.id, [
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        parameters: 'type',
      }),
    },
  ]);
  const datafileData: Datafile = { ...data, ...(rowData as Datafile) };

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [value, detailsPanelResize]);

  return (
    <div id="details-panel" style={{ minWidth: 0 }}>
      <Tabs
        variant="scrollable"
        textColor="secondary"
        indicatorColor="secondary"
        scrollButtons="auto"
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        aria-label={t('datafiles.details.tabs_label')}
      >
        <Tab
          id="datafile-details-tab"
          aria-controls="datafile-details-panel"
          label={t('datafiles.details.label')}
          value="details"
        />
        {datafileData.parameters && (
          <Tab
            id="datafile-parameters-tab"
            aria-controls="datafile-parameters-panel"
            label={t('datafiles.details.parameters.label')}
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
        <StyledGrid container direction="column">
          <Grid item xs>
            <Typography variant="h6">
              <b>{datafileData.name}</b>
            </Typography>
            <StyledDivider />
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('datafiles.details.description')}
            </Typography>
            <Typography>
              <b>
                {datafileData.description && datafileData.description !== 'null'
                  ? datafileData.description
                  : `${t('datafiles.details.description')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('datafiles.details.location')}
            </Typography>
            <Typography>
              <b>
                {datafileData.location && datafileData.location !== 'null'
                  ? datafileData.location
                  : `${t('datafiles.details.location')} not provided`}
              </b>
            </Typography>
          </Grid>
        </StyledGrid>
      </div>
      {datafileData.parameters && (
        <div
          id="datafile-parameters-panel"
          aria-labelledby="datafile-parameters-tab"
          role="tabpanel"
          hidden={value !== 'parameters'}
        >
          <StyledGrid id="parameter-grid" container direction="column">
            {datafileData.parameters.length > 0 ? (
              datafileData.parameters.map((parameter) => {
                if (parameter.type) {
                  switch (parameter.type.valueType) {
                    case 'STRING':
                      return (
                        <Grid key={parameter.id} item xs>
                          <Typography variant="overline">
                            {parameter.type.name}
                          </Typography>
                          <Typography>
                            <b>{parameter.stringValue}</b>{' '}
                            {parameter.type.units}
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
              <Typography data-testid="datafile-details-panel-no-parameters">
                <b>{t('datafiles.details.parameters.no_parameters')}</b>
              </Typography>
            )}
          </StyledGrid>
        </div>
      )}
    </div>
  );
};

export default DatafileDetailsPanel;
