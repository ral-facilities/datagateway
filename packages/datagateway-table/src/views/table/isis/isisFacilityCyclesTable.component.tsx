import {
  clearTable,
  DateColumnFilter,
  DateFilter,
  Entity,
  fetchFacilityCycleCount,
  fetchFacilityCycles,
  Filter,
  Order,
  pushPageFilter,
  sortTable,
  Table,
  tableLink,
  TextColumnFilter,
} from 'datagateway-common';
import React from 'react';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import useAfterMountEffect from '../../../utils';

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
  totalDataCount: number;
  loading: boolean;
  error: string | null;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISFacilityCyclesTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  // filterTable: (column: string, filter: Filter | null) => Action;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (instrumentId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (instrumentId: number) => Promise<void>;
  clearTable: () => Action;
}

type ISISFacilityCyclesTableCombinedProps = ISISFacilityCyclesTableProps &
  ISISFacilityCyclesTableStoreProps &
  ISISFacilityCyclesTableDispatchProps;

const ISISFacilityCyclesTable = (
  props: ISISFacilityCyclesTableCombinedProps
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
    // filterTable,
    pushFilters,
    instrumentId,
    loading,
  } = props;

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as string}
      // onChange={(value: string) => filterTable(dataKey, value ? value : null)}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        // filterTable(dataKey, value)
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount(parseInt(instrumentId));
    fetchData(parseInt(instrumentId), { startIndex: 0, stopIndex: 49 });
  }, [fetchData, instrumentId, sort, filters]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={params => fetchData(parseInt(instrumentId), params)}
      totalRowCount={totalDataCount}
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
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISFacilityCyclesTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  // filterTable: (column: string, filter: Filter | null) =>
  //   dispatch(filterTable(column, filter)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  fetchData: (instrumentId: number, offsetParams: IndexRange) =>
    dispatch(fetchFacilityCycles(instrumentId, offsetParams)),
  fetchCount: (instrumentId: number) =>
    dispatch(fetchFacilityCycleCount(instrumentId)),
  clearTable: () => dispatch(clearTable()),
});

const mapStateToProps = (
  state: StateType
): ISISFacilityCyclesTableStoreProps => {
  return {
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISFacilityCyclesTable);
