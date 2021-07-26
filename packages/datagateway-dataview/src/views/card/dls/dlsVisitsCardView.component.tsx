import React from 'react';

import { IndexRange } from 'react-virtualized';
import {
  CardView,
  Entity,
  fetchInvestigations,
  fetchInvestigationCount,
  Investigation,
  tableLink,
  fetchFilter,
  Filter,
  pushPageFilter,
  DateFilter,
  DateColumnFilter,
  TextColumnFilter,
  TextFilter,
  pushPageNum,
  pushQuery,
  pushPageSort,
  pushPageResults,
  readURLQuery,
  Order,
  StateType,
  FilterDataType,
  QueryParams,
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
import { RouterLocation } from 'connected-react-router';

interface DLSVisitsCVProps {
  proposalName: string;
}

interface DLSVisitsCVDispatchProps {
  fetchData: (proposalName: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (proposalName: string) => Promise<void>;
  fetchTypeFilter: (proposalName: string) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushResults: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

interface DLSVisitsCVStateProps {
  data: Entity[];
  totalDatCount: number;
  location: RouterLocation<unknown>;
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
    location,
    filterData,
    proposalName,
    loadedData,
    loadedCount,
    fetchData,
    fetchCount,
    fetchTypeFilter,
    pushPage,
    pushFilters,
    pushQuery,
    pushSort,
    pushResults,
  } = props;

  const [t] = useTranslation();

  const { page, results } = React.useMemo(() => readURLQuery(location), [
    location,
  ]);
  const query = React.useMemo(() => readURLQuery(location), [location]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filters = React.useMemo(() => readURLQuery(location).filters, [
    location.query.filters,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sort = React.useMemo(() => readURLQuery(location).sort, [
    location.query.sort,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const view = React.useMemo(() => readURLQuery(location).view, [
    location.query.view,
  ]);

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
      onSort={pushSort}
      onResultsChange={pushResults}
      loadedData={loadedData}
      loadedCount={loadedCount}
      filters={filters}
      sort={sort}
      page={page}
      results={results}
      title={{
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        content: (investigation: Investigation) =>
          tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigation.id}/dataset`,
            investigation.visitId,
            view
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
          icon: Assessment,
          label: t('investigations.instrument'),
          dataKey: 'investigationInstruments[0].instrument.name',
          filterComponent: textFilter,
        },
        {
          icon: ConfirmationNumber,
          label: t('investigations.dataset_count'),
          dataKey: 'datasetCount',
          disableSort: true,
        },
        {
          icon: CalendarToday,
          label: t('investigations.start_date'),
          dataKey: 'startDate',
          filterComponent: dateFilter,
        },
        {
          icon: CalendarToday,
          label: t('investigations.end_date'),
          dataKey: 'endDate',
          filterComponent: dateFilter,
        },
      ]}
      moreInformation={(investigation: Investigation) => (
        <VisitDetailsPanel rowData={investigation} />
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
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): DLSVisitsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDatCount: state.dgcommon.totalDataCount,
    filterData: state.dgcommon.filterData,
    location: state.router.location,
    loadedData: state.dgcommon.loadedData,
    loadedCount: state.dgcommon.loadedCount,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSVisitsCardView);
