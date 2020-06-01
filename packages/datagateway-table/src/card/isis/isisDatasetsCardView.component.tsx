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
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../state/app.types';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';

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
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISDatasetCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
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
    // fetchDetails,
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
      selectedCards={selectedCards}
      onSelect={addToCart}
      onDeselect={removeFromCart}
      title={{
        dataKey: 'NAME',
        content: (dataset: Dataset) =>
          tableLink(
            `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset/${dataset.ID}/datafile`,
            dataset.NAME
          ),
      }}
      furtherInformation={[
        {
          label: 'Size',
          dataKey: 'SIZE',
          content: (dataset: Dataset) => formatBytes(dataset.SIZE),
        },
        {
          label: 'Create Time',
          dataKey: 'CREATE_TIME',
        },
        {
          label: 'Modified Time',
          dataKey: 'MOD_TIME',
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
});

const mapStateToProps = (state: StateType): ISISDatasetCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISDatasetsCardView);
