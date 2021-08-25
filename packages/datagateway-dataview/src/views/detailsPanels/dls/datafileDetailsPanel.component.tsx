import React from 'react';
import {
  Entity,
  Datafile,
  useDatafileDetails,
  formatBytes,
} from 'datagateway-common';
import {
  Typography,
  Grid,
  createStyles,
  makeStyles,
  Theme,
  Divider,
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
  detailsPanelResize?: () => void;
}

const DatafileDetailsPanel = (
  props: DatafileDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize } = props;
  const [t] = useTranslation();
  const classes = useStyles();

  const { data } = useDatafileDetails(rowData.id);
  const datafileData: Datafile = { ...data, ...(rowData as Datafile) };

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [detailsPanelResize]);

  return (
    <div id="details-panel" style={{ minWidth: 0 }}>
      <Grid
        id="details-panel"
        container
        className={classes.root}
        direction="column"
      >
        <Grid item xs>
          <Typography variant="h6">
            <b>{datafileData.name}</b>
          </Typography>
          <Divider className={classes.divider} />
        </Grid>
        <Grid item xs>
          <Typography variant="overline">
            {t('datafiles.details.size')}
          </Typography>
          <Typography>
            <b>{formatBytes(datafileData.fileSize)}</b>
          </Typography>
        </Grid>
        <Grid item xs>
          <Typography variant="overline">
            {t('datafiles.details.location')}
          </Typography>
          <Typography>
            <b>{datafileData.location}</b>
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default DatafileDetailsPanel;
