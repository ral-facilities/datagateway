import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Order,
  Filter,
  Investigation,
  Entity,
} from 'datagateway-common';
import { Paper } from '@material-ui/core';
import { StateType } from '../../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import {
  sortTable,
  filterTable,
  fetchInvestigations,
  fetchInvestigationCount,
  clearTable,
} from '../../state/actions';
import useAfterMountEffect from '../../utils';

interface DLSProposalsTableStoreProps {
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

interface DLSProposalsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  clearTable: () => Action;
}

type DLSProposalsTableCombinedProps = DLSProposalsTableStoreProps &
  DLSProposalsTableDispatchProps;

const DLSProposalsTable = (
  props: DLSProposalsTableCombinedProps
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
    clearTable,
    loading,
  } = props;

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount();
    fetchData({ startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, sort, filters]);

  return (
    <Paper style={{ height: 'calc(100vh - 64px)', width: '100%' }}>
      <Table
        loading={loading}
        data={data}
        loadMoreRows={fetchData}
        totalRowCount={totalDataCount}
        sort={sort}
        onSort={sortTable}
        columns={[
          {
            label: 'Title',
            dataKey: 'TITLE',
            cellContentRenderer: (props: TableCellProps) => {
              const investigationData = props.rowData as Investigation;
              return tableLink(
                `/browse/proposal/${investigationData.NAME}/investigation/`,
                investigationData.TITLE
              );
            },
            filterComponent: textFilter,
          },
          {
            label: 'Name',
            dataKey: 'NAME',
            cellContentRenderer: (props: TableCellProps) => {
              return tableLink(
                `/browse/proposal/${props.rowData.NAME}/investigation/`,
                props.rowData.NAME
              );
            },
            filterComponent: textFilter,
          },
        ]}
      />
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSProposalsTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (offsetParams: IndexRange) =>
    dispatch(
      fetchInvestigations({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'distinct',
            filterValue: JSON.stringify(['NAME', 'TITLE']),
          },
        ],
      })
    ),
  fetchCount: () =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'distinct',
          filterValue: JSON.stringify(['NAME', 'TITLE']),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
});

const mapStateToProps = (state: StateType): DLSProposalsTableStoreProps => {
  return {
    sort: state.dgtable.sort,
    filters: state.dgtable.filters,
    data: state.dgtable.data,
    totalDataCount: state.dgtable.totalDataCount,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSProposalsTable);
