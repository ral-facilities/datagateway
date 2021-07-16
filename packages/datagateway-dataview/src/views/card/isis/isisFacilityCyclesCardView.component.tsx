import React from 'react';
import {
  CardView,
  Entity,
  fetchFacilityCycleCount,
  fetchFacilityCycles,
  tableLink,
  FacilityCycle,
  TextColumnFilter,
  TextFilter,
  DateColumnFilter,
  Filter,
  DateFilter,
  pushPageFilter,
  pushPageNum,
  pushPageSort,
  pushPageResults,
  pushQuery,
  readURLQuery,
  Order,
  QueryParams,
  StateType,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { CalendarToday } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { RouterLocation } from 'connected-react-router';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISFacilityCyclesCVProps {
  instrumentId: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISFacilityCyclesCVStateProps {
  data: Entity[];
  totalDataCount: number;
  location: RouterLocation<unknown>;
  loadedData: boolean;
  loadedCount: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISFacilityCyclesCVDispatchProps {
  fetchData: (instrumentId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (instrumentId: number) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushResults: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

type ISISFacilityCyclesCVCombinedProps = ISISFacilityCyclesCVDispatchProps &
  ISISFacilityCyclesCVStateProps &
  ISISFacilityCyclesCVProps;

const ISISFacilityCyclesCardView = (
  props: ISISFacilityCyclesCVCombinedProps
): React.ReactElement => {
  const {
    instrumentId,
    data,
    totalDataCount,
    location,
    loadedData,
    loadedCount,
    fetchData,
    fetchCount,
    pushFilters,
    pushPage,
    pushSort,
    pushResults,
    pushQuery,
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

  const loadCount = React.useCallback(
    () => fetchCount(parseInt(instrumentId)),
    [fetchCount, instrumentId]
  );
  const loadData = React.useCallback(
    (params) => fetchData(parseInt(instrumentId), params),
    [fetchData, instrumentId]
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
        label: t('facilitycycles.name'),
        dataKey: 'name',
        content: (facilityCycle: FacilityCycle) =>
          tableLink(
            `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycle.id}/investigation`,
            facilityCycle.name,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('facilitycycles.description'),
        dataKey: 'description',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <CalendarToday />,
          label: t('facilitycycles.start_date'),
          dataKey: 'startDate',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('facilitycycles.end_date'),
          dataKey: 'endDate',
          filterComponent: dateFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ISISFacilityCyclesCVDispatchProps => ({
  fetchData: (instrumentId: number, offsetParams: IndexRange) =>
    dispatch(fetchFacilityCycles(instrumentId, offsetParams)),
  fetchCount: (instrumentId: number) =>
    dispatch(fetchFacilityCycleCount(instrumentId)),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): ISISFacilityCyclesCVStateProps => {
  return {
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
)(ISISFacilityCyclesCardView);
