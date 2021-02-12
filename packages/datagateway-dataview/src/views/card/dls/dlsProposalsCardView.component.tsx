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
  TextColumnFilter,
  pushPageNum,
  pushQuery,
} from 'datagateway-common';
import { StateType, QueryParams } from 'datagateway-common/lib/state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

interface DLSProposalsCVDispatchProps {
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  pushPage: (page: number) => Promise<void>;
  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  pushQuery: (query: QueryParams) => Promise<void>;
}

interface DLSProposalsCVStateProps {
  data: Entity[];
  totalDataCount: number;
  loadedData: boolean;
  loadedCount: boolean;
  query: QueryParams;
}

type DLSProposalsCVCombinedProps = DLSProposalsCVDispatchProps &
  DLSProposalsCVStateProps;

const DLSProposalsCardView = (
  props: DLSProposalsCVCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    query,
    loadedData,
    loadedCount,
    fetchData,
    fetchCount,
    pushPage,
    pushFilters,
    pushQuery,
  } = props;

  const filters = query.filters;
  const [t] = useTranslation();

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as string}
      onChange={(value: string) => pushFilters(dataKey, value ? value : null)}
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
      loadedData={loadedData}
      loadedCount={loadedCount}
      title={{
        label: t('investigations.title'),
        dataKey: 'title',
        content: (investigation: Investigation) =>
          tableLink(
            `/browse/proposal/${investigation.name}/investigation`,
            investigation.title,
            query.view
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
  pushQuery: (query: QueryParams) => dispatch(pushQuery(query)),
});

const mapStateToProps = (state: StateType): DLSProposalsCVStateProps => {
  return {
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loadedData: state.dgcommon.loadedData,
    loadedCount: state.dgcommon.loadedCount,
    query: state.dgcommon.query,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DLSProposalsCardView);
