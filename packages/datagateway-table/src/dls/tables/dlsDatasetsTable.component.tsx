import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Filter,
  Order,
  Entity,
  DateColumnFilter,
} from 'datagateway-common';
import { Paper } from '@material-ui/core';
import {
  sortTable,
  filterTable,
  fetchDatasets,
  fetchDatasetDetails,
  fetchDatasetCount,
  clearTable,
} from '../../state/actions';
import { AnyAction } from 'redux';
import { StateType } from '../../state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { TableCellProps } from 'react-virtualized';
import DatasetDetailsPanel from '../detailsPanels/datasetDetailsPanel.component';
import { IndexRange } from 'react-virtualized';
import useAfterMountEffect from '../../utils';

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
  totalDataCount: number;
  loading: boolean;
  error: string | null;
}

interface DLSDatasetsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (
    investigationId: number,
    offsetParams: IndexRange
  ) => Promise<void>;
  fetchCount: (datasetId: number) => Promise<void>;
  clearTable: () => Action;
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
    totalDataCount,
    fetchData,
    fetchCount,
    clearTable,
    sort,
    sortTable,
    filters,
    filterTable,
    investigationId,
    proposalName,
  } = props;

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount(parseInt(investigationId));
    fetchData(parseInt(investigationId), { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, sort, filters, investigationId]);

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
        loadMoreRows={params => fetchData(parseInt(investigationId), params)}
        totalRowCount={totalDataCount}
        sort={sort}
        onSort={sortTable}
        detailsPanel={({ rowData, detailsPanelResize }) => {
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
  fetchData: (investigationId: number, offsetParams: IndexRange) =>
    dispatch(
      fetchDatasets({
        investigationId,
        offsetParams,
        optionalParams: { getDatafileCount: true },
      })
    ),
  fetchCount: (investigationId: number) =>
    dispatch(fetchDatasetCount(investigationId)),
  clearTable: () => dispatch(clearTable()),
  fetchDetails: (datasetId: number) => dispatch(fetchDatasetDetails(datasetId)),
});

const mapStateToProps = (state: StateType): DLSDatasetsTableStoreProps => {
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
)(DLSDatasetsTable);
