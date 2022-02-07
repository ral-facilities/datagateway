import React from 'react';
import {
  Typography,
  Grid,
  createStyles,
  makeStyles,
  Theme,
  Divider,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Datafile, Entity } from '../app.types';
import { formatBytes } from '../table/cellRenderers/cellContentRenderers';

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
  const { detailsPanelResize } = props;

  const classes = useStyles();
  const [t] = useTranslation();
  const datafileData = props.rowData as Datafile;

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [detailsPanelResize]);

  return (
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
        <Typography variant="overline">{t('datafiles.size')}</Typography>
        <Typography>
          <b>{formatBytes(datafileData.fileSize)}</b>
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography variant="overline">{t('datafiles.location')}</Typography>
        <Typography>
          <b>{datafileData.location}</b>
        </Typography>
      </Grid>
    </Grid>
  );
};

export default DatafileDetailsPanel;
