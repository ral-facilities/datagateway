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
  DateFilter,
  pushPageFilter,
  pushPageNum,
  pushQuery,
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { QueryParams, StateType } from 'datagateway-common/lib/state/app.types';
import { AnyAction } from 'redux';
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
  query: QueryParams;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ISISFacilityCyclesCVDispatchProps {
  fetchData: (instrumentId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (instrumentId: number) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
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
    query,
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
      title={{
        label: t('facilitycycles.name'),
        dataKey: 'NAME',
        content: (facilityCycle: FacilityCycle) =>
          tableLink(
            `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycle.ID}/investigation`,
            facilityCycle.NAME,
            query.view
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

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): ISISFacilityCyclesCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    query: state.dgcommon.query,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISFacilityCyclesCardView);
