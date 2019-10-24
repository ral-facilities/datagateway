import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Order,
  Filter,
  Entity,
  Instrument,
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
  fetchInstruments,
  fetchInstrumentDetails,
} from '../../state/actions';
import InstrumentDetailsPanel from '../detailsPanels/instrumentDetailsPanel.component';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISInstrumentsTableStoreProps {
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
interface ISISInstrumentsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: () => Promise<void>;
  fetchDetails: (instrumentId: number) => Promise<void>;
}

type ISISInstrumentsTableCombinedProps = ISISInstrumentsTableStoreProps &
  ISISInstrumentsTableDispatchProps;

const ISISInstrumentsTable = (
  props: ISISInstrumentsTableCombinedProps
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
    </Paper>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISInstrumentsTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: () => dispatch(fetchInstruments()),
  fetchDetails: (instrumentId: number) =>
    dispatch(fetchInstrumentDetails(instrumentId)),
});

const mapStateToProps = (state: StateType): ISISInstrumentsTableStoreProps => {
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
)(ISISInstrumentsTable);
