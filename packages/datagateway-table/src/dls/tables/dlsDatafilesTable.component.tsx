import React from 'react';
import {
  TextColumnFilter,
  Table,
  formatBytes,
  Filter,
  Order,
  Entity,
  Datafile,
  DateColumnFilter,
} from 'datagateway-common';
import { Paper, Typography } from '@material-ui/core';
import { fetchDatafiles, sortTable, filterTable } from '../../state/actions';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { StateType } from '../../state/app.types';
import { Action, AnyAction } from 'redux';

interface DLSDatafilesTableProps {
  datasetId: string;
}

interface DLSDatafilesTableStoreProps {
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

interface DLSDatafilesTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (datasetId: number) => Promise<void>;
}

type DLSDatafilesTableCombinedProps = DLSDatafilesTableProps &
  DLSDatafilesTableStoreProps &
  DLSDatafilesTableDispatchProps;

const DLSDatafilesTable = (
  props: DLSDatafilesTableCombinedProps
): React.ReactElement => {
  const {
    data,
    fetchData,
    sort,
    sortTable,
    filters,
    filterTable,
    datasetId,
  } = props;

  React.useEffect(() => {
    fetchData(parseInt(datasetId));
  }, [fetchData, sort, filters, datasetId]);

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
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      // @ts-ignore
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        detailsPanel={({ rowData }) => {
          const datafileData = rowData as Datafile;
          return (
            <div>
              <Typography variant="body2">
                <b>Name:</b> {datafileData.NAME}
              </Typography>
              <Typography variant="body2">
                <b>Description:</b> {datafileData.DESCRIPTION}
              </Typography>
              <Typography variant="body2">
                <b>File Size:</b> {formatBytes(datafileData.FILESIZE)}
              </Typography>
              <Typography variant="body2">
                <b>Location:</b> {datafileData.LOCATION}
              </Typography>
            </div>
          );
        }}
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
            dataKey: 'FILESIZE',
            cellContentRenderer: props => {
              return formatBytes(props.cellData);
            },
            filterComponent: textFilter,
          },
          {
            label: 'Create Time',
            dataKey: 'CREATE_TIME',
            filterComponent: dateFilter,
          },
        ]}
      />
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSDatafilesTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (datasetId: number) => dispatch(fetchDatafiles(datasetId)),
});

const mapStateToProps = (state: StateType): DLSDatafilesTableStoreProps => {
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
)(DLSDatafilesTable);
