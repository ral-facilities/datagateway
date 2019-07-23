import React from 'react';
import TextColumnFilter from './columnFilters/textColumnFilter.component';
import NumberColumnFilter from './columnFilters/numberColumnFilter.component';
import { Paper, Typography, IconButton } from '@material-ui/core';
import Table from './table.component';
import { formatBytes } from './cellRenderers/cellContentRenderers';
import { GetApp } from '@material-ui/icons';
import { fetchDatafiles, sortTable, filterTable } from '../state/actions';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { Filter, Order, Entity, Datafile, StateType } from '../state/app.types';
import { Action, AnyAction } from 'redux';

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
  loading: boolean;
  error: string | null;
}

interface DatafileTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (datasetId: number) => Promise<void>;
}

type DatafileTableCombinedProps = DatafileTableProps &
  DatafileTableStoreProps &
  DatafileTableDispatchProps;

const DatafileTable = (
  props: DatafileTableCombinedProps
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

  // const sizeFilter = (
  //   <NumberColumnFilter label="Size" onChange={this.onSizeChange} />
  // );

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        detailsPanel={(rowData: Entity) => {
          const datafileData = rowData as Datafile;
          return (
            <div>
              <Typography>
                <b>Name: </b> {datafileData.NAME}
              </Typography>
              <Typography>
                <b>File Size: </b> {formatBytes(datafileData.SIZE)}
              </Typography>
              <Typography>
                <b>Location: </b> {datafileData.LOCATION}
              </Typography>
            </div>
          );
        }}
        actions={[
          function downloadButton(rowData: Entity) {
            const datafileData = rowData as Datafile;
            return (
              <IconButton
                key="download"
                onClick={() => {
                  alert(`Downloading ${datafileData.LOCATION}`);
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
  fetchData: (investigationId: number) =>
    dispatch(fetchDatafiles(investigationId)),
});

const mapStateToProps = (state: StateType): DatafileTableStoreProps => {
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
)(DatafileTable);
