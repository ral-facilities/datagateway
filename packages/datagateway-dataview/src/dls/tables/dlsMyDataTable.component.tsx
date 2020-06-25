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
  fetchInvestigationSize,
  sortTable,
  filterTable,
  clearTable,
  readSciGatewayToken,
} from 'datagateway-common';
import { StateType } from '../../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import VisitDetailsPanel from '../detailsPanels/visitDetailsPanel.component';
import useAfterMountEffect from '../../utils';

interface DLSMyDataTableStoreProps {
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

interface DLSMyDataTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  fetchData: (username: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (username: string) => Promise<void>;
  clearTable: () => Action;
  fetchDetails: (investigationId: number) => Promise<void>;
  fetchSize: (investigationId: number) => Promise<void>;
}

type DLSMyDataTableCombinedProps = DLSMyDataTableStoreProps &
  DLSMyDataTableDispatchProps;

const DLSMyDataTable = (
  props: DLSMyDataTableCombinedProps
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

  const username = readSciGatewayToken().username || '';

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
    sortTable('STARTDATE', 'desc');
    filterTable('STARTDATE', {
      endDate: `${new Date(Date.now()).toISOString().split('T')[0]}`,
    });
  }, [clearTable, sortTable, filterTable]);

  useAfterMountEffect(() => {
    fetchCount(username);
    fetchData(username, { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, sort, filters, username]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(username, params)}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <VisitDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            fetchDetails={props.fetchDetails}
            fetchSize={props.fetchSize}
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
              `/browse/proposal/${investigationData.NAME}/investigation/${investigationData.ID}/dataset`,
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
              `/browse/proposal/${investigationData.NAME}/investigation/${investigationData.ID}/dataset`,
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
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSMyDataTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (username: string, offsetParams: IndexRange) =>
    dispatch(
      fetchInvestigations({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'INVESTIGATIONUSER.USER.NAME': { eq: username },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              {
                INVESTIGATIONINSTRUMENT: 'INSTRUMENT',
              },
              { INVESTIGATIONUSER: 'USER_' },
            ]),
          },
        ],
        getDatasetCount: true,
      })
    ),
  fetchCount: (username: string) =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'INVESTIGATIONUSER.USER.NAME': { eq: username },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify({ INVESTIGATIONUSER: 'USER_' }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
  fetchSize: (investigationId: number) =>
    dispatch(fetchInvestigationSize(investigationId)),
});

const mapStateToProps = (state: StateType): DLSMyDataTableStoreProps => {
  return {
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSMyDataTable);
