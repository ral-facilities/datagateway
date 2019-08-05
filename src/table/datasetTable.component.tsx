import React from 'react';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import DateColumnFilter from './columnFilters/dateColumnFilter.component';
import { Paper, Typography } from '@material-ui/core';
import Table from './table.component';
import { formatBytes, datasetLink } from './cellRenderers/cellContentRenderers';
import { sortTable, filterTable, fetchDatasets } from '../state/actions';
import { AnyAction } from 'redux';
import { StateType, Filter, Order, Entity, Dataset } from '../state/app.types';
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

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      onChange={(value: { startDate?: Date; endDate?: Date }) =>
        filterTable(
          dataKey,
          value.startDate || value.endDate
            ? {
                startDate: value.startDate,
                endDate: value.endDate,
              }
            : null
        )
      }
    />
  );

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        detailsPanel={(rowData: Entity) => {
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
            filterComponent: dateFilter,
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
