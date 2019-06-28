import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import { Investigation, StateType, Filter, Order } from '../state/app.types';
import {
  fetchInvestigations,
  sortTable,
  filterTable,
} from '../state/actions/actions';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { AnyAction, Action } from 'redux';
import { TextField } from '@material-ui/core';

interface HeadRow {
  id: string;
  label: string;
}

const headRows: HeadRow[] = [
  {
    id: 'TITLE',
    label: 'Title',
  },
  { id: 'VISIT_ID', label: 'Visit ID' },
];

interface TestTableHeadProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
}

function TestTableHead(props: TestTableHeadProps): React.ReactElement {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (
    property: string
  ): ((event: React.MouseEvent<unknown, MouseEvent>) => void) => (
    event: React.MouseEvent<unknown>
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headRows.map(row => (
          <TableCell
            key={row.id}
            sortDirection={orderBy === row.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === row.id}
              direction={order}
              onClick={createSortHandler(row.id)}
            >
              {row.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface TestTableProps {
  sort?: {
    column: string;
    order: Order;
  };
  filters?: {
    [column: string]: Filter;
  };
  data: Investigation[];
  loading: boolean;
  error: string | null;
}

interface TestTableDispatchProps {
  sortTable: (column: string, order: Order) => Action;
  filterTable: (column: string, filter: Filter) => Action;
  fetchData: () => Promise<void>;
}

type TestTableCombinedProps = TestTableProps & TestTableDispatchProps;

export function TestTable(props: TestTableCombinedProps): React.ReactElement {
  const { sort, sortTable, fetchData, data, filters, filterTable } = props;
  function handleRequestSort(
    event: React.MouseEvent<unknown>,
    property: string
  ): void {
    const isDesc = sort && sort.column === property && sort.order === 'desc';
    sortTable(property, isDesc ? 'asc' : 'desc');
  }

  React.useEffect(() => {
    fetchData();
  }, [fetchData, sort, filters]);

  return (
    <Paper>
      <TextField
        placeholder="Title filter"
        value={filters && filters.TITLE ? filters.TITLE : ''}
        onChange={event => filterTable('TITLE', event.target.value)}
      />
      <Table size={'small'}>
        <TestTableHead
          order={sort ? sort.order : 'asc'}
          orderBy={sort ? sort.column : ''}
          onRequestSort={handleRequestSort}
        />
        <TableBody>
          {data.map(row => {
            return (
              <TableRow key={row.ID}>
                <TableCell>{row.TITLE}</TableCell>
                <TableCell>{row.VISIT_ID}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): TestTableDispatchProps => ({
  sortTable: (column: string, order: Order) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter) =>
    dispatch(filterTable(column, filter)),
  fetchData: () => dispatch(fetchInvestigations()),
});

const mapStateToProps = (state: StateType): TestTableProps => {
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
)(TestTable);
