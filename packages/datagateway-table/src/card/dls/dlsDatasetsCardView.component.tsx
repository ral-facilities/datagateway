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
  // formatBytes,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { StateType } from 'datagateway-common/lib/state/app.types';
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
}

interface DLSDatasetsCVDispatchProps {
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  fetchDetails: (datasetId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
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
    cartItems,
    addToCart,
    removeFromCart,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);
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

  React.useEffect(() => {
    // TODO: React.useMemo?
    setDatasetIds(data.map(dataset => dataset.ID));

    if (!fetchedCount) {
      fetchCount(parseInt(investigationId));
      setFetchedCount(true);
    }
  }, [investigationId, data, fetchedCount, fetchCount]);

  return (
    <CardView
      data={data}
      loadData={params => fetchData(parseInt(investigationId), params)}
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
      furtherInformation={[
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
});

const mapStateToProps = (state: StateType): DLSDatasetsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DLSDatasetsCardView);
