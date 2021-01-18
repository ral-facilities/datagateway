import React from 'react';

import CardView from '../cardView.component';
import { IndexRange } from 'react-virtualized';
import {
  StateType,
  FilterDataType,
  QueryParams,
} from 'datagateway-common/lib/state/app.types';
import {
  Entity,
  fetchInvestigations,
  fetchInvestigationCount,
  fetchInvestigationDetails,
  Investigation,
  tableLink,
  fetchFilter,
  fetchInvestigationSize,
  Filter,
  pushPageFilter,
  DateFilter,
  DateColumnFilter,
  TextColumnFilter,
  pushPageNum,
  pushQuery,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';
import {
  Assessment,
  CalendarToday,
  ConfirmationNumber,
} from '@material-ui/icons';

interface DLSVisitsCVProps {
  proposalName: string;
}

interface DLSVisitsCVDispatchProps {
  fetchData: (proposalName: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (proposalName: string) => Promise<void>;
  fetchDetails: (investigationId: number) => Promise<void>;
  fetchSize: (investigationId: number) => Promise<void>;
  fetchTypeFilter: (proposalName: string) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

interface DLSVisitsCVStateProps {
  data: Entity[];
  totalDatCount: number;
  query: QueryParams;
  filterData: FilterDataType;
}

type DLSVisitsCVCombinedProps = DLSVisitsCVProps &
  DLSVisitsCVDispatchProps &
  DLSVisitsCVStateProps;

const DLSVisitsCardView = (
  props: DLSVisitsCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDatCount,
    query,
    filterData,
    proposalName,
    fetchData,
    fetchCount,
    fetchTypeFilter,
    fetchDetails,
    fetchSize,
    pushPage,
    pushFilters,
    pushQuery,
  } = props;

  const filters = query.filters;

  React.useEffect(() => {
    fetchTypeFilter(proposalName);
  }, [proposalName, fetchTypeFilter]);

  const typeFilteredItems = React.useMemo(
    () => ('TYPE_ID' in filterData ? filterData['TYPE_ID'] : []),
    [filterData]
  );

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

  const loadCount = React.useCallback(() => fetchCount(proposalName), [
    fetchCount,
    proposalName,
  ]);
  const loadData = React.useCallback(
    (params) => fetchData(proposalName, params),
    [fetchData, proposalName]
  );

  return (
    <CardView
      data={data}
      totalDataCount={totalDatCount}
      query={query}
      loadData={loadData}
      loadCount={loadCount}
      onPageChange={pushPage}
      onFilter={pushFilters}
      pushQuery={pushQuery}
      title={{
        label: 'Visit ID',
        dataKey: 'VISIT_ID',
        content: (investigation: Investigation) =>
          tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigation.ID}/dataset`,
            investigation.VISIT_ID,
            query.view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: 'Description',
        dataKey: 'SUMMARY',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Assessment />,
          label: 'Beamline',
          dataKey: 'INVESTIGATIONINSTRUMENT[0].INSTRUMENT.NAME',
          filterComponent: textFilter,
        },
        {
          icon: <ConfirmationNumber />,
          label: 'Dataset Count',
          dataKey: 'DATASET_COUNT',
          disableSort: true,
        },
        {
          icon: <CalendarToday />,
          label: 'Start Date',
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: 'End Date',
          dataKey: 'ENDDATE',
          filterComponent: dateFilter,
        },
      ]}
      moreInformation={(investigation: Investigation) => (
        <VisitDetailsPanel
          rowData={investigation}
          fetchDetails={fetchDetails}
          fetchSize={fetchSize}
        />
      )}
      customFilters={[
        {
          label: 'Type ID',
          dataKey: 'TYPE_ID',
          filterItems: typeFilteredItems,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSVisitsCVDispatchProps => ({
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
  fetchTypeFilter: (proposalName: string) =>
    dispatch(
      fetchFilter('investigation', 'TYPE_ID', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ NAME: { eq: proposalName } }),
        },
      ])
    ),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): DLSVisitsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDatCount: state.dgcommon.totalDataCount,
    filterData: state.dgcommon.filterData,
    query: state.dgcommon.query,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSVisitsCardView);
