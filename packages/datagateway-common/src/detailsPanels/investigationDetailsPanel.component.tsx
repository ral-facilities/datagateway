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
import { Entity, Investigation } from '../app.types';

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

interface InvestigationDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
}

const InvestigationDetailsPanel = (
  props: InvestigationDetailsPanelProps
): React.ReactElement => {
  const { detailsPanelResize } = props;

  const classes = useStyles();
  const [t] = useTranslation();
  const investigationData = props.rowData as Investigation;

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
          <b>{investigationData.title}</b>
        </Typography>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item xs>
        <Typography variant="overline">
          {t('investigations.details.name')}
        </Typography>
        <Typography>
          <b>{investigationData.name}</b>
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography variant="overline">
          {t('investigations.details.start_date')}
        </Typography>
        <Typography>
          <b>
            {investigationData.startDate
              ? new Date(investigationData.startDate).toLocaleDateString()
              : investigationData.startDate}
          </b>
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography variant="overline">
          {t('investigations.details.end_date')}
        </Typography>
        <Typography>
          <b>
            {investigationData.endDate
              ? new Date(investigationData.endDate).toLocaleDateString()
              : investigationData.endDate}
          </b>
        </Typography>
      </Grid>
    </Grid>
  );
};

export default InvestigationDetailsPanel;
