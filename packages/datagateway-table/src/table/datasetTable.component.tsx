import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  formatBytes,
  datasetLink,
  Order,
  Filter,
  Dataset,
  Entity,
} from 'datagateway-common';
import {
  sortTable,
  filterTable,
  fetchDatasets,
  fetchDatasetCount,
} from '../state/actions';
import { AnyAction } from 'redux';
import { StateType } from '../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { IndexRange } from 'react-virtualized';

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
}

interface DatasetTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
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
  } = props;

  React.useEffect(() => {
    fetchCount(parseInt(investigationId));
    fetchData(parseInt(investigationId), { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, sort, filters, investigationId]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      <Table
        data={data}
        loadMoreRows={params => fetchData(parseInt(investigationId), params)}
        totalRowCount={totalDataCount}
        sort={sort}
        onSort={sortTable}
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
            label: 'Size',
            dataKey: 'SIZE',
            cellContentRenderer: props => {
              return formatBytes(props.cellData);
            },
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
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(fetchDatasets(investigationId, offsetParams)),
  fetchCount: (investigationId: number) =>
    dispatch(fetchDatasetCount(investigationId)),
});

const mapStateToProps = (state: StateType): DatasetTableStoreProps => {
  return {
    sort: state.dgtable.sort,
    filters: state.dgtable.filters,
    data: state.dgtable.data,
    totalDataCount: state.dgtable.totalDataCount,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatasetTable);
