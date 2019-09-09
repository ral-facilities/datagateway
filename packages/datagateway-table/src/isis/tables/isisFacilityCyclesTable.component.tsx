import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Order,
  Filter,
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
  fetchFacilityCycles,
} from '../../state/actions';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISFacilityCyclesTableProps {
  instrumentId: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISFacilityCyclesTableStoreProps {
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

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISFacilityCyclesTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (instrumentId: string) => Promise<void>;
}

type ISISFacilityCyclesTableCombinedProps = ISISFacilityCyclesTableProps &
  ISISFacilityCyclesTableStoreProps &
  ISISFacilityCyclesTableDispatchProps;

const ISISFacilityCyclesTable = (
  props: ISISFacilityCyclesTableCombinedProps
): React.ReactElement => {
  const {
    data,
    fetchData,
    sort,
    sortTable,
    filters,
    filterTable,
    instrumentId,
  } = props;

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

  React.useEffect(() => {
    fetchData(instrumentId);
  }, [fetchData, instrumentId, sort, filters]);

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        columns={[
          {
            label: 'Name',
            dataKey: 'NAME',
            cellContentRenderer: (props: TableCellProps) =>
              tableLink(
                `/browse/instrument/${instrumentId}/facilityCycle/${props.rowData.ID}/investigation`,
                props.rowData.NAME
              ),
            filterComponent: textFilter,
          },
          {
            label: 'Description',
            dataKey: 'DESCRIPTION',
            filterComponent: textFilter,
          },
          {
            label: 'Start Date',
            dataKey: 'STARTDATE',
            filterComponent: dateFilter,
          },
          {
            label: 'End Date',
            dataKey: 'ENDDATE',
            filterComponent: dateFilter,
          },
        ]}
      />
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISFacilityCyclesTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (instrumentId: string) =>
    dispatch(fetchFacilityCycles(instrumentId)),
});

const mapStateToProps = (
  state: StateType
): ISISFacilityCyclesTableStoreProps => {
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
)(ISISFacilityCyclesTable);
