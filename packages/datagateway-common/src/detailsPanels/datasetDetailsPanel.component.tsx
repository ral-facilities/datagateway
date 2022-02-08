import React from 'react';
import { Typography, Grid, Theme, Divider } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from 'react-i18next';
import { Dataset, Entity } from '../app.types';

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

interface DatasetDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
}

const DatasetDetailsPanel = (
  props: DatasetDetailsPanelProps
): React.ReactElement => {
  const { detailsPanelResize } = props;

  const classes = useStyles();
  const [t] = useTranslation();
  const datasetData = props.rowData as Dataset;

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
          <b>{datasetData.name}</b>
        </Typography>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item xs>
        <Typography variant="overline">{t('datasets.description')}</Typography>
        <Typography>
          <b>{datasetData.description}</b>
        </Typography>
      </Grid>
    </Grid>
  );
};

export default DatasetDetailsPanel;
