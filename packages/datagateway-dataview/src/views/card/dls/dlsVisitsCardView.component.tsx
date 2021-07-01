import React from 'react';

import { IndexRange } from 'react-virtualized';
import {
  StateType,
  FilterDataType,
  QueryParams,
} from 'datagateway-common/lib/state/app.types';
import {
  CardView,
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
  TextFilter,
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
import { useTranslation } from 'react-i18next';

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
  loadedData: boolean;
  loadedCount: boolean;
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
    loadedData,
    loadedCount,
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
  const [t] = useTranslation();

  React.useEffect(() => {
    fetchTypeFilter(proposalName);
  }, [proposalName, fetchTypeFilter]);

  const typeFilteredItems = React.useMemo(
    () => ('type.id' in filterData ? filterData['type.id'] : []),
    [filterData]
  );

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as TextFilter}
      onChange={(value: { value?: string | number; type: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
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
      loadedData={loadedData}
      loadedCount={loadedCount}
      title={{
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        content: (investigation: Investigation) =>
          tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigation.id}/dataset`,
            investigation.visitId,
            query.view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('investigations.details.summary'),
        dataKey: 'summary',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Assessment />,
          label: t('investigations.instrument'),
          dataKey: 'investigationInstruments[0].instrument.name',
          filterComponent: textFilter,
        },
        {
          icon: <ConfirmationNumber />,
          label: t('investigations.dataset_count'),
          dataKey: 'datasetCount',
          disableSort: true,
        },
        {
          icon: <CalendarToday />,
          label: t('investigations.start_date'),
          dataKey: 'startDate',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('investigations.end_date'),
          dataKey: 'endDate',
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
          label: t('investigations.type.id'),
          dataKey: 'type.id',
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
            filterValue: JSON.stringify({ name: { eq: proposalName } }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify({
              investigationInstruments: 'instrument',
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
          filterValue: JSON.stringify({ name: { eq: proposalName } }),
        },
      ])
    ),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
  fetchSize: (investigationId: number) =>
    dispatch(fetchInvestigationSize(investigationId)),
  fetchTypeFilter: (proposalName: string) =>
    dispatch(
      fetchFilter('investigation', 'type.id', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ name: { eq: proposalName } }),
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
    loadedData: state.dgcommon.loadedData,
    loadedCount: state.dgcommon.loadedCount,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSVisitsCardView);
