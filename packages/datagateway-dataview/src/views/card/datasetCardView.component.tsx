import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';
import {
  addToCart,
  Dataset,
  datasetLink,
  DateColumnFilter,
  DateFilter,
  DownloadCartItem,
  Entity,
  fetchDatasetCount,
  fetchDatasets,
  Filter,
  FiltersType,
  pushPageFilter,
  removeFromCart,
  TextColumnFilter,
} from 'datagateway-common';
import { StateType } from 'datagateway-common/lib/state/app.types';
import React from 'react';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import CardView from './cardView.component';

interface DatasetCVDispatchProps {
  fetchData: (
    investigationId: number,
    offsetParams?: IndexRange
  ) => Promise<void>;
  fetchCount: (investigationId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
}

interface DatasetCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
  filters: FiltersType;
}

interface DatasetCardViewProps {
  investigationId: string;
}

type DatasetCVCombinedProps = DatasetCardViewProps &
  DatasetCVDispatchProps &
  DatasetCVStateProps;

const DatasetCardView = (props: DatasetCVCombinedProps): React.ReactElement => {
  const {
    investigationId,
    data,
    totalDataCount,
    cartItems,
    fetchData,
    fetchCount,
    addToCart,
    removeFromCart,
    pushFilters,
    filters,
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
      // onChange={(value: string) => filterTable(dataKey, value ? value : null)}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        // filterTable(dataKey, value)
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  React.useEffect(() => {
    // TODO: React.useMemo?
    setDatasetIds(data.map((dataset) => dataset.ID));

    // Fetch the dataset count based on the investigation ID.
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
        content: (dataset: Dataset) => {
          return datasetLink(investigationId, dataset.ID, dataset.NAME);
        },
        filterComponent: textFilter,
      }}
      description={{
        label: 'Description',
        dataKey: 'DESCRIPTION',
        filterComponent: textFilter,
      }}
      information={[
        {
          label: 'Datafile Count',
          dataKey: 'DATAFILE_COUNT',
        },
        {
          label: 'Created Time',
          dataKey: 'CREATE_TIME',
          filterComponent: dateFilter,
        },
        {
          label: 'Modified Time',
          dataKey: 'MOD_TIME',
          filterComponent: dateFilter,
        },
      ]}
      // TODO: Can we make defining buttons more cleaner?
      //       Move button to a different component.
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
      ]}
    />
  );
};

const mapStateToProps = (state: StateType): DatasetCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
    filters: state.dgcommon.filters,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DatasetCVDispatchProps => ({
  fetchData: (investigationId: number, offsetParams?: IndexRange) =>
    dispatch(fetchDatasets({ investigationId, offsetParams })),
  fetchCount: (investigationId: number) =>
    dispatch(fetchDatasetCount(investigationId)),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DatasetCardView);
