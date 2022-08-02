import React from 'react';
import {
  Table,
  investigationLink,
  externalSiteLink,
  Investigation,
  ColumnType,
  formatCountOrSize,
  useInvestigationsInfinite,
  useInvestigationCount,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  parseSearchToQuery,
  useSort,
  useTextFilter,
  useDateFilter,
  useInvestigationSizes,
  InvestigationDetailsPanel,
} from 'datagateway-common';
import { StateType } from '../../state/app.types';
import { useSelector } from 'react-redux';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  Subject,
  Fingerprint,
  Public,
  Save,
  Assessment,
  CalendarToday,
} from '@mui/icons-material';

const InvestigationTable = (): React.ReactElement => {
  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );
  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount();
  const { fetchNextPage, data } = useInvestigationsInfinite([
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigationInstruments: 'instrument',
      }),
    },
  ]);
  const { data: allIds, isLoading: allIdsLoading } = useIds(
    'investigation',
    undefined,
    selectAllSetting
  );
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'investigation'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('investigation');

  const aggregatedData: Investigation[] = React.useMemo(
    () => (data ? data.pages.flat() : []),
    [data]
  );

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === 'investigation' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const sizeQueries = useInvestigationSizes(data);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Subject,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return investigationLink(
            investigationData.id,
            investigationData.title,
            view,
            'investigation-table-title'
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
        disableSort: true,
      },
      {
        icon: Public,
        label: t('investigations.doi'),
        dataKey: 'doi',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return externalSiteLink(
            `https://doi.org/${investigationData.doi}`,
            investigationData.doi,
            'investigation-table-doi-link'
          );
        },
        filterComponent: textFilter,
      },

      {
        icon: Save,
        label: t('investigations.size'),
        dataKey: 'size',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatCountOrSize(sizeQueries[cellProps.rowIndex], true),
        disableSort: true,
      },
      {
        icon: Assessment,
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.investigationInstruments?.[0]?.instrument) {
            return investigationData.investigationInstruments[0].instrument
              .name;
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: CalendarToday,

        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
      },
      {
        icon: CalendarToday,
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
      },
    ],
    [t, textFilter, dateFilter, view, sizeQueries]
  );

  return (
    <Table
      loading={
        addToCartLoading ||
        removeFromCartLoading ||
        cartLoading ||
        allIdsLoading
      }
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={handleSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={InvestigationDetailsPanel}
      columns={columns}
    />
  );
};

export default InvestigationTable;
