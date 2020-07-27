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
  fetchInvestigationSize,
  FiltersType,
  Filter,
  pushPageFilter,
  DateFilter,
  DateColumnFilter,
  TextColumnFilter,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';

interface DLSVisitsCVProps {
  proposalName: string;
}

interface DLSVisitsCVDispatchProps {
  fetchData: (proposalName: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (proposalName: string) => Promise<void>;
  fetchDetails: (investigationId: number) => Promise<void>;
  fetchSize: (investigationId: number) => Promise<void>;
  fetchTypeFilter: (proposalName: string) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
}

interface DLSVisitsCVStateProps {
  data: Entity[];
  totalDatCount: number;
  filterData: FilterDataType;
  view: ViewsType;
  filters: FiltersType;
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
    fetchDetails,
    fetchSize,
    filterData,
    proposalName,
    view,
    filters,
    pushFilters,
  } = props;

  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [fetchedFilters, setFetchedFilters] = React.useState(false);

  const typeFilteredItems = React.useMemo(
    () => ('TYPE_ID' in filterData ? filterData['TYPE_ID'] : []),
    [filterData]
  );

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
      loadData={(params) => fetchData(proposalName, params)}
      loadCount={() => fetchCount(proposalName)}
      title={{
        label: 'Visit ID',
        dataKey: 'VISIT_ID',
        content: (investigation: Investigation) =>
          tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigation.ID}/dataset`,
            investigation.VISIT_ID,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: 'Description',
        dataKey: 'SUMMARY',
        filterComponent: textFilter,
      }}
      information={[
        {
          label: 'Beamline',
          dataKey: 'INVESTIGATIONINSTRUMENT[0].INSTRUMENT.NAME',
          filterComponent: textFilter,
        },
        {
          label: 'Dataset Count',
          dataKey: 'DATASET_COUNT',
          disableSort: true,
        },
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
      moreInformation={(investigation: Investigation) => (
        <VisitDetailsPanel
          rowData={investigation}
          fetchDetails={fetchDetails}
          fetchSize={fetchSize}
        />
      )}
      customFilters={[
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
  fetchSize: (investigationId: number) =>
    dispatch(fetchInvestigationSize(investigationId)),
  fetchTypeFilter: (proposalName: string) =>
    dispatch(
      fetchFilter('investigation', 'TYPE_ID', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({ NAME: { eq: proposalName } }),
        },
      ])
    ),
  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
});

const mapStateToProps = (state: StateType): DLSVisitsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDatCount: state.dgcommon.totalDataCount,
    filterData: state.dgcommon.filterData,
    view: state.dgcommon.query.view,
    filters: state.dgcommon.filters,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSVisitsCardView);
