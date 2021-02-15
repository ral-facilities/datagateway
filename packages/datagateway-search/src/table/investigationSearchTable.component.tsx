import React from 'react';
import { Typography } from '@material-ui/core';
import {
  Table,
  TextColumnFilter,
  DateColumnFilter,
  Order,
  Filter,
  Investigation,
  Entity,
  DownloadCartItem,
  fetchInvestigations,
  fetchInvestigationCount,
  addToCart,
  removeFromCart,
  fetchAllIds,
  sortTable,
  filterTable,
  clearTable,
  tableLink,
} from 'datagateway-common';
import { StateType } from '../state/app.types';
import { connect } from 'react-redux';
import { Action, AnyAction } from 'redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { ThunkDispatch } from 'redux-thunk';
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
  luceneData: number[];
}

interface InvestigationTableDispatchProps {
  sortTable: (column: string, order: Order | null) => Action;
  filterTable: (column: string, filter: Filter | null) => Action;
  addToCart: (entityIds: number[]) => Promise<void>;
  removeFromCart: (entityIds: number[]) => Promise<void>;
  fetchData: (luceneData: number[], offsetParams: IndexRange) => Promise<void>;
  fetchCount: (luceneData: number[]) => Promise<void>;
  fetchAllIds: (luceneData: number[]) => Promise<void>;
  clearTable: () => Action;
}

type InvestigationTableCombinedProps = InvestigationTableProps &
  InvestigationTableDispatchProps & { hierarchy: string };

const InvestigationSearchTable = (
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
    luceneData,
    loading,
    hierarchy,
  } = props;

  const [t] = useTranslation();

  const dlsLink = (investigationData: Investigation): React.ReactElement =>
    tableLink(
      `/browse/proposal/${investigationData.NAME}/investigation/${investigationData.ID}/dataset`,
      investigationData.TITLE
    );

  const isisLink = (
    investigationData: Investigation
  ): React.ReactElement | string => {
    let instrumentId;
    let facilityCycleId;
    if (investigationData.INVESTIGATIONINSTRUMENT?.length) {
      instrumentId = investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT_ID;
    } else {
      return investigationData.TITLE;
    }

    if (
      investigationData.STARTDATE &&
      investigationData.FACILITY?.FACILITYCYCLE?.length
    ) {
      const facilityCycles = investigationData.FACILITY.FACILITYCYCLE.filter(
        (facilityCycle) =>
          investigationData.STARTDATE &&
          facilityCycle.STARTDATE &&
          facilityCycle.ENDDATE &&
          investigationData.STARTDATE >= facilityCycle.STARTDATE &&
          investigationData.STARTDATE <= facilityCycle.ENDDATE
      );
      if (facilityCycles.length) {
        facilityCycleId = facilityCycles[0].ID;
      }
    }

    if (facilityCycleId) {
      return tableLink(
        `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationData.ID}/dataset`,
        investigationData.TITLE
      );
    } else {
      return investigationData.TITLE;
    }
  };

  const genericLink = (investigationData: Investigation): React.ReactElement =>
    tableLink(
      `/browse/investigation/${investigationData.ID}/dataset`,
      investigationData.TITLE
    );

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLink;
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      return genericLink;
    }
  }, [hierarchy]);

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
      onChange={(value: { value?: string | number; type: string } | null) =>
        filterTable(dataKey, value ? value : null)
      }
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
  }, [clearTable, luceneData]);

  React.useEffect(() => {
    fetchCount(luceneData);
    fetchAllIds(luceneData);
  }, [fetchCount, fetchData, fetchAllIds, filters, luceneData]);

  React.useEffect(() => {
    fetchData(luceneData, { startIndex: 0, stopIndex: 49 });
  }, [fetchCount, fetchData, fetchAllIds, sort, filters, luceneData]);

  return (
    <Table
      loading={loading}
      data={data}
      loadMoreRows={(params) => fetchData(luceneData, params)}
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
              <b>{t('investigations.rb_number')}:</b>{' '}
              {investigationData.RB_NUMBER}
            </Typography>
            <Typography>
              <b>{t('investigations.title')}:</b> {investigationData.TITLE}
            </Typography>
            <Typography>
              <b>{t('investigations.start_date')}:</b>{' '}
              {investigationData.STARTDATE}
            </Typography>
            <Typography>
              <b>{t('investigations.end_date')}:</b> {investigationData.ENDDATE}
            </Typography>
          </div>
        );
      }}
      columns={[
        {
          label: t('investigations.title'),
          dataKey: 'TITLE',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            return hierarchyLink(investigationData);
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
          disableSort: true,
        },
        {
          label: t('investigations.instrument'),
          dataKey: 'INVESTIGATIONINSTRUMENT.INSTRUMENT.FULLNAME',
          cellContentRenderer: (cellProps: TableCellProps) => {
            const investigationData = cellProps.rowData as Investigation;
            if (
              investigationData.INVESTIGATIONINSTRUMENT &&
              investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
            ) {
              return investigationData.INVESTIGATIONINSTRUMENT[0].INSTRUMENT
                .FULLNAME;
            } else {
              return '';
            }
          },
          filterComponent: textFilter,
        },
        {
          label: t('investigations.start_date'),
          dataKey: 'STARTDATE',
          filterComponent: dateFilter,
          cellContentRenderer: (cellProps: TableCellProps) => {
            if (cellProps.cellData) {
              return cellProps.cellData.toString().split(' ')[0];
            }
          },
          disableHeaderWrap: true,
        },
        {
          label: t('investigations.end_date'),
          dataKey: 'ENDDATE',
          filterComponent: dateFilter,
          cellContentRenderer: (cellProps: TableCellProps) => {
            if (cellProps.cellData) {
              return cellProps.cellData.toString().split(' ')[0];
            }
          },
          disableHeaderWrap: true,
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
  fetchData: (luceneData: number[], offsetParams?: IndexRange) =>
    dispatch(
      fetchInvestigations({
        offsetParams,
        getDatasetCount: true,
        additionalFilters: [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              ID: { in: luceneData },
            }),
          },
          {
            filterType: 'include',
            filterValue: JSON.stringify([
              { INVESTIGATIONINSTRUMENT: 'INSTRUMENT' },
              { FACILITY: 'FACILITYCYCLE' },
            ]),
          },
        ],
      })
    ),
  fetchCount: (luceneData: number[]) =>
    dispatch(
      fetchInvestigationCount([
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            ID: { in: luceneData },
          }),
        },
      ])
    ),
  clearTable: () => dispatch(clearTable()),
  addToCart: (entityIds: number[]) =>
    dispatch(addToCart('investigation', entityIds)),
  removeFromCart: (entityIds: number[]) =>
    dispatch(removeFromCart('investigation', entityIds)),
  fetchAllIds: (luceneData: number[]) =>
    dispatch(
      fetchAllIds('investigation', [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            ID: { in: luceneData },
          }),
        },
      ])
    ),
});

const mapStateToProps = (state: StateType): InvestigationTableProps => {
  return {
    sort: state.dgcommon.query.sort,
    filters: state.dgcommon.query.filters,
    data: state.dgcommon.data,
    totalDataCount: state.dgcommon.totalDataCount,
    loading: state.dgcommon.loading,
    error: state.dgcommon.error,
    cartItems: state.dgcommon.cartItems,
    allIds: state.dgcommon.allIds,
    luceneData: state.dgsearch.searchData.investigation,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestigationSearchTable);
