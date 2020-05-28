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
    if (!fetchedCount) {
      console.log('Fetch dataset count');
      fetchCount(parseInt(investigationId));
      setFetchedCount(true);
    }
  }, [investigationId, data, fetchedCount, fetchCount]);

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={params => fetchData(parseInt(investigationId), params)}
      selectedCards={selectedCards}
      onSelect={addToCart}
      onDeselect={removeFromCart}
      // TODO: Put in the correct dataKeys.
      //       Provide an array of further info and tags.
      title={{
        dataKey: 'NAME',
        content: (dataset: Dataset) => {
          return datasetLink(investigationId, dataset.ID, dataset.NAME);
        },
      }}
      description={{ dataKey: 'DESCRIPTION' }}
      furtherInformation={[
        {
          label: 'Created Time',
          dataKey: 'CREATE_TIME',
        },
        {
          label: 'Modified Time',
          dataKey: 'MOD_TIME',
        },
        // {
        //   label: 'Datafile Count',
        //   dataKey: 'DATAFILE_COUNT',
        // },
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
