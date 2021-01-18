import React from 'react';

import CardView from '../cardView.component';
import { IndexRange } from 'react-virtualized';
import {
  ViewsType,
  StateType,
  FilterDataType,
  QueryParams,
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
  TextFilter,
  SortType,
  Order,
  pushPageSort,
  pushPageNum,
  pushPageResults,
  clearData,
} from 'datagateway-common';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction, Action } from 'redux';
import { connect } from 'react-redux';
import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';
import {
  Assessment,
  CalendarToday,
  ConfirmationNumber,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

interface DLSVisitsCVProps {
  proposalName: string;
}

interface DLSVisitsCVDispatchProps {
  fetchData: (proposalName: string, offsetParams: IndexRange) => Promise<void>;
  fetchCount: (proposalName: string) => Promise<void>;
  fetchDetails: (investigationId: number) => Promise<void>;
  fetchSize: (investigationId: number) => Promise<void>;
  fetchTypeFilter: (proposalName: string) => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  clearData: () => Action;
}

interface DLSVisitsCVStateProps {
  data: Entity[];
  totalDatCount: number;
  loading: boolean;
  query: QueryParams;
  sort: SortType;
  filters: FiltersType;
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
    loading,
    query,
    sort,
    filters,
    filterData,
    proposalName,
    view,
    fetchData,
    fetchCount,
    fetchTypeFilter,
    fetchDetails,
    fetchSize,
    pushPage,
    pushResults,
    pushFilters,
    pushSort,
    clearData,
  } = props;

  const [t] = useTranslation();

  const [fetchedCount, setFetchedCount] = React.useState(false);
  const [fetchedFilters, setFetchedFilters] = React.useState(false);

  const typeFilteredItems = React.useMemo(
    () => ('TYPE_ID' in filterData ? filterData['TYPE_ID'] : []),
    [filterData]
  );

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
      loading={loading}
      sort={sort}
      filters={filters}
      query={query}
      loadData={(params) => fetchData(proposalName, params)}
      loadCount={() => fetchCount(proposalName)}
      onPageChange={pushPage}
      onResultsChange={pushResults}
      onSort={pushSort}
      onFilter={pushFilters}
      clearData={clearData}
      title={{
        label: t('investigations.visit_id'),
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
        label: t('investigations.details.summary'),
        dataKey: 'SUMMARY',
        filterComponent: textFilter,
      }}
      information={[
        {
          icon: <Assessment />,
          label: t('investigations.instrument'),
          dataKey: 'INVESTIGATIONINSTRUMENT[0].INSTRUMENT.NAME',
          filterComponent: textFilter,
        },
        {
          icon: <ConfirmationNumber />,
          label: t('investigations.dataset_count'),
          dataKey: 'DATASET_COUNT',
          disableSort: true,
        },
        {
          icon: <CalendarToday />,
          label: t('investigations.start_date'),
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
        },
        {
          icon: <CalendarToday />,
          label: t('investigations.end_date'),
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
          label: t('investigations.type_id'),
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
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  clearData: () => dispatch(clearData()),
});

const mapStateToProps = (state: StateType): DLSVisitsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDatCount: state.dgcommon.totalDataCount,
    filterData: state.dgcommon.filterData,

    loading: state.dgcommon.loading,
    query: state.dgcommon.query,
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    view: state.dgcommon.query.view,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSVisitsCardView);
