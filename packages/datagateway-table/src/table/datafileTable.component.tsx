import React from 'react';
import { Paper, Typography, IconButton } from '@material-ui/core';
import {
  Table,
  TableActionProps,
  formatBytes,
  TextColumnFilter,
  DateColumnFilter,
  Order,
  Filter,
  Datafile,
  Entity,
  DownloadCartItem,
} from 'datagateway-common';
import { GetApp } from '@material-ui/icons';
import {
  fetchDatafiles,
  sortTable,
  filterTable,
  downloadDatafile,
  addToCart,
  removeFromCart,
  fetchDatafileCount,
  clearTable,
} from '../state/actions';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { StateType } from '../state/app.types';
import { Action, AnyAction } from 'redux';
import { IndexRange } from 'react-virtualized';
import useAfterMountEffect from '../utils';

interface DatafileTableProps {
  datasetId: string;
}

interface DatafileTableStoreProps {
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
}

interface DatafileTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (datasetId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  downloadData: (datafileId: number, filename: string) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  clearTable: () => Action;
}

type DatafileTableCombinedProps = DatafileTableProps &
  DatafileTableStoreProps &
  DatafileTableDispatchProps;

const DatafileTable = (
  props: DatafileTableCombinedProps
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
    datasetId,
    downloadData,
    cartItems,
    addToCart,
    removeFromCart,
    clearTable,
  } = props;

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          cartItem =>
            cartItem.entityType === 'datafile' &&
            data.some(entity => entity.ID === cartItem.entityId)
        )
        .map(cartItem => cartItem.entityId),
    [cartItems, data]
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount(parseInt(datasetId));
    fetchData(parseInt(datasetId), { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, sort, filters, datasetId]);

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
    <Paper style={{ height: 'calc(100vh - 64px)', width: '100%' }}>
      <Table
        data={data}
        loadMoreRows={params => fetchData(parseInt(datasetId), params)}
        totalRowCount={totalDataCount}
        sort={sort}
        onSort={sortTable}
        selectedRows={selectedRows}
        onCheck={addToCart}
        onUncheck={removeFromCart}
        detailsPanel={({ rowData }) => {
          const datafileData = rowData as Datafile;
          return (
            <div>
              <Typography>
                <b>Name:</b> {datafileData.NAME}
              </Typography>
              <Typography>
                <b>File Size:</b> {formatBytes(datafileData.SIZE)}
              </Typography>
              <Typography>
                <b>Location:</b> {datafileData.LOCATION}
              </Typography>
            </div>
          );
        }}
        actions={[
          function downloadButton({ rowData }: TableActionProps) {
            const datafileData = rowData as Datafile;
            return (
              <IconButton
                aria-label="Download"
                key="download"
                size="small"
                onClick={() => {
                  downloadData(datafileData.ID, datafileData.LOCATION);
                }}
              >
                <GetApp />
              </IconButton>
            );
          },
        ]}
        columns={[
          {
            label: 'Name',
            dataKey: 'NAME',
            filterComponent: textFilter,
          },
          {
            label: 'Location',
            dataKey: 'LOCATION',
            filterComponent: textFilter,
          },
          {
            label: 'Size',
            dataKey: 'SIZE',
            cellContentRenderer: props => {
              return formatBytes(props.cellData);
            },
          },
          {
            label: 'Modified Time',
            dataKey: 'MOD_TIME',
            filterComponent: dateFilter,
          },
        ]}
      />
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DatafileTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (datasetId: number, offsetParams: IndexRange) =>
    dispatch(fetchDatafiles(datasetId, offsetParams)),
  fetchCount: (datasetId: number) => dispatch(fetchDatafileCount(datasetId)),
  downloadData: (datafileId: number, filename: string) =>
    dispatch(downloadDatafile(datafileId, filename)),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('datafile', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('datafile', entityIds)),
  clearTable: () => dispatch(clearTable()),
});

const mapStateToProps = (state: StateType): DatafileTableStoreProps => {
  return {
    sort: state.dgtable.sort,
    filters: state.dgtable.filters,
    data: state.dgtable.data,
    totalDataCount: state.dgtable.totalDataCount,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
    cartItems: state.dgtable.cartItems,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatafileTable);
