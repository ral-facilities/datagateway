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
import { TableCellProps } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import {
  sortTable,
  filterTable,
  fetchInvestigations,
} from '../../state/actions';

interface DLSProposalsTableStoreProps {
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

interface DLSProposalsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: () => Promise<void>;
}

type DLSProposalsTableCombinedProps = DLSProposalsTableStoreProps &
  DLSProposalsTableDispatchProps;

const DLSProposalsTable = (
  props: DLSProposalsTableCombinedProps
): React.ReactElement => {
  const { data, fetchData, sort, sortTable, filters, filterTable } = props;

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  React.useEffect(() => {
    fetchData();
  }, [fetchData, sort, filters]);

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      // @ts-ignore
      <Table
        data={data}
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
  fetchData: () =>
    dispatch(
      fetchInvestigations({
        additionalFilters: [
          {
            filterType: 'distinct',
            filterValue: JSON.stringify(['NAME', 'TITLE']),
          },
        ],
      })
    ),
});

const mapStateToProps = (state: StateType): DLSProposalsTableStoreProps => {
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
)(DLSProposalsTable);
