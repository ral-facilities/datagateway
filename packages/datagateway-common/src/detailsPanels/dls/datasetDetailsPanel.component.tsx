import { Divider, Grid, styled, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDatasetDetails } from '../../api';
import { Dataset, Entity } from '../../app.types';
import { formatBytes } from '../../table/cellRenderers/cellContentRenderers';

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
  const { rowData, detailsPanelResize } = props;
  const [t] = useTranslation();

  const { data } = useDatasetDetails(rowData.id);
  const datasetData: Dataset = {
    ...data,
    ...(rowData as Dataset),
  };

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [detailsPanelResize]);

  return (
    <div
      data-testid="dls-dataset-details-panel"
      id="details-panel"
      style={{ minWidth: 0 }}
    >
      <StyledGrid id="dataset-details-panel" container direction="column">
        <Grid item xs>
          <Typography variant="h6">
            <b>{datasetData.name}</b>
          </Typography>
          <StyledDivider />
        </Grid>
        <Grid item xs>
          <Typography variant="overline">
            {t('datasets.details.description')}
          </Typography>
          <Typography>
            <b>
              {datasetData.description && datasetData.description !== 'null'
                ? datasetData.description
                : `${t('datasets.details.description')} not provided`}
            </b>
          </Typography>
        </Grid>
        <Grid item xs>
          <Typography variant="overline">
            {t('datasets.details.start_date')}
          </Typography>
          <Typography>
            <b>
              {datasetData.startDate && datasetData.startDate !== 'null'
                ? new Date(datasetData.startDate).toLocaleDateString()
                : `${t('datasets.details.start_date')} not provided`}
            </b>
          </Typography>
        </Grid>
        <Grid item xs>
          <Typography variant="overline">
            {t('datasets.details.end_date')}
          </Typography>
          <Typography>
            <b>
              {datasetData.endDate && datasetData.endDate !== 'null'
                ? new Date(datasetData.endDate).toLocaleDateString()
                : `${t('datasets.details.end_date')} not provided`}
            </b>
          </Typography>
        </Grid>
        <Grid item xs>
          <Typography variant="overline">
            {t('datasets.details.size')}
          </Typography>
          <Typography>
            <b>{formatBytes(datasetData.fileSize)}</b>
          </Typography>
        </Grid>
      </StyledGrid>
    </div>
  );
};

export default DatasetDetailsPanel;
