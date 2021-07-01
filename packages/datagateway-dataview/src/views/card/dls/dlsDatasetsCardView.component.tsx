import React from 'react';

import {
  CardView,
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
  fetchDatasetSize,
  pushPageFilter,
  Filter,
  TextColumnFilter,
  TextFilter,
  DateColumnFilter,
  DateFilter,
  pushPageNum,
  pushQuery,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import {
  StateType,
  FilterDataType,
  QueryParams,
} from 'datagateway-common/lib/state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
  ConfirmationNumber,
  CalendarToday,
} from '@material-ui/icons';
import { Button } from '@material-ui/core';
import DatasetDetailsPanel from '../../detailsPanels/dls/datasetDetailsPanel.component';
import { useTranslation } from 'react-i18next';

interface DLSDatasetsCVProps {
  proposalName: string;
  investigationId: string;
}

interface DLSDatasetsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  cartItems: DownloadCartItem[];
  filterData: FilterDataType;
  query: QueryParams;
  loadedData: boolean;
  loadedCount: boolean;
}

interface DLSDatasetsCVDispatchProps {
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  fetchDetails: (datasetId: number) => Promise<void>;
  fetchSize: (investigationId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchTypeFilter: (datasetId: number) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
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
    query,
    loadedData,
    loadedCount,
    fetchData,
    fetchCount,
    fetchTypeFilter,
    fetchDetails,
    fetchSize,
    cartItems,
    filterData,
    addToCart,
    removeFromCart,
    pushFilters,
    pushPage,
    pushQuery,
  } = props;

  const filters = query.filters;
  const [t] = useTranslation();

  React.useEffect(() => {
    fetchTypeFilter(parseInt(investigationId));
  }, [investigationId, fetchTypeFilter]);

  const selectedCards = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'dataset' &&
            data.map((dataset) => dataset.id).includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, data]
  );

  const typeFilteredItems = React.useMemo(
    () => ('type.id' in filterData ? filterData['type.id'] : []),
    [filterData]
  );

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as TextFilter}
      onChange={(value: { value?: string | number; type: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
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

  const loadCount = React.useCallback(
    () => fetchCount(parseInt(investigationId)),
    [fetchCount, investigationId]
  );
  const loadData = React.useCallback(
    (params) => fetchData(parseInt(investigationId), params),
    [fetchData, investigationId]
  );

  return (
    <CardView
      data={data}
      loadData={loadData}
      loadCount={loadCount}
      totalDataCount={totalDataCount}
      query={query}
      onPageChange={pushPage}
      onFilter={pushFilters}
      pushQuery={pushQuery}
      loadedData={loadedData}
      loadedCount={loadedCount}
      title={{
        label: t('datasets.name'),
        dataKey: 'name',
        content: (dataset: Dataset) =>
          tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigationId}/dataset/${dataset.id}/datafile`,
            dataset.name,
            query.view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('datasets.details.description'),
        dataKey: 'description',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <ConfirmationNumber />,
          label: t('datasets.datafile_count'),
          dataKey: 'datafileCount',
          disableSort: true,
        },
        {
          icon: <CalendarToday />,
          label: t('datasets.create_time'),
          dataKey: 'createTime',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('datasets.modified_time'),
          dataKey: 'modTime',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('datasets.details.start_date'),
          dataKey: 'startDate',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('datasets.details.end_date'),
          dataKey: 'END_DATE',
          filterComponent: dateFilter,
        },
      ]}
      moreInformation={(dataset: Dataset) => (
        <DatasetDetailsPanel
          rowData={dataset}
          fetchDetails={fetchDetails}
          fetchSize={fetchSize}
        />
      )}
      buttons={[
        function cartButton(dataset: Dataset) {
          return !(selectedCards && selectedCards.includes(dataset.id)) ? (
            <Button
              id="add-to-cart-btn"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineOutlined />}
              disableElevation
              onClick={() => addToCart([dataset.id])}
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
                if (selectedCards && selectedCards.includes(dataset.id))
                  removeFromCart([dataset.id]);
              }}
            >
              Remove from cart
            </Button>
          );
        },
      ]}
      customFilters={[
        {
          label: t('datasets.type.id'),
          dataKey: 'type.id',
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
        offsetParams,
        getDatafileCount: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'investigation.id': { eq: investigationId },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify('investigation'),
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
            'investigation.id': { eq: investigationId },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify('investigation'),
        },
      ])
    ),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
  fetchSize: (datasetId: number) => dispatch(fetchDatasetSize(datasetId)),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  fetchTypeFilter: (investigationId: number) =>
    dispatch(
      fetchFilter('dataset', 'type.id', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigation.id': { eq: investigationId },
          }),
        },
      ])
    ),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): DLSDatasetsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    cartItems: state.dgcommon.cartItems,
    filterData: state.dgcommon.filterData,
    query: state.dgcommon.query,
    loadedData: state.dgcommon.loadedData,
    loadedCount: state.dgcommon.loadedCount,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DLSDatasetsCardView);
