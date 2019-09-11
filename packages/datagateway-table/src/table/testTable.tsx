import React from 'react';
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from '@material-ui/core';
import { StateType } from '../state/app.types';
import {
  sortTable,
  filterTable,
  downloadDatafile,
  fetchDatafiles,
} from '../state/actions';
import { ThunkDispatch } from 'redux-thunk';
import { connect } from 'react-redux';
import { AnyAction, Action } from 'redux';
import { Filter, Order, Entity, Dataset } from 'datagateway-common';

interface HeadRow {
  id: string;
  label: string;
}

const headRows: HeadRow[] = [
  {
    id: 'NAME',
    label: 'Name',
  },
  { id: 'LOCATION', label: 'Location' },
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
        <TableCell key="actions">Actions</TableCell>
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
  downloadData: (datafileId: number, filename: string) => Promise<void>;
}

type TestTableCombinedProps = TestTableProps & TestTableDispatchProps;

export function TestTable(props: TestTableCombinedProps): React.ReactElement {
  const {
    sort,
    sortTable,
    fetchData,
    data,
    filters,
    filterTable,
    downloadData,
  } = props;
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
            const dataset = row as Dataset;
            return (
              <TableRow key={dataset.ID}>
                <TableCell>{dataset.NAME}</TableCell>
                <TableCell>{dataset.LOCATION}</TableCell>
                <TableCell>
                  <Button
                    onClick={() =>
                      downloadData(84869522, 'LARMOR00004314_ICPevent.txt')
                    }
                  >
                    Download
                  </Button>
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
  fetchData: () => dispatch(fetchDatafiles(2506)),
  downloadData: (datafileId: number, filename: string) =>
    dispatch(downloadDatafile(datafileId, filename)),
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
