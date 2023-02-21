import {
  Button,
  Divider,
  Grid,
  styled,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useDatasetDetails, useDatasetSize } from '../../api';
import { Dataset, Entity } from '../../app.types';
import {
  DlsDatasetDetailsPanelChangeTabPayload,
  DlsDatasetDetailsPanelChangeTabType,
} from '../../state/actions/actions.types';
import { StateType } from '../../state/app.types';
import { Action } from '../../state/reducers/createReducer';
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

const DEFAULT_TAB: DlsDatasetDetailsPanelTab = 'details';

export type DlsDatasetDetailsPanelTab = 'details' | 'type';

const DatasetDetailsPanel = (
  props: DatasetDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize } = props;
  const [t] = useTranslation();
  const { data } = useDatasetDetails(rowData.id);
  const { data: size, refetch: fetchSize } = useDatasetSize(rowData.id);
  const datasetData: Dataset = {
    ...data,
    ...(rowData as Dataset),
    size,
  };
  const selectedTab = useSelector<
    StateType,
    DlsDatasetDetailsPanelTab | undefined
  >(
    (state) =>
      data && state.dgcommon.dlsDatasetDetailsPanel[data.id]?.selectedTab
  );
  const dispatch = useDispatch();

  const changeTab = React.useCallback(
    (newTab: DlsDatasetDetailsPanelTab) => {
      const id = data?.id;
      if (id) {
        dispatch<Action>({
          type: DlsDatasetDetailsPanelChangeTabType,
          payload: {
            newTab,
            datasetId: id,
          } as DlsDatasetDetailsPanelChangeTabPayload,
        });
      }
    },
    [data?.id, dispatch]
  );

  React.useLayoutEffect(() => {
    if (detailsPanelResize && selectedTab) detailsPanelResize();
  }, [selectedTab, detailsPanelResize]);

  React.useEffect(() => {
    if (data && !selectedTab) {
      // register the selected tab for this dataset's details panel
      // for the first time.
      // go to the default tab on first render
      changeTab(DEFAULT_TAB);
    }
  }, [data, selectedTab, changeTab]);

  return (
    <div id="details-panel" style={{ minWidth: 0 }}>
      <Tabs
        variant="scrollable"
        textColor="secondary"
        indicatorColor="secondary"
        scrollButtons="auto"
        value={selectedTab ?? DEFAULT_TAB}
        onChange={(event, newValue) => changeTab(newValue)}
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
      </Tabs>
      <div
        id="dataset-details-panel"
        aria-labelledby="dataset-details-tab"
        role="tabpanel"
        hidden={selectedTab !== 'details'}
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
          <Grid item xs>
            <Typography variant="overline">
              {t('datasets.details.start_date')}
            </Typography>
            <Typography>
              <b>
                {datasetData.startDate && datasetData.startDate !== 'null'
                  ? datasetData.startDate
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
                  ? datasetData.endDate
                  : `${t('datasets.details.end_date')} not provided`}
              </b>
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="overline">
              {t('datasets.details.size')}
            </Typography>
            <Typography>
              <b>
                {datasetData.size !== undefined ? (
                  formatBytes(datasetData.size)
                ) : (
                  <Button
                    onClick={() => {
                      fetchSize();
                    }}
                    variant="outlined"
                    color="secondary"
                    size="small"
                    id="calculate-size-btn"
                    role="button"
                  >
                    {t('datasets.details.calculate')}
                  </Button>
                )}
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
          hidden={selectedTab !== 'type'}
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
