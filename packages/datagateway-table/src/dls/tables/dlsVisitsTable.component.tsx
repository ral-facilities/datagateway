import React from 'react';
import {
  TextColumnFilter,
  Table,
  tableLink,
  Order,
  Filter,
  Investigation,
  Entity,
  DateColumnFilter,
  fetchInvestigations,
  fetchInvestigationDetails,
  fetchInvestigationCount,
} from 'datagateway-common';
import { Paper } from '@material-ui/core';
import { StateType } from '../../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { sortTable, filterTable, clearTable } from '../../state/actions';
import VisitDetailsPanel from '../detailsPanels/visitDetailsPanel.component';
import useAfterMountEffect from '../../utils';

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
  totalDataCount: number;
  loading: boolean;
  error: string | null;
}

interface DLSVisitsTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (proposalName: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (proposalName: string) => Promise<void>;
  clearTable: () => Action;
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
    totalDataCount,
    fetchData,
    fetchCount,
    clearTable,
    sort,
    sortTable,
    filters,
    filterTable,
    proposalName,
    loading,
  } = props;

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        filterTable(dataKey, value)
      }
    />
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount(proposalName);
    fetchData(proposalName, { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, sort, filters, proposalName]);

  return (
    <Paper style={{ height: 'calc(100vh - 64px)', width: '100%' }}>
      <Table
        loading={loading}
        data={data}
        loadMoreRows={params => fetchData(proposalName, params)}
        totalRowCount={totalDataCount}
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
                `/browse/proposal/${proposalName}/investigation/${investigationData.ID}/dataset`,
                investigationData.VISIT_ID
              );
            },
            filterComponent: textFilter,
          },
          {
            label: 'Dataset Count',
            dataKey: 'DATASET_COUNT',
            disableSort: true,
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
  fetchData: (proposalName: string, offsetParams: IndexRange) =>
    dispatch(
      fetchInvestigations({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({ NAME: { eq: proposalName } }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify({
              INVESTIGATIONINSTRUMENT: 'INSTRUMENT',
            }),
          },
        ],
        getDatasetCount: true,
      })
    ),
  fetchCount: (proposalName: string) =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({ NAME: { eq: proposalName } }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
});

const mapStateToProps = (state: StateType): DLSVisitsTableStoreProps => {
  return {
    sort: state.dgtable.sort,
    filters: state.dgtable.filters,
    data: state.dgtable.data,
    totalDataCount: state.dgtable.totalDataCount,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSVisitsTable);
