import {
  DateColumnFilter,
  DateFilter,
  Entity,
  fetchFacilityCycleCount,
  fetchFacilityCycles,
  Filter,
  FiltersType,
  Order,
  pushPageFilter,
  pushPageSort,
  SortType,
  Table,
  tableLink,
  TextColumnFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';

interface ISISFacilityCyclesTableProps {
  instrumentId: string;
}

interface ISISFacilityCyclesTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
}

interface ISISFacilityCyclesTableDispatchProps {
  // sortTable: (column: string, order: Order | null) => Action;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  // filterTable: (column: string, filter: Filter | null) => Action;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (instrumentId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (instrumentId: number) => Promise<void>;
  // clearTable: () => Action;
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
    // clearTable,
    sort,
    // sortTable,
    pushSort,
    filters,
    // filterTable,
    pushFilters,
    instrumentId,
    loading,
  } = props;

  const [t] = useTranslation();

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

  // React.useEffect(() => {
  //   clearTable();
  // }, [clearTable]);

  // useAfterMountEffect(() => {
  //   fetchCount(parseInt(instrumentId));
  //   fetchData(parseInt(instrumentId), { startIndex: 0, stopIndex: 49 });
  // }, [fetchData, instrumentId, sort, filters]);

  React.useEffect(() => {
    fetchCount(parseInt(instrumentId));
    fetchData(parseInt(instrumentId), { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, instrumentId, sort, filters]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(parseInt(instrumentId), params)}
      totalRowCount={totalDataCount}
      sort={sort}
      // onSort={sortTable}
      onSort={pushSort}
      columns={[
        {
          label: t('facilitycycles.name'),
          dataKey: 'NAME',
          cellContentRenderer: (props: TableCellProps) =>
            tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${props.rowData.ID}/investigation`,
              props.rowData.NAME
            ),
          filterComponent: textFilter,
        },
        {
          label: t('facilitycycles.description'),
          dataKey: 'DESCRIPTION',
          filterComponent: textFilter,
        },
        {
          label: t('facilitycycles.start_date'),
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
        },
        {
          label: t('facilitycycles.end_date'),
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
  // sortTable: (column: string, order: Order | null) =>
  //   dispatch(sortTable(column, order)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  // filterTable: (column: string, filter: Filter | null) =>
  //   dispatch(filterTable(column, filter)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  fetchData: (instrumentId: number, offsetParams: IndexRange) =>
    dispatch(fetchFacilityCycles(instrumentId, offsetParams)),
  fetchCount: (instrumentId: number) =>
    dispatch(fetchFacilityCycleCount(instrumentId)),
  // clearTable: () => dispatch(clearTable()),
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
