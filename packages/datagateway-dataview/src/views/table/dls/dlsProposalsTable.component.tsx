import {
  Entity,
  fetchInvestigationCount,
  fetchInvestigations,
  Filter,
  FiltersType,
  Investigation,
  Order,
  pushPageFilter,
  pushPageSort,
  SortType,
  Table,
  tableLink,
  TextColumnFilter,
  ViewsType,
  TextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../../../state/app.types';

import TitleIcon from '@material-ui/icons/Title';

interface DLSProposalsTableStoreProps {
  sort: SortType;
  filters: FiltersType;
  view: ViewsType;
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  selectAllSetting: boolean;
}

interface DLSProposalsTableDispatchProps {
  pushSort: (sort: string, order: Order | null) => Promise<void>;

  pushFilters: (filter: string, data: Filter | null) => Promise<void>;
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
}

type DLSProposalsTableCombinedProps = DLSProposalsTableStoreProps &
  DLSProposalsTableDispatchProps;

const DLSProposalsTable = (
  props: DLSProposalsTableCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    sort,
    pushSort,
    filters,
    pushFilters,
    view,
    loading,
    selectAllSetting,
  } = props;

  const [t] = useTranslation();

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      value={filters[dataKey] as TextFilter}
      onChange={(value: { value?: string | number; type: string } | null) =>
        pushFilters(dataKey, value ? value : null)
      }
    />
  );

  React.useEffect(() => {
    fetchCount();
  }, [fetchCount, filters]);

  React.useEffect(() => {
    fetchData({ startIndex: 0, stopIndex: 49 });
  }, [fetchData, sort, filters]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={fetchData}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      disableSelectAll={!selectAllSetting}
      columns={[
        {
          icon: <TitleIcon />,
          label: t('investigations.title'),
          dataKey: 'title',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            return tableLink(
              `/browse/proposal/${investigationData.name}/investigation`,
              investigationData.title,
              view
            );
          },
          filterComponent: textFilter,
        },
        {
          icon: <TitleIcon />,
          label: t('investigations.name'),
          dataKey: 'name',
          cellContentRenderer: (cellProps: TableCellProps) => {
            return tableLink(
              `/browse/proposal/${cellProps.rowData.name}/investigation`,
              cellProps.rowData.name,
              view
            );
          },
          filterComponent: textFilter,
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): DLSProposalsTableDispatchProps => ({
  pushSort: (sort: string, order: Order | null) =>
    dispatch(pushPageSort(sort, order)),

  pushFilters: (filter: string, data: Filter | null) =>
    dispatch(pushPageFilter(filter, data)),
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
});

const mapStateToProps = (state: StateType): DLSProposalsTableStoreProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    view: state.dgcommon.query.view,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    selectAllSetting: state.dgdataview.selectAllSetting,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DLSProposalsTable);
