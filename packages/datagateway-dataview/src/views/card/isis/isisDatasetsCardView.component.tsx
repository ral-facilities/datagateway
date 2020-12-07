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
  Order,
  QueryParams,
  SortType,
  pushPageSort,
  pushPageResults,
  pushPageNum,
  clearData,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { Action, AnyAction } from 'redux';
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
import { push } from 'connected-react-router';

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
  clearData: () => Action;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  viewDatafiles: (urlPrefix: string) => (id: number) => Action;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISDatasetCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
  filters: FiltersType;
  loading: boolean;
  query: QueryParams;
  sort: SortType;
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
    loading,
    query,
    sort,
    fetchData,
    fetchCount,
    fetchDetails,
    addToCart,
    removeFromCart,
    downloadData,
    filters,
    pushFilters,
    pushPage,
    pushResults,
    pushSort,
    clearData,
    viewDatafiles,
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

  const urlPrefix = `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset`;

  return (
    <CardView
      data={data}
      loadData={(params) => fetchData(parseInt(investigationId), params)}
      loadCount={() => fetchCount(parseInt(investigationId))}
      totalDataCount={totalDataCount}
      loading={loading}
      sort={sort}
      filters={filters}
      query={query}
      onPageChange={pushPage}
      onResultsChange={pushResults}
      onSort={pushSort}
      onFilter={pushFilters}
      clearData={clearData}
      title={{
        label: 'Name',
        dataKey: 'NAME',
        content: (dataset: Dataset) =>
          tableLink(`${urlPrefix}/${dataset.ID}`, dataset.NAME),
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
        <DatasetDetailsPanel
          rowData={dataset}
          fetchDetails={fetchDetails}
          viewDatafiles={viewDatafiles(urlPrefix)}
        />
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
  clearData: () => dispatch(clearData()),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  viewDatafiles: (urlPrefix: string) => {
    return (id: number) => {
      return dispatch(push(`${urlPrefix}/${id}/datafile`));
    };
  },
});

const mapStateToProps = (state: StateType): ISISDatasetCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
    filters: state.dgcommon.filters,
    loading: state.dgcommon.loading,
    query: state.dgcommon.query,
    sort: state.dgcommon.sort,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISDatasetsCardView);
