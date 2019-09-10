import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Order,
  Filter,
  Entity,
  Investigation,
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
  fetchInvestigationDetails,
  fetchISISInvestigations,
} from '../../state/actions';
import InvestigationDetailsPanel from '../detailsPanels/investigationDetailsPanel.component';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISInvestigationsTableProps {
  instrumentId: string;
  facilityCycleId: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISInvestigationsTableStoreProps {
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
interface ISISInvestigationsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (instrumentId: string, facilityCycleId: string) => Promise<void>;
  fetchDetails: (investigationId: number) => Promise<void>;
}

type ISISInvestigationsTableCombinedProps = ISISInvestigationsTableProps &
  ISISInvestigationsTableStoreProps &
  ISISInvestigationsTableDispatchProps;

const ISISInvestigationsTable = (
  props: ISISInvestigationsTableCombinedProps
): React.ReactElement => {
  const {
    data,
    fetchData,
    sort,
    sortTable,
    filters,
    filterTable,
    instrumentId,
    facilityCycleId,
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
    fetchData(instrumentId, facilityCycleId);
  }, [fetchData, instrumentId, facilityCycleId, sort, filters]);

  const urlPrefix = `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation`;

  return (
    <Paper style={{ height: window.innerHeight, width: '100%' }}>
      <Table
        data={data}
        sort={sort}
        onSort={sortTable}
        detailsPanel={(rowData, detailsPanelResize) => {
          return (
            <InvestigationDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
              fetchDetails={props.fetchDetails}
            />
          );
        }}
        columns={[
          {
            label: 'Title',
            dataKey: 'TITLE',
            cellContentRenderer: (props: TableCellProps) => {
              const investigationData = props.rowData as Investigation;
              return tableLink(
                `${urlPrefix}/${investigationData.ID}/dataset`,
                investigationData.TITLE
              );
            },
            filterComponent: textFilter,
          },
          {
            label: 'Visit Id',
            dataKey: 'VISIT_ID',
            cellContentRenderer: (props: TableCellProps) => {
              const investigationData = props.rowData as Investigation;
              return tableLink(
                `${urlPrefix}/${investigationData.ID}/dataset`,
                investigationData.VISIT_ID
              );
            },
            filterComponent: textFilter,
          },
          {
            label: 'RB Number',
            dataKey: 'NAME',
            cellContentRenderer: (props: TableCellProps) => {
              const investigationData = props.rowData as Investigation;
              return tableLink(
                `${urlPrefix}/${investigationData.ID}/dataset`,
                investigationData.NAME
              );
            },
            filterComponent: textFilter,
          },
          {
            label: 'DOI',
            dataKey: 'STUDYINVESTIGATION.STUDY.PID',
            cellContentRenderer: (props: TableCellProps) => {
              const investigationData = props.rowData as Investigation;
              if (
                investigationData.STUDYINVESTIGATION &&
                investigationData.STUDYINVESTIGATION[0].STUDY
              ) {
                return tableLink(
                  `${urlPrefix}/${investigationData.ID}/dataset`,
                  investigationData.STUDYINVESTIGATION[0].STUDY.PID
                );
              } else {
                return '';
              }
            },
            filterComponent: textFilter,
          },
          {
            label: 'Size',
            dataKey: 'SIZE',
            disableSort: true,
          },
          {
            label: 'Instrument',
            dataKey: 'INVESTIGATIONINSTRUMENT.INSTRUMENT.FULLNAME',
            cellContentRenderer: (props: TableCellProps) => {
              const investigationData = props.rowData as Investigation;
              if (
                investigationData.INVESTIGATIONINSTRUMENT &&
                investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
              ) {
                return investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
                  .FULLNAME;
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
): ISISInvestigationsTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (instrumentId: string, facilityCycleId: string) =>
    dispatch(fetchISISInvestigations(instrumentId, facilityCycleId)),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
});

const mapStateToProps = (
  state: StateType
): ISISInvestigationsTableStoreProps => {
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
)(ISISInvestigationsTable);
