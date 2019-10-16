import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  datasetLink,
  Order,
  Filter,
  Dataset,
  Entity,
  DownloadCartItem,
} from 'datagateway-common';
import {
  sortTable,
  filterTable,
  fetchDatasets,
  addToCart,
  removeFromCart,
} from '../state/actions';
import { AnyAction } from 'redux';
import { StateType } from '../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';

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
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
}

interface DatasetTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (investigationId: number) => Promise<void>;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
}

type DatasetTableCombinedProps = DatasetTableProps &
  DatasetTableStoreProps &
  DatasetTableDispatchProps;

const DatasetTable = (props: DatasetTableCombinedProps): React.ReactElement => {
  const {
    data,
    fetchData,
    sort,
    sortTable,
    filters,
    filterTable,
    investigationId,
    cartItems,
    addToCart,
    removeFromCart,
  } = props;

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          cartItem =>
            cartItem.entityType === 'dataset' &&
            data.some(entity => entity.ID === cartItem.entityId)
        )
        .map(cartItem => cartItem.entityId),
    [cartItems, data]
  );

  React.useEffect(() => {
    fetchData(parseInt(investigationId));
  }, [fetchData, sort, filters, investigationId]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  return (
    <Paper style={{ height: 'calc(100vh - 64px)', width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        selectedRows={selectedRows}
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
          },
          {
            label: 'Modified Time',
            dataKey: 'MOD_TIME',
          },
        ]}
      />
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DatasetTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (investigationId: number) =>
    dispatch(fetchDatasets(investigationId)),
  addToCart: (entityIds: number[]) => dispatch(addToCart('dataset', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('dataset', entityIds)),
});

const mapStateToProps = (state: StateType): DatasetTableStoreProps => {
  return {
    sort: state.dgtable.sort,
    filters: state.dgtable.filters,
    data: state.dgtable.data,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
    cartItems: state.dgtable.cartItems,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatasetTable);
