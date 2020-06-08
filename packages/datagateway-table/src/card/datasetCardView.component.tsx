import React from 'react';

import CardView from './cardView.component';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from 'datagateway-common/lib/state/app.types';
import { AnyAction } from 'redux';
import { IndexRange } from 'react-virtualized';
import {
  fetchDatasets,
  fetchDatasetCount,
  Dataset,
  datasetLink,
  Entity,
  DownloadCartItem,
  addToCart,
  removeFromCart,
} from 'datagateway-common';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';

interface DatasetCVDispatchProps {
  fetchData: (
    investigationId: number,
    offsetParams?: IndexRange
  ) => Promise<void>;
  fetchCount: (investigationId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
}

interface DatasetCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
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

    // Fetch the dataset count based on the investigation ID.
    console.log('dataset count: ', totalDataCount);
    if (!fetchedCount) {
      fetchCount(parseInt(investigationId));
      setFetchedCount(true);
    }
  }, [investigationId, data, fetchedCount, fetchCount, totalDataCount]);

  return (
    <CardView
      data={data}
      loadData={params => fetchData(parseInt(investigationId), params)}
      totalDataCount={totalDataCount}
      title={{
        dataKey: 'NAME',
        content: (dataset: Dataset) => {
          return datasetLink(investigationId, dataset.ID, dataset.NAME);
        },
      }}
      description={{ dataKey: 'DESCRIPTION' }}
      furtherInformation={[
        {
          label: 'Datafile Count',
          dataKey: 'DATAFILE_COUNT',
        },
        {
          label: 'Created Time',
          dataKey: 'CREATE_TIME',
        },
        {
          label: 'Modified Time',
          dataKey: 'MOD_TIME',
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
});

export default connect(mapStateToProps, mapDispatchToProps)(DatasetCardView);
