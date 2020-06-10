import React from 'react';

import CardView from '../cardView.component';
import { IndexRange } from 'react-virtualized';
import { ViewsType, StateType } from 'datagateway-common/lib/state/app.types';
import {
  Entity,
  fetchInvestigations,
  fetchInvestigationCount,
  fetchInvestigationDetails,
  Investigation,
  tableLink,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';

interface DLSVisitsCVProps {
  proposalName: string;
}

interface DLSVisitsCVDispatchProps {
  fetchData: (proposalName: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (proposalName: string) => Promise<void>;
  fetchDetails: (investigationId: number) => Promise<void>;
}

interface DLSVisitsCVStateProps {
  data: Entity[];
  totalDatCount: number;
  view: ViewsType;
}

type DLSVisitsCVCombinedProps = DLSVisitsCVProps &
  DLSVisitsCVDispatchProps &
  DLSVisitsCVStateProps;

const DLSVisitsCardView = (
  props: DLSVisitsCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDatCount,
    fetchData,
    fetchCount,
    proposalName,
    view,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);

  React.useEffect(() => {
    // Fetch count.
    if (!fetchedCount) {
      fetchCount(proposalName);
      setFetchedCount(true);
    }
  }, [proposalName, fetchedCount, fetchCount, setFetchedCount]);

  return (
    <CardView
      data={data}
      totalDataCount={totalDatCount}
      loadData={params => fetchData(proposalName, params)}
      title={{
        dataKey: 'VISIT_ID',
        content: (investigation: Investigation) =>
          tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigation.ID}/dataset`,
            investigation.VISIT_ID,
            view
          ),
      }}
      description={{ dataKey: 'SUMMARY' }}
      furtherInformation={[
        // TODO: Show nested object.
        {
          label: 'Beamline',
          dataKey: 'INVESTIGATIONINSTRUMENT[0].INSTRUMENT.NAME',
        },
        {
          label: 'Dataset Count',
          dataKey: 'DATASET_COUNT',
        },
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
): DLSVisitsCVDispatchProps => ({
  fetchData: (proposalName: string, offsetParams: IndexRange) =>
    dispatch(
      fetchInvestigations({
        offsetParams,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({ NAME: { eq: proposalName } }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify({
              INVESTIGATIONINSTRUMENT: 'INSTRUMENT',
            }),
          },
        ],
        getDatasetCount: true,
      })
    ),
  fetchCount: (proposalName: string) =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({ NAME: { eq: proposalName } }),
        },
      ])
    ),
  fetchDetails: (investigationId: number) =>
    dispatch(fetchInvestigationDetails(investigationId)),
});

const mapStateToProps = (state: StateType): DLSVisitsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDatCount: state.dgcommon.totalDataCount,
    view: state.dgcommon.query.view,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSVisitsCardView);
