import React from 'react';

import CardView from '../cardView.component';
import { IndexRange } from 'react-virtualized';
import {
  Entity,
  DownloadCartItem,
  fetchDatasets,
  fetchDatasetDetails,
  downloadDataset,
  fetchDatasetCount,
  addToCart,
  removeFromCart,
  Dataset,
  tableLink,
  formatBytes,
  FiltersType,
  TextColumnFilter,
  DateColumnFilter,
  DateFilter,
  Filter,
  pushPageFilter,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
  GetApp,
} from '@material-ui/icons';
import DatasetDetailsPanel from '../../detailsPanels/isis/datasetDetailsPanel.component';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatasetCVDispatchProps {
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  fetchDetails: (datasetId: number) => Promise<void>;
  downloadData: (datasetId: number, name: string) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatasetCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
  filters: FiltersType;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatasetCardViewProps {
  instrumentId: string;
  facilityCycleId: string;
  investigationId: string;
}

type ISISDatasetCVCombinedProps = ISISDatasetCVDispatchProps &
  ISISDatasetCVStateProps &
  ISISDatasetCardViewProps;

const ISISDatasetsCardView = (
  props: ISISDatasetCVCombinedProps
): React.ReactElement => {
  const {
    instrumentId,
    facilityCycleId,
    investigationId,
    data,
    totalDataCount,
    cartItems,
    fetchData,
    fetchCount,
    fetchDetails,
    addToCart,
    removeFromCart,
    downloadData,
    filters,
    pushFilters,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [datasetIds, setDatasetIds] = React.useState<number[]>([]);

  const selectedCards = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'dataset' &&
            datasetIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, datasetIds]
  );

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as string}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  React.useEffect(() => {
    setDatasetIds(data.map((dataset) => dataset.ID));

    if (!fetchedCount) {
      fetchCount(parseInt(investigationId));
      setFetchedCount(true);
    }
  }, [investigationId, data, fetchedCount, fetchCount]);

  return (
    <CardView
      data={data}
      loadData={(params) => fetchData(parseInt(investigationId), params)}
      loadCount={() => fetchCount(parseInt(investigationId))}
      totalDataCount={totalDataCount}
      title={{
        label: 'Name',
        dataKey: 'NAME',
        content: (dataset: Dataset) =>
          tableLink(
            `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset/${dataset.ID}/datafile`,
            dataset.NAME
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: 'Description',
        dataKey: 'DESCRIPTION',
        filterComponent: textFilter,
      }}
      information={[
        {
          label: 'Size',
          dataKey: 'SIZE',
          content: (dataset: Dataset) => formatBytes(dataset.SIZE),
          disableSort: true,
        },
        {
          label: 'Create Time',
          dataKey: 'CREATE_TIME',
          filterComponent: dateFilter,
        },
        {
          label: 'Modified Time',
          dataKey: 'MOD_TIME',
          filterComponent: dateFilter,
        },
      ]}
      moreInformation={(dataset: Dataset) => (
        <DatasetDetailsPanel rowData={dataset} fetchDetails={fetchDetails} />
      )}
      buttons={[
        function cartButton(dataset: Dataset) {
          return !(selectedCards && selectedCards.includes(dataset.ID)) ? (
            <Button
              id="add-to-cart-btn"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineOutlined />}
              disableElevation
              onClick={() => addToCart([dataset.ID])}
            >
              Add to cart
            </Button>
          ) : (
            <Button
              id="remove-from-cart-btn"
              variant="contained"
              color="secondary"
              startIcon={<RemoveCircleOutlineOutlined />}
              disableElevation
              onClick={() => {
                if (selectedCards && selectedCards.includes(dataset.ID))
                  removeFromCart([dataset.ID]);
              }}
            >
              Remove from cart
            </Button>
          );
        },
        function downloadButton(dataset: Dataset) {
          return (
            <Button
              id="download-btn"
              variant="outlined"
              aria-label="Download"
              key="download"
              color="primary"
              startIcon={<GetApp />}
              disableElevation
              onClick={() => downloadData(dataset.ID, dataset.NAME)}
            >
              Download
            </Button>
          );
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISDatasetCVDispatchProps => ({
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(
      fetchDatasets({
        investigationId,
        offsetParams,
        optionalParams: { getSize: true },
      })
    ),
  fetchCount: (investigationId: number) =>
    dispatch(fetchDatasetCount(investigationId)),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
  downloadData: (datasetId: number, name: string) =>
    dispatch(downloadDataset(datasetId, name)),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

const mapStateToProps = (state: StateType): ISISDatasetCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
    filters: state.dgcommon.filters,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISDatasetsCardView);
