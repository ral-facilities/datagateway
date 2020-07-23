import {
  DateColumnFilter,
  DateFilter,
  Entity,
  fetchInvestigationCount,
  fetchInvestigationDetails,
  fetchInvestigations,
  Filter,
  FiltersType,
  Investigation,
  Order,
  pushPageFilter,
  fetchInvestigationSize,
  readSciGatewayToken,
  Table,
  tableLink,
  TextColumnFilter,
  pushPageSort,
  SortType,
} from 'datagateway-common';
import React from 'react';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';

interface DLSMyDataTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
}

interface DLSMyDataTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;

  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (username: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (username: string) => Promise<void>;

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
    sort,
    pushSort,
    filters,
    pushFilters,
    loading,
  } = props;

  const username = readSciGatewayToken().username || '';

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as string}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  React.useEffect(() => {
    // Sort and filter by STARTDATE upon load.
    pushSort('STARTDATE', 'desc');
    pushFilters('STARTDATE', {
      endDate: `${new Date(Date.now()).toISOString().split('T')[0]}`,
    });
  }, [pushSort, pushFilters]);

  React.useEffect(() => {
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
      onSort={pushSort}
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
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
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
