import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Order,
  Filter,
  Entity,
  Instrument,
  sortTable,
  filterTable,
  fetchInstruments,
  fetchInstrumentDetails,
  fetchInstrumentCount,
} from 'datagateway-common';
import { StateType } from '../../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { clearTable } from '../../state/actions';
import InstrumentDetailsPanel from '../detailsPanels/instrumentDetailsPanel.component';
import useAfterMountEffect from '../../utils';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISInstrumentsTableStoreProps {
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
interface ISISInstrumentsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  clearTable: () => Action;
  fetchDetails: (instrumentId: number) => Promise<void>;
}

type ISISInstrumentsTableCombinedProps = ISISInstrumentsTableStoreProps &
  ISISInstrumentsTableDispatchProps;

const ISISInstrumentsTable = (
  props: ISISInstrumentsTableCombinedProps
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
  }, [fetchData, fetchCount, sort, filters]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={fetchData}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <InstrumentDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            fetchDetails={props.fetchDetails}
          />
        );
      }}
      columns={[
        {
          label: 'Name',
          dataKey: 'FULLNAME',
          cellContentRenderer: (props: TableCellProps) => {
            const instrumentData = props.rowData as Instrument;
            return tableLink(
              `/browse/instrument/${instrumentData.ID}/facilityCycle`,
              instrumentData.FULLNAME || instrumentData.NAME
            );
          },
          filterComponent: textFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISInstrumentsTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (offsetParams: IndexRange) =>
    dispatch(fetchInstruments(offsetParams)),
  fetchCount: () => dispatch(fetchInstrumentCount()),
  clearTable: () => dispatch(clearTable()),
  fetchDetails: (instrumentId: number) =>
    dispatch(fetchInstrumentDetails(instrumentId)),
});

const mapStateToProps = (state: StateType): ISISInstrumentsTableStoreProps => {
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
)(ISISInstrumentsTable);
