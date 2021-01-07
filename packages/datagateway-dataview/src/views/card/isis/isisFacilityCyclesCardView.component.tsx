import React from 'react';
import CardView from '../cardView.component';
import {
  Entity,
  fetchFacilityCycleCount,
  fetchFacilityCycles,
  tableLink,
  FacilityCycle,
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
import { CalendarToday } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISFacilityCyclesCVProps {
  instrumentId: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISFacilityCyclesCVStateProps {
  data: Entity[];
  totalDataCount: number;
  view: ViewsType;
  filters: FiltersType;
  loading: boolean;
  query: QueryParams;
  sort: SortType;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISFacilityCyclesCVDispatchProps {
  fetchData: (instrumentId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (instrumentId: number) => Promise<void>;
  clearData: () => Action;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
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
    loading,
    query,
    sort,
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
    if (!fetchedCount) {
      fetchCount(parseInt(instrumentId));
      setFetchedCount(true);
    }
  }, [instrumentId, data, fetchedCount, fetchCount, setFetchedCount]);

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={(params) => fetchData(parseInt(instrumentId), params)}
      loadCount={() => fetchCount(parseInt(instrumentId))}
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
        label: t('facilitycycles.name'),
        dataKey: 'NAME',
        content: (facilityCycle: FacilityCycle) =>
          tableLink(
            `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycle.ID}/investigation`,
            facilityCycle.NAME,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('facilitycycles.description'),
        dataKey: 'DESCRIPTION',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <CalendarToday />,
          label: t('facilitycycles.start_date'),
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('facilitycycles.end_date'),
          dataKey: 'ENDDATE',
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
  clearData: () => dispatch(clearData()),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
});

const mapStateToProps = (state: StateType): ISISFacilityCyclesCVStateProps => {
  return {
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
)(ISISFacilityCyclesCardView);
