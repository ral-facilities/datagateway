import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import { Investigation, StateType } from '../state/app.types';
import {
  sortInvestigationsTable,
  fetchInvestigations,
} from '../state/actions/actions';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';

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
  order: 'asc' | 'desc';
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
  sort: {
    column: string;
    order: 'asc' | 'desc';
  } | null;
  data: Investigation[];
  loading: boolean;
  error: string | null;
}

interface TestTableDispatchProps {
  sortTable: (column: string, order: 'asc' | 'desc') => void;
  fetchData: () => Promise<void>;
}

type TestTableCombinedProps = TestTableProps & TestTableDispatchProps;

export function TestTable(props: TestTableCombinedProps): React.ReactElement {
  const { sort, sortTable, fetchData, data } = props;
  function handleRequestSort(
    event: React.MouseEvent<unknown>,
    property: string
  ): void {
    const isDesc =
      sort !== null && sort.column === property && sort.order === 'desc';
    sortTable(property, isDesc ? 'asc' : 'desc');
  }

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Paper>
      <Table size={'small'}>
        <TestTableHead
          order={sort !== null ? sort.order : 'asc'}
          orderBy={sort !== null ? sort.column : ''}
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
  sortTable: (column: string, order: 'asc' | 'desc') =>
    dispatch(sortInvestigationsTable(column, order)),
  fetchData: () => dispatch(fetchInvestigations()),
});

const mapStateToProps = (state: StateType): TestTableProps => {
  return {
    sort: state.dgtable.sort,
    data: state.dgtable.data,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestTable);
