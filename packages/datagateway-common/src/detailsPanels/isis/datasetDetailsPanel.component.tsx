import React from 'react';
import { Typography, Grid, Divider, Tabs, Tab, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDatasetDetails } from '../../api/datasets';
import { Dataset, Entity } from '../../app.types';

const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface DatasetDetailsPanelProps {
  rowData: Entity;
  detailsPanelResize?: () => void;
  viewDatafiles?: (id: number) => void;
}

const DatasetDetailsPanel = (
  props: DatasetDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize, viewDatafiles } = props;
  const [value, setValue] = React.useState<'details' | 'type'>('details');
  const [t] = useTranslation();

  const { data } = useDatasetDetails(rowData.id);
  const datasetData: Dataset = { ...data, ...(rowData as Dataset) };

  React.useLayoutEffect(() => {
    if (detailsPanelResize) detailsPanelResize();
  }, [value, detailsPanelResize]);

  return (
    <div id="details-panel" style={{ minWidth: 0 }}>
      <Tabs
        variant="scrollable"
        textColor="secondary"
        indicatorColor="secondary"
        scrollButtons="auto"
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        aria-label={t('datasets.details.tabs_label')}
      >
        <Tab
          id="dataset-details-tab"
          aria-controls="dataset-details-panel"
          label={t('datasets.details.label')}
          value="details"
        />
        {datasetData.type && (
          <Tab
            id="dataset-type-tab"
            aria-controls="dataset-type-panel"
            label={t('datasets.details.type.label')}
            value="type"
          />
        )}
        {viewDatafiles && (
          <Tab
            id="dataset-datafiles-tab"
            label={t('datasets.details.datafiles')}
            onClick={() => viewDatafiles(datasetData.id)}
          />
        )}
      </Tabs>
      <div
        id="dataset-details-panel"
        aria-labelledby="dataset-details-tab"
        role="tabpanel"
        hidden={value !== 'details'}
      >
        <StyledGrid container direction="column">
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
        </StyledGrid>
      </div>
      {datasetData.type && (
        <div
          id="dataset-type-panel"
          aria-labelledby="dataset-type-tab"
          role="tabpanel"
          hidden={value !== 'type'}
        >
          <StyledGrid container direction="column">
            <Grid item xs>
              <Typography variant="h6">
                <b>{datasetData.type.name}</b>
              </Typography>
              <StyledDivider />
            </Grid>
            <Grid item xs>
              <Typography variant="overline">
                {t('datasets.details.type.description')}
              </Typography>
              <Typography>
                <b>
                  {datasetData.type?.description &&
                  datasetData.type?.description !== 'null'
                    ? datasetData.type.description
                    : `${t('datasets.details.type.description')} not provided`}
                </b>
              </Typography>
            </Grid>
          </StyledGrid>
        </div>
      )}
    </div>
  );
};

export default DatasetDetailsPanel;
