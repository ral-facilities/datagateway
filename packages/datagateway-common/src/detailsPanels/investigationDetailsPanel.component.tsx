import React from 'react';
import { Typography, Grid, Divider, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Entity, Investigation } from '../app.types';

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface InvestigationDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
}

const InvestigationDetailsPanel = (
  props: InvestigationDetailsPanelProps
): React.ReactElement => {
  const { detailsPanelResize } = props;

  const [t] = useTranslation();
  const investigationData = props.rowData as Investigation;

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [detailsPanelResize]);

  return (
    <StyledGrid
      data-testid="investigation-details-panel"
      id="details-panel"
      container
      direction="column"
    >
      <Grid item xs>
        <Typography variant="h6">
          <b>{investigationData.title}</b>
        </Typography>
        <StyledDivider />
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
          <b>{investigationData.startDate}</b>
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography variant="overline">
          {t('investigations.details.end_date')}
        </Typography>
        <Typography>
          <b>{investigationData.endDate}</b>
        </Typography>
      </Grid>
    </StyledGrid>
  );
};

export default InvestigationDetailsPanel;
