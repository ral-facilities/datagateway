import React from 'react';
import CardView from '../cardView.component';
import { IndexRange } from 'react-virtualized';
import {
  Entity,
  fetchInvestigationCount,
  fetchInvestigations,
  Investigation,
  tableLink,
  pushPageFilter,
  Filter,
  FiltersType,
  TextColumnFilter,
} from 'datagateway-common';
import { ViewsType, StateType } from 'datagateway-common/lib/state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';

interface DLSProposalsCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
}

interface DLSProposalsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  view: ViewsType;
  filters: FiltersType;
}

type DLSProposalsCVCombinedProps = DLSProposalsCVDispatchProps &
  DLSProposalsCVStateProps;

const DLSProposalsCardView = (
  props: DLSProposalsCVCombinedProps
): React.ReactElement => {
  const {
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
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
    />
  );

  React.useEffect(() => {
    // Fetch count.
    if (!fetchedCount) {
      fetchCount();
      setFetchedCount(true);
    }
  }, [fetchedCount, fetchCount, setFetchedCount]);

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      loadData={fetchData}
      loadCount={fetchCount}
      title={{
        label: 'Title',
        dataKey: 'TITLE',
        content: (investigation: Investigation) =>
          tableLink(
            `/browse/proposal/${investigation.NAME}/investigation`,
            investigation.TITLE,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: 'Name',
        dataKey: 'NAME',
        filterComponent: textFilter,
      }}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSProposalsCVDispatchProps => ({
  fetchData: (offsetParams: IndexRange) =>
    dispatch(
      fetchInvestigations({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'distinct',
            filterValue: JSON.stringify(['NAME', 'TITLE']),
          },
        ],
      })
    ),
  fetchCount: () =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'distinct',
          filterValue: JSON.stringify(['NAME', 'TITLE']),
        },
      ])
    ),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

const mapStateToProps = (state: StateType): DLSProposalsCVStateProps => {
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
)(DLSProposalsCardView);
