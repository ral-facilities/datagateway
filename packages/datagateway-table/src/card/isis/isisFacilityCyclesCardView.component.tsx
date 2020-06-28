import React from 'react';
import CardView from '../cardView.component';
import {
  Entity,
  fetchFacilityCycleCount,
  fetchFacilityCycles,
  tableLink,
  FacilityCycle,
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
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface ISISFacilityCyclesCVDispatchProps {
  fetchData: (instrumentId: number, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (instrumentId: number) => Promise<void>;
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
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);

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
      loadData={params => fetchData(parseInt(instrumentId), params)}
      loadCount={() => fetchCount(parseInt(instrumentId))}
      title={{
        dataKey: 'NAME',
        content: (facilityCycle: FacilityCycle) =>
          tableLink(
            `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycle.ID}/investigation`,
            facilityCycle.NAME,
            view
          ),
      }}
      description={{ dataKey: 'DESCRIPTION' }}
      information={[
        {
          label: 'Start Date',
          dataKey: 'STARTDATE',
        },
        {
          label: 'End Date',
          dataKey: 'ENDDATE',
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
});

const mapStateToProps = (state: StateType): ISISFacilityCyclesCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    view: state.dgcommon.query.view,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ISISFacilityCyclesCardView);
