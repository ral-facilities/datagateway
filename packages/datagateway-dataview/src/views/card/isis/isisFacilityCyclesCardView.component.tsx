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
} from 'datagateway-common';
import { IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import { StateType, ViewsType } from 'datagateway-common/lib/state/app.types';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISFacilityCyclesCVProps {
  instrumentId: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISFacilityCyclesCVStateProps {
  data: Entity[];
  totalDataCount: number;
  view: ViewsType;
  filters: FiltersType;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISFacilityCyclesCVDispatchProps {
  fetchData: (instrumentId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (instrumentId: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
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
    fetchData,
    fetchCount,
    view,
    filters,
    pushFilters,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as string}
      // onChange={(value: string) => filterTable(dataKey, value ? value : null)}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      value={filters[dataKey] as DateFilter}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        // filterTable(dataKey, value)
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
      title={{
        label: 'Name',
        dataKey: 'NAME',
        content: (facilityCycle: FacilityCycle) =>
          tableLink(
            `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycle.ID}/investigation`,
            facilityCycle.NAME,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{ dataKey: 'DESCRIPTION' }}
      information={[
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
): ISISFacilityCyclesCVDispatchProps => ({
  fetchData: (instrumentId: number, offsetParams: IndexRange) =>
    dispatch(fetchFacilityCycles(instrumentId, offsetParams)),
  fetchCount: (instrumentId: number) =>
    dispatch(fetchFacilityCycleCount(instrumentId)),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

const mapStateToProps = (state: StateType): ISISFacilityCyclesCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    view: state.dgcommon.query.view,
    filters: state.dgcommon.filters,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISFacilityCyclesCardView);
