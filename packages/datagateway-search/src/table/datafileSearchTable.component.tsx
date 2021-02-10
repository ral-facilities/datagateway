import React from 'react';
import { Typography } from '@material-ui/core';
import {
  Table,
  formatBytes,
  TextColumnFilter,
  DateColumnFilter,
  Order,
  Filter,
  Datafile,
  Entity,
  DownloadCartItem,
  fetchDatafiles,
  downloadDatafile,
  fetchDatafileCount,
  addToCart,
  removeFromCart,
  fetchAllIds,
  sortTable,
  filterTable,
  clearTable,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action, AnyAction } from 'redux';
import { useTranslation } from 'react-i18next';

interface DatafileSearchTableStoreProps {
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
  requestReceived: boolean;
}

interface DatafileSearchTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (luceneData: number[], offsetParams: IndexRange) => Promise<void>;
  fetchCount: (luceneData: number[]) => Promise<void>;
  downloadData: (datafileId: number, filename: string) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchAllIds: (luceneData: number[]) => Promise<void>;
  clearTable: () => Action;
}

type DatafileSearchTableCombinedProps = DatafileSearchTableStoreProps &
  DatafileSearchTableDispatchProps;

const DatafileSearchTable = (
  props: DatafileSearchTableCombinedProps
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
    // downloadData,
    cartItems,
    addToCart,
    removeFromCart,
    clearTable,
    allIds,
    luceneData,
    fetchAllIds,
    loading,
  } = props;

  const [t] = useTranslation();

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'datafile' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable, luceneData]);

  React.useEffect(() => {
    fetchCount(luceneData);
    fetchAllIds(luceneData);
  }, [fetchCount, fetchData, fetchAllIds, filters, luceneData]);

  React.useEffect(() => {
    fetchData(luceneData, { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, fetchAllIds, sort, filters, luceneData]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: { value?: string | number; type: string } | null) =>
        filterTable(dataKey, value ? value : null)
      }
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
        const datafileData = rowData as Datafile;
        return (
          <div>
            <Typography>
              <b>{t('datafiles.name')}:</b> {datafileData.NAME}
            </Typography>
            <Typography>
              <b>{t('datafiles.size')}:</b> {formatBytes(datafileData.FILESIZE)}
            </Typography>
            <Typography>
              <b>{t('datafiles.location')}:</b> {datafileData.LOCATION}
            </Typography>
          </div>
        );
      }}
      columns={[
        {
          label: t('datafiles.name'),
          dataKey: 'NAME',
          filterComponent: textFilter,
        },
        {
          label: t('datafiles.location'),
          dataKey: 'LOCATION',
          filterComponent: textFilter,
        },
        {
          label: t('datafiles.size'),
          dataKey: 'FILESIZE',
          cellContentRenderer: (props) => {
            return formatBytes(props.cellData);
          },
        },
        {
          label: t('datafiles.modified_time'),
          dataKey: 'MOD_TIME',
          filterComponent: dateFilter,
          disableHeaderWrap: true,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DatafileSearchTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (luceneData: number[], offsetParams?: IndexRange) =>
    dispatch(
      fetchDatafiles({
        offsetParams,
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
      fetchDatafileCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            ID: { in: luceneData },
          }),
        },
      ])
    ),
  downloadData: (datafileId: number, filename: string) =>
    dispatch(downloadDatafile(datafileId, filename)),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('datafile', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('datafile', entityIds)),
  fetchAllIds: (luceneData: number[]) =>
    dispatch(
      fetchAllIds('datafile', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            ID: { in: luceneData },
          }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
});

const mapStateToProps = (state: StateType): DatafileSearchTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    data: state.dgcommon.data,
    luceneData: state.dgsearch.searchData.datafile,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    requestReceived: state.dgsearch.requestReceived,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatafileSearchTable);
