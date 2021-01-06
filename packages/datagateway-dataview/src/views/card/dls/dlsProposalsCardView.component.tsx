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
  Order,
  SortType,
  pushPageSort,
  pushPageNum,
  pushPageResults,
  clearData,
} from 'datagateway-common';
import {
  ViewsType,
  StateType,
  QueryParams,
} from 'datagateway-common/lib/state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction, Action } from 'redux';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

interface DLSProposalsCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushResults: (results: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  clearData: () => Action;
}

interface DLSProposalsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  query: QueryParams;
  sort: SortType;
  filters: FiltersType;
  view: ViewsType;
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
    loading,
    query,
    sort,
    filters,
    pushPage,
    pushResults,
    pushFilters,
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
      loading={loading}
      sort={sort}
      filters={filters}
      query={query}
      loadData={fetchData}
      loadCount={fetchCount}
      onPageChange={pushPage}
      onResultsChange={pushResults}
      onSort={pushSort}
      onFilter={pushFilters}
      clearData={clearData}
      title={{
        label: t('investigations.title'),
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
        label: t('investigations.name'),
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
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  clearData: () => dispatch(clearData()),
});

const mapStateToProps = (state: StateType): DLSProposalsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    query: state.dgcommon.query,
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    view: state.dgcommon.query.view,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DLSProposalsCardView);
