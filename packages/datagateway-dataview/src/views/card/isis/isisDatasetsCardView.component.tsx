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
  TextColumnFilter,
  DateColumnFilter,
  DateFilter,
  Filter,
  pushPageFilter,
  QueryParams,
  pushPageNum,
  pushQuery,
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
  Save,
  CalendarToday,
} from '@material-ui/icons';
import DatasetDetailsPanel from '../../detailsPanels/isis/datasetDetailsPanel.component';

// eslint-disable-next-line @typescript-eslint/naming-convention
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
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISDatasetCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
  query: QueryParams;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
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
    query,
    fetchData,
    fetchCount,
    fetchDetails,
    addToCart,
    removeFromCart,
    downloadData,
    pushFilters,
    pushPage,
    pushQuery,
  } = props;

  const filters = query.filters;

  const selectedCards = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'dataset' &&
            data.map((dataset) => dataset.ID).includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, data]
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

  return (
    <CardView
      data={data}
      loadData={(params) => fetchData(parseInt(investigationId), params)}
      loadCount={() => fetchCount(parseInt(investigationId))}
      totalDataCount={totalDataCount}
      query={query}
      onPageChange={pushPage}
      onFilter={pushFilters}
      pushQuery={pushQuery}
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
          icon: <Save />,
          label: 'Size',
          dataKey: 'SIZE',
          content: (dataset: Dataset) => formatBytes(dataset.SIZE),
          disableSort: true,
        },
        {
          icon: <CalendarToday />,
          label: 'Create Time',
          dataKey: 'CREATE_TIME',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
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
        offsetParams,
        getSize: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              INVESTIGATION_ID: { eq: investigationId },
            }),
          },
        ],
      })
    ),
  fetchCount: (investigationId: number) =>
    dispatch(
      fetchDatasetCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            INVESTIGATION_ID: { eq: investigationId },
          }),
        },
      ])
    ),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
  downloadData: (datasetId: number, name: string) =>
    dispatch(downloadDataset(datasetId, name)),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): ISISDatasetCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
    query: state.dgcommon.query,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISDatasetsCardView);
