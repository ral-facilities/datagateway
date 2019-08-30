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
  fetchInvestigationDetails,
} from '../../state/actions';
import VisitDetailsPanel from '../detailsPanels/visitDetailsPanel.component';

interface DLSVisitsTableProps {
  proposalName: string;
}

interface DLSVisitsTableStoreProps {
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

interface DLSVisitsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (proposalName: string) => Promise<void>;
  fetchDetails: (investigationId: number) => Promise<void>;
}

type DLSVisitsTableCombinedProps = DLSVisitsTableProps &
  DLSVisitsTableStoreProps &
  DLSVisitsTableDispatchProps;

const DLSVisitsTable = (
  props: DLSVisitsTableCombinedProps
): React.ReactElement => {
  const {
    data,
    fetchData,
    sort,
    sortTable,
    filters,
    filterTable,
    proposalName,
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
    fetchData(proposalName);
  }, [fetchData, proposalName, sort, filters]);

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        detailsPanel={({ rowData, detailsPanelResize }) => {
          return (
            <VisitDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
              fetchDetails={props.fetchDetails}
            />
          );
        }}
        columns={[
          {
            label: 'Visit Id',
            dataKey: 'VISIT_ID',
            cellContentRenderer: (props: TableCellProps) => {
              const investigationData = props.rowData as Investigation;
              return tableLink(
                `/browse/proposal/${investigationData.NAME}/investigation/${investigationData.ID}`,
                investigationData.VISIT_ID
              );
            },
            filterComponent: textFilter,
          },
          {
            label: 'Dataset Count',
            dataKey: 'DATASET_COUNT',
          },
          {
            label: 'Beamline',
            dataKey: 'INVESTIGATIONINSTRUMENT.INSTRUMENT.NAME',
            cellContentRenderer: (props: TableCellProps) => {
              const investigationData = props.rowData as Investigation;
              if (
                investigationData.INVESTIGATIONINSTRUMENT &&
                investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
              ) {
                return investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
                  .NAME;
              } else {
                return '';
              }
            },
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
): DLSVisitsTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (proposalName: string) =>
    dispatch(fetchInvestigations({ NAME: proposalName })),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
});

const mapStateToProps = (state: StateType): DLSVisitsTableStoreProps => {
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
)(DLSVisitsTable);
