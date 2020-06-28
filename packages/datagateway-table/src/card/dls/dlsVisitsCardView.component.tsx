import React from 'react';

import CardView from '../cardView.component';
import { IndexRange } from 'react-virtualized';
import {
  ViewsType,
  StateType,
  FilterDataType,
} from 'datagateway-common/lib/state/app.types';
import {
  Entity,
  fetchInvestigations,
  fetchInvestigationCount,
  fetchInvestigationDetails,
  Investigation,
  tableLink,
  fetchFilter,
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
  // TODO: Make use of fetch details and put in optional items.
  fetchDetails: (investigationId: number) => Promise<void>;
  fetchTypeFilter: (proposalName: string) => Promise<void>;
}

interface DLSVisitsCVStateProps {
  data: Entity[];
  totalDatCount: number;
  filterData: FilterDataType;
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
    fetchTypeFilter,
    filterData,
    proposalName,
    view,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [fetchedFilters, setFetchedFilters] = React.useState(false);

  const typeFilteredItems = React.useMemo(
    () => ('TYPE_ID' in filterData ? filterData['TYPE_ID'] : []),
    [filterData]
  );

  React.useEffect(() => {
    // Fetch count.
    if (!fetchedCount) {
      fetchCount(proposalName);
      setFetchedCount(true);
    }

    if (!fetchedFilters) {
      fetchTypeFilter(proposalName);
      setFetchedFilters(true);
    }
  }, [
    proposalName,
    fetchedCount,
    fetchCount,
    setFetchedCount,
    fetchTypeFilter,
    fetchedFilters,
  ]);

  return (
    <CardView
      data={data}
      totalDataCount={totalDatCount}
      loadData={params => fetchData(proposalName, params)}
      loadCount={() => fetchCount(proposalName)}
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
      information={[
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
      cardFilters={[
        {
          label: 'Type ID',
          dataKey: 'TYPE_ID',
          filterItems: typeFilteredItems,
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
  fetchTypeFilter: (proposalName: string) =>
    dispatch(
      fetchFilter('investigation', 'TYPE_ID', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ NAME: { eq: proposalName } }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): DLSVisitsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDatCount: state.dgcommon.totalDataCount,
    filterData: state.dgcommon.filterData,
    view: state.dgcommon.query.view,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSVisitsCardView);
