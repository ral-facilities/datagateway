import React from 'react';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import NumberColumnFilter from './columnFilters/numberColumnFilter.component';
import { Paper, Typography } from '@material-ui/core';
import Table from './table.component';
import { Link } from 'react-router-dom';
import { formatBytes } from '../data/helpers';
import { sortTable, filterTable, fetchDatasets } from '../state/actions';
import { AnyAction } from 'redux';
import { StateType, Filter, Order, Entity, Dataset } from '../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { TableCellProps } from 'react-virtualized';

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
}

interface DatasetTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (investigationId: number) => Promise<void>;
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
  } = props;

  React.useEffect(() => {
    fetchData(parseInt(investigationId));
  }, [fetchData, sort, filters, investigationId]);

  const nameFilter = (
    <TextColumnFilter
      label="Name"
      onChange={(value: string) => filterTable('NAME', value)}
    />
  );
  // const sizeFilter = (
  //   <NumberColumnFilter label="Size" onChange={this.onSizeChange} />
  // );

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        filters={filters}
        onFilter={filterTable}
        detailsPanel={(rowData: Entity) => {
          const datasetData = rowData as Dataset;
          return (
            <div>
              <Typography>
                <b>Name: </b> {datasetData.NAME}
              </Typography>
              <Typography>
                <b>Description: </b> {datasetData.NAME}
              </Typography>
            </div>
          );
        }}
        columns={[
          {
            label: 'Name',
            dataKey: 'NAME',
            cellContentRenderer: function datasetLink(props: TableCellProps) {
              const datasetData = props.rowData as Dataset;
              return (
                <Link
                  to={`/browse/investigation/${investigationId}/dataset/${datasetData.ID}/datafile`}
                >
                  {datasetData.NAME}
                </Link>
              );
            },
            filterComponent: nameFilter,
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
  fetchData: (investigationId: number) =>
    dispatch(fetchDatasets(investigationId)),
});

const mapStateToProps = (state: StateType): DatasetTableStoreProps => {
  return {
    sort: state.dgtable.sort,
    filters: state.dgtable.filters,
    data: state.dgtable.data,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatasetTable);
