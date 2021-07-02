import React from 'react';
import { IndexRange } from 'react-virtualized';
import {
  CardView,
  Entity,
  fetchInvestigationCount,
  fetchInvestigations,
  Investigation,
  tableLink,
  pushPageFilter,
  Filter,
  TextColumnFilter,
  TextFilter,
  pushPageNum,
  pushPageSort,
  pushPageResults,
  pushQuery,
  readURLQuery,
  Order,
} from 'datagateway-common';
import { StateType, QueryParams } from 'datagateway-common/lib/state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RouterLocation } from 'connected-react-router';

interface DLSProposalsCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushResults: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushSort: (sort: string, order: Order | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

interface DLSProposalsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  loadedData: boolean;
  loadedCount: boolean;
  location: RouterLocation<unknown>;
}

type DLSProposalsCVCombinedProps = DLSProposalsCVDispatchProps &
  DLSProposalsCVStateProps;

const DLSProposalsCardView = (
  props: DLSProposalsCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    location,
    loadedData,
    loadedCount,
    fetchData,
    fetchCount,
    pushPage,
    pushFilters,
    pushQuery,
    pushSort,
    pushResults,
  } = props;

  const [t] = useTranslation();

  const { page, results } = React.useMemo(() => readURLQuery(location), [
    location,
  ]);
  const query = React.useMemo(() => readURLQuery(location), [location]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filters = React.useMemo(() => readURLQuery(location).filters, [
    location.query.filters,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sort = React.useMemo(() => readURLQuery(location).sort, [
    location.query.sort,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const view = React.useMemo(() => readURLQuery(location).view, [
    location.query.view,
  ]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as TextFilter}
      onChange={(value: { value?: string | number; type: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  return (
    <CardView
      data={data}
      totalDataCount={totalDataCount}
      query={query}
      loadData={fetchData}
      loadCount={fetchCount}
      onPageChange={pushPage}
      onFilter={pushFilters}
      pushQuery={pushQuery}
      onSort={pushSort}
      onResultsChange={pushResults}
      loadedData={loadedData}
      loadedCount={loadedCount}
      filters={filters}
      sort={sort}
      page={page}
      results={results}
      title={{
        label: t('investigations.title'),
        dataKey: 'title',
        content: (investigation: Investigation) =>
          tableLink(
            `/browse/proposal/${investigation.name}/investigation`,
            investigation.title,
            view
          ),
        filterComponent: textFilter,
      }}
      description={{
        label: t('investigations.name'),
        dataKey: 'name',
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
            filterValue: JSON.stringify(['name', 'title']),
          },
        ],
      })
    ),
  fetchCount: () =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'distinct',
          filterValue: JSON.stringify(['name', 'title']),
        },
      ])
    ),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
  pushPage: (page: number | null) => dispatch(pushPageNum(page)),
  pushResults: (results: number | null) => dispatch(pushPageResults(results)),
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): DLSProposalsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loadedData: state.dgcommon.loadedData,
    loadedCount: state.dgcommon.loadedCount,
    location: state.router.location,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DLSProposalsCardView);
