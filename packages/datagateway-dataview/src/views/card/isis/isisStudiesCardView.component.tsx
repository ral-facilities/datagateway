import React from 'react';
import CardView from '../cardView.component';
import {
  Entity,
  tableLink,
  TextColumnFilter,
  DateColumnFilter,
  Filter,
  DateFilter,
  pushPageFilter,
  pushPageNum,
  fetchAllIds,
  fetchStudies,
  fetchStudyCount,
  StudyInvestigation,
  pushQuery,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { QueryParams, StateType } from 'datagateway-common/lib/state/app.types';
import { AnyAction } from 'redux';
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
  query: QueryParams;
  allIds: number[];
  loadedData: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISStudiesCVDispatchProps {
  fetchIds: (instrumentId: number) => Promise<void>;
  fetchData: (allIds: number[], offsetParams: IndexRange) => Promise<void>;
  fetchCount: (allIds: number[]) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
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
    query,
    loadedData,
    fetchIds,
    fetchData,
    fetchCount,
    pushFilters,
    pushPage,
    pushQuery,
  } = props;

  const filters = query.filters;
  const [t] = useTranslation();

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
      loadedData={loadedData}
      title={{
        label: t('studies.name'),
        dataKey: 'STUDY.NAME',
        content: (studyInvestigation: StudyInvestigation) =>
          tableLink(
            `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${studyInvestigation.STUDY?.ID}/investigation`,
            studyInvestigation.STUDY?.NAME,
            query.view
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

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): ISISStudiesCVStateProps => {
  return {
    allIds: state.dgcommon.allIds,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    query: state.dgcommon.query,
    loadedData: state.dgcommon.loadedData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISStudiesCardView);
