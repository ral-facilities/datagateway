import React from 'react';
import {
  CardView,
  Entity,
  tableLink,
  TextColumnFilter,
  TextFilter,
  DateColumnFilter,
  Filter,
  DateFilter,
  pushPageFilter,
  pushPageNum,
  pushPageSort,
  pushPageResults,
  fetchAllIds,
  fetchStudies,
  fetchStudyCount,
  StudyInvestigation,
  pushQuery,
  readURLQuery,
  Order,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { QueryParams, StateType } from 'datagateway-common/lib/state/app.types';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { CalendarToday, Public } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { RouterLocation } from 'connected-react-router';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISStudiesCVProps {
  instrumentId: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISStudiesCVStateProps {
  data: Entity[];
  totalDataCount: number;
  allIds: number[];
  loadedData: boolean;
  loadedCount: boolean;
  location: RouterLocation<unknown>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISStudiesCVDispatchProps {
  fetchIds: (instrumentId: number) => Promise<void>;
  fetchData: (allIds: number[], offsetParams: IndexRange) => Promise<void>;
  fetchCount: (allIds: number[]) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushResults: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

type ISISStudiesCVCombinedProps = ISISStudiesCVDispatchProps &
  ISISStudiesCVStateProps &
  ISISStudiesCVProps;

const ISISStudiesCardView = (
  props: ISISStudiesCVCombinedProps
): React.ReactElement => {
  const {
    instrumentId,
    allIds,
    data,
    totalDataCount,
    location,
    loadedData,
    loadedCount,
    fetchIds,
    fetchData,
    fetchCount,
    pushFilters,
    pushPage,
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

  const pathRoot = 'browseStudyHierarchy';
  const instrumentChild = 'study';
  const [allIdsCleared, setAllIdsCleared] = React.useState(false);

  React.useEffect(() => {
    if (allIds.length === 0) setAllIdsCleared(true);
  }, [setAllIdsCleared, allIds]);

  React.useEffect(() => {
    if (allIdsCleared) fetchIds(parseInt(instrumentId));
  }, [fetchIds, instrumentId, allIdsCleared]);

  const loadCount = React.useCallback(() => {
    if (allIdsCleared && allIds.length > 0) return fetchCount(allIds);
  }, [fetchCount, allIds, allIdsCleared]);

  const loadData = React.useCallback(
    (params) => {
      if (allIdsCleared && allIds.length > 0) return fetchData(allIds, params);
    },
    [fetchData, allIds, allIdsCleared]
  );

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={loadData}
      loadCount={loadCount}
      query={query}
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
        label: t('studies.name'),
        dataKey: 'study.name',
        content: (studyInvestigation: StudyInvestigation) =>
          tableLink(
            `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${studyInvestigation.study?.id}`,
            studyInvestigation.study?.name,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('studies.description'),
        dataKey: 'study.description',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Public />,
          label: t('studies.pid'),
          dataKey: 'study.pid',
          filterComponent: textFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('studies.start_date'),
          dataKey: 'study.startDate',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('studies.end_date'),
          dataKey: 'study.endDate',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISStudiesCVDispatchProps => ({
  fetchIds: (instrumentId: number) =>
    dispatch(
      fetchAllIds('investigation', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigationInstruments.instrument.id': { eq: instrumentId },
          }),
        },
      ])
    ),
  fetchData: (allIds: number[], offsetParams: IndexRange) =>
    dispatch(
      fetchStudies({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'investigation.id': { in: allIds },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify('investigation'),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify('study'),
          },
        ],
      })
    ),
  fetchCount: (allIds: number[]) =>
    dispatch(
      fetchStudyCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigation.id': { in: allIds },
          }),
        },
        {
          filterType: 'include',
          filterValue: JSON.stringify('investigation'),
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

const mapStateToProps = (state: StateType): ISISStudiesCVStateProps => {
  return {
    allIds: state.dgcommon.allIds,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    location: state.router.location,
    loadedData: state.dgcommon.loadedData,
    loadedCount: state.dgcommon.loadedCount,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISStudiesCardView);
