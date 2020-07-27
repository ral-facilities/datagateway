import React from 'react';
import { Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  DateColumnFilter,
  investigationLink,
  Order,
  Filter,
  Investigation,
  Entity,
  DownloadCartItem,
  fetchInvestigations,
  addToCart,
  removeFromCart,
  fetchInvestigationCount,
  fetchAllIds,
  sortTable,
  filterTable,
  clearTable,
} from 'datagateway-common';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
import useAfterMountEffect from '../utils';
import { useTranslation } from 'react-i18next';

interface InvestigationTableProps {
  sort: {
    [column: string]: Order;
  };
  filters: {
    [column: string]: Filter;
  };
  data: Entity[];
  totalDataCount: number;
  loading: boolean;
  error: string | null;
  cartItems: DownloadCartItem[];
  allIds: number[];
}

interface InvestigationTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchData: (offsetParams: IndexRange) => Promise<void>;
  fetchCount: () => Promise<void>;
  fetchAllIds: () => Promise<void>;
  clearTable: () => Action;
}

type InvestigationTableCombinedProps = InvestigationTableProps &
  InvestigationTableDispatchProps;

const InvestigationTable = (
  props: InvestigationTableCombinedProps
): React.ReactElement => {
  const {
    data,
    totalDataCount,
    fetchData,
    fetchCount,
    clearTable,
    sort,
    sortTable,
    filters,
    filterTable,
    cartItems,
    addToCart,
    removeFromCart,
    allIds,
    fetchAllIds,
    loading,
  } = props;

  const [t] = useTranslation();

  const selectedRows = React.useMemo(
    () =>
      cartItems
        .filter(
          (cartItem) =>
            cartItem.entityType === 'investigation' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => filterTable(dataKey, value ? value : null)}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      onChange={(value: { startDate?: string; endDate?: string } | null) =>
        filterTable(dataKey, value)
      }
    />
  );

  React.useEffect(() => {
    clearTable();
  }, [clearTable]);

  useAfterMountEffect(() => {
    fetchCount();
    fetchData({ startIndex: 0, stopIndex: 49 });
    fetchAllIds();
  }, [fetchCount, fetchData, fetchAllIds, sort, filters]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={fetchData}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={sortTable}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={({ rowData }) => {
        const investigationData = rowData as Investigation;
        return (
          <div>
            <Typography>
              <b>{t('investigations.details.rb_number')}:</b>{' '}
              {investigationData.RB_NUMBER}
            </Typography>
            <Typography>
              <b>{t('investigations.details.title')}:</b>{' '}
              {investigationData.TITLE}
            </Typography>
            <Typography>
              <b>{t('investigations.details.start_date')}:</b>{' '}
              {investigationData.STARTDATE}
            </Typography>
            <Typography>
              <b>{t('investigations.details.end_date')}:</b>{' '}
              {investigationData.ENDDATE}
            </Typography>
          </div>
        );
      }}
      columns={[
        {
          label: t('investigations.title'),
          dataKey: 'TITLE',
          cellContentRenderer: (props: TableCellProps) => {
            const investigationData = props.rowData as Investigation;
            return investigationLink(
              investigationData.ID,
              investigationData.TITLE
            );
          },
          filterComponent: textFilter,
        },
        {
          label: t('investigations.visit_id'),
          dataKey: 'VISIT_ID',
          filterComponent: textFilter,
        },
        {
          label: t('investigations.rb_number'),
          dataKey: 'RB_NUMBER',
          filterComponent: textFilter,
        },
        {
          label: t('investigations.doi'),
          dataKey: 'DOI',
          filterComponent: textFilter,
        },
        {
          label: t('investigations.dataset_count'),
          dataKey: 'DATASET_COUNT',
        },
        {
          label: t('investigations.instrument'),
          dataKey: 'INSTRUMENT.NAME',
          filterComponent: textFilter,
        },
        {
          label: t('investigations.start_date'),
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
          cellContentRenderer: (props: TableCellProps) => {
            if (props.cellData) return props.cellData.toString().split(' ')[0];
          },
        },
        {
          label: t('investigations.end_date'),
          dataKey: 'ENDDATE',
          filterComponent: dateFilter,
          cellContentRenderer: (props: TableCellProps) => {
            if (props.cellData) return props.cellData.toString().split(' ')[0];
          },
        },
      ]}
    />
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): InvestigationTableDispatchProps => ({
  sortTable: (column: string, order: Order | null) =>
    dispatch(sortTable(column, order)),
  filterTable: (column: string, filter: Filter | null) =>
    dispatch(filterTable(column, filter)),
  fetchData: (offsetParams: IndexRange) =>
    dispatch(fetchInvestigations({ offsetParams })),
  fetchCount: () => dispatch(fetchInvestigationCount()),
  clearTable: () => dispatch(clearTable()),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
  fetchAllIds: () => dispatch(fetchAllIds('investigation')),
});

const mapStateToProps = (state: StateType): InvestigationTableProps => {
  return {
    sort: state.dgcommon.sort,
    filters: state.dgcommon.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
  };
};

// these all need to be converted to dgcommon

export default connect(mapStateToProps, mapDispatchToProps)(InvestigationTable);
