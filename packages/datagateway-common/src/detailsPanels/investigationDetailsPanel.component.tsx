import React from 'react';
import { Divider, Grid, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Investigation, SearchResultSource } from '../app.types';
import { format } from 'date-fns';

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface InvestigationDetailsPanelProps {
  rowData: Investigation | SearchResultSource;
  detailsPanelResize?: () => void;
}

const InvestigationDetailsPanel = (
  props: InvestigationDetailsPanelProps
): React.ReactElement => {
  const { detailsPanelResize, rowData: investigationData } = props;

  const [t] = useTranslation();

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [detailsPanelResize]);

  function formatInvestigationDate(date?: number | string): string {
    if (!date) return t('app.unknown');
    switch (typeof date) {
      case 'string':
        // assume the date is already formatted when it is a string
        return date;
      case 'number':
        return format(date, 'yyyy-MM-dd HH:mm:ss');
    }
  }

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
          <b>{formatInvestigationDate(investigationData.startDate)}</b>
        </Typography>
      </Grid>
      <Grid item xs>
        <Typography variant="overline">
          {t('investigations.details.end_date')}
        </Typography>
        <Typography>
          <b>{formatInvestigationDate(investigationData.endDate)}</b>
        </Typography>
      </Grid>
    </StyledGrid>
  );
};

export default InvestigationDetailsPanel;
