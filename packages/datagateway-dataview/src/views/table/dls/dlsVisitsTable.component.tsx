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
  Table,
  tableLink,
  TextColumnFilter,
  pushPageSort,
  fetchInvestigationSize,
  SortType,
} from 'datagateway-common';
import React from 'react';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';

import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';

interface DLSVisitsTableProps {
  proposalName: string;
}

interface DLSVisitsTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
}

interface DLSVisitsTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;

  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (proposalName: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (proposalName: string) => Promise<void>;

  fetchDetails: (investigationId: number) => Promise<void>;
  fetchSize: (investigationId: number) => Promise<void>;
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

    sort,

    pushSort,
    filters,

    pushFilters,
    proposalName,
    loading,
  } = props;

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
    fetchCount(proposalName);
    fetchData(proposalName, { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, sort, filters, proposalName]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(proposalName, params)}
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
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSVisitsTableDispatchProps => ({
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
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

  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
  fetchSize: (investigationId: number) =>
    dispatch(fetchInvestigationSize(investigationId)),
});

const mapStateToProps = (state: StateType): DLSVisitsTableStoreProps => {
  return {
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSVisitsTable);
