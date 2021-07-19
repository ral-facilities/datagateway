import React from 'react';
import { Entity, Datafile } from 'datagateway-common';
import {
  Typography,
  Grid,
  createStyles,
  makeStyles,
  Theme,
  Divider,
  Tabs,
  Tab,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

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

interface DatafileDetailsPanelProps {
  rowData: Entity;
  fetchDetails: (datafileId: number) => Promise<void>;
  detailsPanelResize: () => void;
}

const DatafileDetailsPanel = (
  props: DatafileDetailsPanelProps
): React.ReactElement => {
  const { rowData, fetchDetails, detailsPanelResize } = props;
  const [value, setValue] = React.useState<'details' | 'parameters'>('details');
  const [t] = useTranslation();
  const classes = useStyles();

  const datafileData = rowData as Datafile;

  React.useEffect(() => {
    if (!datafileData.parameters) {
      fetchDetails(datafileData.id);
    }
  }, [datafileData.parameters, datafileData.id, fetchDetails]);

  React.useLayoutEffect(() => {
    detailsPanelResize();
  }, [value, detailsPanelResize]);

  return (
    <div id="details-panel" style={{ minWidth: 0 }}>
      <Tabs
        variant="scrollable"
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
        <Grid container className={classes.root} direction="column">
          <Grid item xs>
            <Typography variant="h6">
              <b>{datafileData.name}</b>
            </Typography>
            <Divider className={classes.divider} />
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
        </Grid>
      </div>
      {datafileData.parameters && (
        <div
          id="datafile-parameters-panel"
          aria-labelledby="datafile-parameters-tab"
          role="tabpanel"
          hidden={value !== 'parameters'}
        >
          <Grid
            id="parameter-grid"
            container
            className={classes.root}
            direction="column"
          >
            {datafileData.parameters.map((parameter) => {
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
                          <b>{parameter.numericValue}</b>
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
            })}
          </Grid>
        </div>
      )}
    </div>
  );
};

export default DatafileDetailsPanel;
