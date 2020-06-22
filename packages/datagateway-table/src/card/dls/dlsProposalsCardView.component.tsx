import React from 'react';
import CardView from '../cardView.component';
import { IndexRange } from 'react-virtualized';
import {
  Entity,
  fetchInvestigationCount,
  fetchInvestigations,
  Investigation,
  tableLink,
} from 'datagateway-common';
import { ViewsType, StateType } from 'datagateway-common/lib/state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';

interface DLSProposalsCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
}

interface DLSProposalsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  view: ViewsType;
}

type DLSProposalsCVCombinedProps = DLSProposalsCVDispatchProps &
  DLSProposalsCVStateProps;

const DLSProposalsCardView = (
  props: DLSProposalsCVCombinedProps
): React.ReactElement => {
  const { data, totalDataCount, fetchData, fetchCount, view } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);

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
        dataKey: 'TITLE',
        content: (investigation: Investigation) =>
          tableLink(
            `/browse/proposal/${investigation.NAME}/investigation`,
            investigation.TITLE,
            view
          ),
      }}
      // TODO: Is NAME correct here for description/or other way wrong?
      description={{ dataKey: 'NAME' }}
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
});

const mapStateToProps = (state: StateType): DLSProposalsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    view: state.dgcommon.query.view,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DLSProposalsCardView);
