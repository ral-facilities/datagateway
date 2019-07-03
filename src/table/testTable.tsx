import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import { StateType, Filter, Order, Entity } from '../state/app.types';
import { fetchInvestigations, sortTable, filterTable } from '../state/actions';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { AnyAction, Action } from 'redux';
import { TextField, CircularProgress } from '@material-ui/core';

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
  { id: 'DATASET_COUNT', label: 'Dataset count' },
];

interface TestTableHeadProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  sort: {
    [column: string]: Order;
  };
}

function TestTableHead(props: TestTableHeadProps): React.ReactElement {
  const { sort, onRequestSort } = props;
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
            sortDirection={row.id in sort ? sort[row.id] : false}
          >
            <TableSortLabel
              active={row.id in sort}
              direction={sort[row.id]}
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
    [column: string]: Order;
  };
  filters?: {
    [column: string]: Filter;
  };
  data: Entity[];
  loading: boolean;
  error: string | null;
}

interface TestTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: () => Promise<void>;
}

type TestTableCombinedProps = TestTableProps & TestTableDispatchProps;

export function TestTable(props: TestTableCombinedProps): React.ReactElement {
  const { sort, sortTable, fetchData, data, filters, filterTable } = props;
  function handleRequestSort(
    event: React.MouseEvent<unknown>,
    property: string
  ): void {
    const currSortDirection = sort && sort[property] ? sort[property] : null;
    let nextSortDirection: Order | null = null;
    switch (currSortDirection) {
      case 'asc':
        nextSortDirection = 'desc';
        break;
      case 'desc':
        nextSortDirection = null;
        break;
      case null:
        nextSortDirection = 'asc';
    }
    console.log(currSortDirection);
    console.log(nextSortDirection);
    sortTable(property, nextSortDirection);
  }

  React.useEffect(() => {
    fetchData();
  }, [fetchData, sort, filters]);

  return (
    <Paper>
      <TextField
        placeholder="Title filter"
        value={filters && filters.TITLE ? filters.TITLE : ''}
        onChange={event =>
          filterTable('TITLE', event.target.value ? event.target.value : null)
        }
      />
      <Table size={'small'}>
        <TestTableHead sort={sort || {}} onRequestSort={handleRequestSort} />
        <TableBody>
          {data.map(row => {
            return (
              <TableRow key={row.ID}>
                <TableCell>{row.TITLE}</TableCell>
                <TableCell>{row.VISIT_ID}</TableCell>
                <TableCell>
                  {row.DATASET_COUNT
                    ? row.DATASET_COUNT
                    : // <CircularProgress disableShrink size={14} thickness={7} />
                      'Loading...'}
                </TableCell>
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
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
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
