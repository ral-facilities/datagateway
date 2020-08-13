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
  detailsPanelResize: () => void;
  fetchDetails: (datafileId: number) => Promise<void>;
}

const DatafileDetailsPanel = (
  props: DatafileDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize, fetchDetails } = props;
  const [value, setValue] = React.useState<'details' | 'parameters'>('details');
  const [t] = useTranslation();
  const classes = useStyles();

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
        aria-label={t('datafiles.details.tabs_label')}
      >
        <Tab
          id="datafile-details-tab"
          aria-controls="datafile-details-panel"
          label={t('datafiles.details.label')}
          value="details"
        />
        {datafileData.DATAFILEPARAMETER && (
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
              <b>{datafileData.NAME}</b>
            </Typography>
            <Divider className={classes.divider} />
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('datafiles.details.description')}
            </Typography>
            <Typography>
              <b>{datafileData.DESCRIPTION}</b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('datafiles.details.location')}
            </Typography>
            <Typography>
              <b>{datafileData.LOCATION}</b>
            </Typography>
          </Grid>
        </Grid>
      </div>
      {datafileData.DATAFILEPARAMETER && (
        <div
          id="datafile-parameters-panel"
          aria-labelledby="datafile-parameters-tab"
          role="tabpanel"
          hidden={value !== 'parameters'}
        >
          <Grid container className={classes.root} direction="column">
            {datafileData.DATAFILEPARAMETER.map((parameter) => {
              if (parameter.PARAMETERTYPE) {
                switch (parameter.PARAMETERTYPE.VALUETYPE) {
                  case 'STRING':
                    return (
                      <Grid key={parameter.ID} item xs>
                        <Typography variant="overline">
                          {parameter.PARAMETERTYPE.NAME}
                        </Typography>
                        <Typography>
                          <b>{parameter.STRING_VALUE}</b>
                        </Typography>
                      </Grid>
                    );
                  case 'NUMERIC':
                    return (
                      <Grid key={parameter.ID} item xs>
                        <Typography variant="overline">
                          {parameter.PARAMETERTYPE.NAME}
                        </Typography>
                        <Typography>
                          <b>{parameter.NUMERIC_VALUE}</b>
                        </Typography>
                      </Grid>
                    );
                  case 'DATE_AND_TIME':
                    return (
                      <Grid key={parameter.ID} item xs>
                        <Typography variant="overline">
                          {parameter.PARAMETERTYPE.NAME}
                        </Typography>
                        <Typography>
                          <b>
                            {parameter.DATETIME_VALUE &&
                              parameter.DATETIME_VALUE.split(' ')[0]}
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
