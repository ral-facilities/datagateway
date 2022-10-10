import React from 'react';
import { Typography, Grid, Divider, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Dataset, Entity } from '../app.types';

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface DatasetDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
}

const DatasetDetailsPanel = (
  props: DatasetDetailsPanelProps
): React.ReactElement => {
  const { detailsPanelResize } = props;

  const [t] = useTranslation();
  const datasetData = props.rowData as Dataset;

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [detailsPanelResize]);

  return (
    <StyledGrid
      data-testid="dataset-details-panel"
      id="details-panel"
      container
      direction="column"
    >
      <Grid item xs>
        <Typography variant="h6">
          <b>{datasetData.name}</b>
        </Typography>{' '}
        T
        <StyledDivider />
      </Grid>
      <Grid item xs>
        <Typography variant="overline">{t('datasets.description')}</Typography>
        <Typography>
          <b>{datasetData.description}</b>
        </Typography>
      </Grid>
    </StyledGrid>
  );
};

export default DatasetDetailsPanel;
