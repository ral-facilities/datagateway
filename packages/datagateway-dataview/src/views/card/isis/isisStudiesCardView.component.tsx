import React from 'react';
import CardView from '../cardView.component';
import {
  Entity,
  tableLink,
  TextColumnFilter,
  DateColumnFilter,
  Filter,
  FiltersType,
  DateFilter,
  pushPageFilter,
  SortType,
  Order,
  pushPageSort,
  clearData,
  pushPageNum,
  pushPageResults,
  fetchAllIds,
  fetchStudies,
  fetchStudyCount,
  StudyInvestigation,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import {
  QueryParams,
  StateType,
  ViewsType,
} from 'datagateway-common/lib/state/app.types';
import { Action, AnyAction } from 'redux';
import { connect } from 'react-redux';
import { CalendarToday, Public } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISStudiesCVProps {
  instrumentId: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISStudiesCVStateProps {
  data: Entity[];
  totalDataCount: number;
  view: ViewsType;
  filters: FiltersType;
  loading: boolean;
  query: QueryParams;
  sort: SortType;
  allIds: number[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISStudiesCVDispatchProps {
  fetchIds: (instrumentId: number) => Promise<void>;
  fetchData: (allIds: number[], offsetParams: IndexRange) => Promise<void>;
  fetchCount: (allIds: number[]) => Promise<void>;
  clearData: () => Action;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
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
    loading,
    query,
    sort,
    fetchIds,
    fetchData,
    fetchCount,
    view,
    filters,
    pushFilters,
    pushPage,
    pushResults,
    pushSort,
    clearData,
  } = props;

  const [t] = useTranslation();

  const [fetchedCount, setFetchedCount] = React.useState(false);

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
    fetchIds(parseInt(instrumentId));
  }, [fetchIds, instrumentId]);

  React.useEffect(() => {
    if (!fetchedCount) {
      fetchCount(allIds);
      setFetchedCount(true);
    }
  }, [fetchedCount, allIds, fetchCount, setFetchedCount]);

  const pathRoot = 'browseStudyHierarchy';
  const instrumentChild = 'study';

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={(params) => fetchData(allIds, params)}
      loadCount={() => fetchCount(allIds)}
      loading={loading}
      sort={sort}
      filters={filters}
      query={query}
      onPageChange={pushPage}
      onResultsChange={pushResults}
      onSort={pushSort}
      onFilter={pushFilters}
      clearData={clearData}
      title={{
        label: t('studies.name'),
        dataKey: 'STUDY.NAME',
        content: (studyInvestigation: StudyInvestigation) =>
          tableLink(
            `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${studyInvestigation.STUDY.ID}/investigation`,
            studyInvestigation.STUDY.NAME,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('studies.description'),
        dataKey: 'STUDY.DESCRIPTION',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Public />,
          label: t('studies.pid'),
          dataKey: 'STUDY.PID',
          filterComponent: textFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('studies.start_date'),
          dataKey: 'STUDY.STARTDATE',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('studies.end_date'),
          dataKey: 'STUDY.ENDDATE',
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
            'INVESTIGATIONINSTRUMENT.INSTRUMENT.ID': { eq: instrumentId },
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
              INVESTIGATION_ID: { in: allIds },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify('STUDY'),
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
            INVESTIGATION_ID: { in: allIds },
          }),
        },
      ])
    ),
  clearData: () => dispatch(clearData()),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
});

const mapStateToProps = (state: StateType): ISISStudiesCVStateProps => {
  return {
    allIds: state.dgcommon.allIds,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    view: state.dgcommon.query.view,
    filters: state.dgcommon.filters,
    loading: state.dgcommon.loading,
    query: state.dgcommon.query,
    sort: state.dgcommon.sort,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISStudiesCardView);
