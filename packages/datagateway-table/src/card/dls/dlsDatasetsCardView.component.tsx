import React from 'react';

import CardView from '../cardView.component';
import {
  Entity,
  DownloadCartItem,
  fetchDatasets,
  fetchDatasetCount,
  fetchDatasetDetails,
  addToCart,
  removeFromCart,
  Dataset,
  tableLink,
  fetchFilter,
  // formatBytes,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import {
  StateType,
  FilterDataType,
} from 'datagateway-common/lib/state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';
import { Button } from '@material-ui/core';

interface DLSDatasetsCVProps {
  proposalName: string;
  investigationId: string;
}

interface DLSDatasetsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
  filterData: FilterDataType;
}

interface DLSDatasetsCVDispatchProps {
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  // TODO: Make use of fetch details in optional information.
  fetchDetails: (datasetId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchTypeFilter: (datasetId: number) => Promise<void>;
}

type DLSDatasetsCVCombinedProps = DLSDatasetsCVProps &
  DLSDatasetsCVStateProps &
  DLSDatasetsCVDispatchProps;

const DLSDatasetsCardView = (
  props: DLSDatasetsCVCombinedProps
): React.ReactElement => {
  const {
    proposalName,
    investigationId,
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    fetchTypeFilter,
    cartItems,
    filterData,
    addToCart,
    removeFromCart,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [fetchedFilters, setFetchedFilters] = React.useState(false);
  const [datasetIds, setDatasetIds] = React.useState<number[]>([]);

  const selectedCards = React.useMemo(
    () =>
      cartItems
        .filter(
          cartItem =>
            cartItem.entityType === 'dataset' &&
            datasetIds.includes(cartItem.entityId)
        )
        .map(cartItem => cartItem.entityId),
    [cartItems, datasetIds]
  );

  const typeFilteredItems = React.useMemo(
    () => ('TYPE_ID' in filterData ? filterData['TYPE_ID'] : []),
    [filterData]
  );

  React.useEffect(() => {
    // TODO: React.useMemo?
    setDatasetIds(data.map(dataset => dataset.ID));

    if (!fetchedCount) {
      fetchCount(parseInt(investigationId));
      setFetchedCount(true);
    }

    if (!fetchedFilters) {
      fetchTypeFilter(parseInt(investigationId));
      setFetchedFilters(true);
    }
  }, [
    investigationId,
    data,
    fetchedCount,
    fetchCount,
    fetchedFilters,
    fetchTypeFilter,
  ]);

  return (
    <CardView
      data={data}
      loadData={params => fetchData(parseInt(investigationId), params)}
      loadCount={() => fetchCount(parseInt(investigationId))}
      totalDataCount={totalDataCount}
      title={{
        dataKey: 'NAME',
        content: (dataset: Dataset) =>
          tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigationId}/dataset/${dataset.ID}/datafile`,
            dataset.NAME
          ),
      }}
      description={{ dataKey: 'DESCRIPTION' }}
      information={[
        {
          label: 'Datafile Count',
          dataKey: 'DATAFILE_COUNT',
        },
        {
          label: 'Create Time',
          dataKey: 'CREATE_TIME',
        },
        {
          label: 'Modified Time',
          dataKey: 'MOD_TIME',
        },
        {
          label: 'Start Date',
          dataKey: 'STARTDATE',
        },
        {
          label: 'End Date',
          dataKey: 'END_DATE',
        },
        // TODO: Needs to be part of the retrievable information.
        // {
        //   label: 'Size',
        //   dataKey: 'SIZE',
        //   content: (dataset: Dataset) => formatBytes(dataset.SIZE),
        // },
        // {
        //   label: 'Name',
        //   dataKey: 'DATASETTYPE.NAME',
        // },
        // {
        //   label: 'Description',
        //   dataKey: 'DATASETTYPE.DESCRIPTION',
        // },
      ]}
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
      cardFilters={[
        {
          label: 'Type ID',
          dataKey: 'TYPE_ID',
          filterItems: typeFilteredItems,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSDatasetsCVDispatchProps => ({
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(
      fetchDatasets({
        investigationId,
        offsetParams,
        optionalParams: { getDatafileCount: true },
      })
    ),
  fetchCount: (investigationId: number) =>
    dispatch(fetchDatasetCount(investigationId)),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  fetchTypeFilter: (investigationId: number) =>
    dispatch(
      fetchFilter('dataset', 'TYPE_ID', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            INVESTIGATION_ID: { eq: investigationId },
          }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): DLSDatasetsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
    filterData: state.dgcommon.filterData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DLSDatasetsCardView);
