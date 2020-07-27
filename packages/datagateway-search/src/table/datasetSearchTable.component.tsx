import React from 'react';
import { Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  DateColumnFilter,
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
  clearTable,
} from 'datagateway-common';
import { AnyAction } from 'redux';
import { StateType } from '../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';
import useAfterMountEffect from '../state/utils';
import { useTranslation } from 'react-i18next';

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
  luceneData: number[];
}

interface DatasetTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (luceneData: number[], offsetParams?: IndexRange) => Promise<void>;
  fetchCount: (luceneData: number[]) => Promise<void>;
  clearTable: () => Action;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: (luceneData: number[]) => Promise<void>;
}

type DatasetTableCombinedProps = DatasetTableStoreProps &
  DatasetTableDispatchProps;

const DatasetSearchTable = (
  props: DatasetTableCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    sort,
    sortTable,
    filters,
    filterTable,
    cartItems,
    addToCart,
    removeFromCart,
    clearTable,
    allIds,
    fetchAllIds,
    loading,
    luceneData,
  } = props;

  const [t] = useTranslation();

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'dataset' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable, luceneData]);

  useAfterMountEffect(() => {
    fetchCount(luceneData);
    fetchData(luceneData, { startIndex: 0, stopIndex: 49 });
    fetchAllIds(luceneData);
  }, [fetchCount, fetchData, fetchAllIds, sort, filters, luceneData]);

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
      loadMoreRows={(params) => fetchData(luceneData, params)}
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
              <b>{t('datasets.details.name')}:</b> {datasetData.NAME}
            </Typography>
            <Typography>
              <b>{t('datasets.details.description')}:</b> {datasetData.NAME}
            </Typography>
          </div>
        );
      }}
      columns={[
        {
          label: t('datasets.name'),
          dataKey: 'NAME',
          filterComponent: textFilter,
        },
        {
          label: t('datasets.datafile_count'),
          dataKey: 'DATAFILE_COUNT',
          disableSort: true,
        },
        {
          label: t('datasets.create_time'),
          dataKey: 'CREATE_TIME',
          filterComponent: dateFilter,
        },
        {
          label: t('datasets.modified_time'),
          dataKey: 'MOD_TIME',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DatasetTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (luceneData: number[], offsetParams?: IndexRange) =>
    dispatch(
      fetchDatasets({
        offsetParams,
        getDatafileCount: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              ID: { in: luceneData },
            }),
          },
        ],
      })
    ),
  fetchCount: (luceneData: number[]) =>
    dispatch(
      fetchDatasetCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            ID: { in: luceneData },
          }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
  fetchAllIds: (luceneData: number[]) =>
    dispatch(
      fetchAllIds('dataset', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            ID: { in: luceneData },
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
    luceneData: state.dgsearch.searchData.dataset,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DatasetSearchTable);
