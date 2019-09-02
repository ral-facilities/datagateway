import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Filter,
  Order,
  Entity,
} from 'datagateway-common';
import { Paper } from '@material-ui/core';
import {
  sortTable,
  filterTable,
  fetchDatasets,
  fetchDatasetDetails,
} from '../../state/actions';
import { AnyAction } from 'redux';
import { StateType } from '../../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { TableCellProps } from 'react-virtualized';
import DatasetDetailsPanel from '../detailsPanels/datasetDetailsPanel.component';

interface DLSDatasetsTableProps {
  proposalName: string;
  investigationId: string;
}

interface DLSDatasetsTableStoreProps {
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

interface DLSDatasetsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (investigationId: number) => Promise<void>;
  fetchDetails: (datasetId: number) => Promise<void>;
}

type DLSDatasetsTableCombinedProps = DLSDatasetsTableProps &
  DLSDatasetsTableStoreProps &
  DLSDatasetsTableDispatchProps;

const DLSDatasetsTable = (
  props: DLSDatasetsTableCombinedProps
): React.ReactElement => {
  const {
    data,
    fetchData,
    sort,
    sortTable,
    filters,
    filterTable,
    investigationId,
    proposalName,
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

  // TODO: replace with date filter
  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        detailsPanel={(rowData, detailsPanelResize) => {
          return (
            <DatasetDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
              fetchDetails={props.fetchDetails}
            />
          );
        }}
        columns={[
          {
            label: 'Name',
            dataKey: 'NAME',
            cellContentRenderer: (props: TableCellProps) =>
              tableLink(
                `/browse/proposal/${proposalName}/investigation/${investigationId}/dataset/${props.rowData.ID}/datafile`,
                props.rowData.NAME
              ),
            filterComponent: textFilter,
          },
          {
            label: 'Datafile Count',
            dataKey: 'DATAFILE_COUNT',
            disableSort: true,
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
): DLSDatasetsTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (investigationId: number) =>
    dispatch(fetchDatasets(investigationId)),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
});

const mapStateToProps = (state: StateType): DLSDatasetsTableStoreProps => {
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
)(DLSDatasetsTable);
