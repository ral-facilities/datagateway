import React from 'react';
import { Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  DateColumnFilter,
  datasetLink,
  Order,
  Filter,
  Dataset,
  Entity,
  DownloadCartItem,
  fetchDatasets,
  addToCart,
  removeFromCart,
  fetchDatasetCount,
  fetchAllIds,
  sortTable,
  filterTable,
} from 'datagateway-common';
import { clearTable } from '../state/actions';
import { AnyAction } from 'redux';
import { StateType } from '../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import useAfterMountEffect from '../utils';

interface DatasetTableProps {
  investigationId: string;
}

interface DatasetTableStoreProps {
  sort: {
    [column: string]: Order;
  };
  filters: {
    [column: string]: Filter;
  };
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
  allIds: number[];
}

interface DatasetTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  clearTable: () => Action;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: () => Promise<void>;
}

type DatasetTableCombinedProps = DatasetTableProps &
  DatasetTableStoreProps &
  DatasetTableDispatchProps;

const DatasetTable = (props: DatasetTableCombinedProps): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    sort,
    sortTable,
    filters,
    filterTable,
    investigationId,
    cartItems,
    addToCart,
    removeFromCart,
    clearTable,
    allIds,
    fetchAllIds,
    loading,
  } = props;

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          cartItem =>
            cartItem.entityType === 'dataset' &&
            allIds.includes(cartItem.entityId)
        )
        .map(cartItem => cartItem.entityId),
    [cartItems, allIds]
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount(parseInt(investigationId));
    fetchData(parseInt(investigationId), { startIndex: 0, stopIndex: 49 });
    fetchAllIds();
  }, [fetchCount, fetchData, fetchAllIds, sort, filters, investigationId]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        filterTable(dataKey, value)
      }
    />
  );

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={params => fetchData(parseInt(investigationId), params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={({ rowData }) => {
        const datasetData = rowData as Dataset;
        return (
          <div>
            <Typography>
              <b>Name:</b> {datasetData.NAME}
            </Typography>
            <Typography>
              <b>Description:</b> {datasetData.NAME}
            </Typography>
          </div>
        );
      }}
      columns={[
        {
          label: 'Name',
          dataKey: 'NAME',
          cellContentRenderer: props => {
            const datasetData = props.rowData as Dataset;
            return datasetLink(
              investigationId,
              datasetData.ID,
              datasetData.NAME
            );
          },
          filterComponent: textFilter,
        },
        {
          label: 'Datafile Count',
          dataKey: 'DATAFILE_COUNT',
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
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>,
  ownProps: DatasetTableProps
): DatasetTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(fetchDatasets({ investigationId, offsetParams })),
  fetchCount: (investigationId: number) =>
    dispatch(fetchDatasetCount(investigationId)),
  clearTable: () => dispatch(clearTable()),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  fetchAllIds: () =>
    dispatch(
      fetchAllIds('dataset', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            INVESTIGATION_ID: { eq: parseInt(ownProps.investigationId) },
          }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): DatasetTableStoreProps => {
  return {
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DatasetTable);
