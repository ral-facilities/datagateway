import React from 'react';
import { Typography, Grid, Divider, Tabs, Tab, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useDatasetDetails } from '../../api';
import { Dataset, Entity } from '../../app.types';
import type { IsisDatasetDetailsPanelChangeTabPayload } from '../../state/actions/actions.types';
import { IsisDatasetDetailsPanelChangeTabType } from '../../state/actions/actions.types';
import type { StateType } from '../../state/app.types';
import type { Action } from '../../state/reducers/createReducer';

const DEFAULT_TAB: IsisDatasetDetailsPanelTab = 'details';

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

/**
 * Available tabs in the ISIS dataset details panel.
 */
export type IsisDatasetDetailsPanelTab = 'details' | 'type' | 'view';

const DatasetDetailsPanel = (
  props: DatasetDetailsPanelProps
): React.ReactElement => {
  const { rowData, detailsPanelResize, viewDatafiles } = props;

  const [t] = useTranslation();
  const { data } = useDatasetDetails(rowData.id);
  const datasetData: Dataset = { ...data, ...(rowData as Dataset) };
  const selectedTab = useSelector<
    StateType,
    IsisDatasetDetailsPanelTab | undefined
  >(
    (state) =>
      data && state.dgcommon.isisDatasetDetailsPanel[data.id]?.selectedTab
  );
  const dispatch = useDispatch();

  const changeTab = React.useCallback(
    (newTab: IsisDatasetDetailsPanelTab) => {
      const id = data?.id;
      // we don't want the view datafiles tab to be selected
      // because it only acts as a button to the datafile table and should not be selectable
      if (id && newTab !== 'view') {
        dispatch<Action>({
          type: IsisDatasetDetailsPanelChangeTabType,
          payload: {
            newTab,
            datasetId: id,
          } as IsisDatasetDetailsPanelChangeTabPayload,
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
    <div
      data-testid="dataset-details-panel"
      id="details-panel"
      style={{ minWidth: 0 }}
    >
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
        {viewDatafiles && (
          <Tab
            id="dataset-datafiles-tab"
            label={t('datasets.details.datafiles')}
            onClick={() => viewDatafiles(datasetData.id)}
            value="view"
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
