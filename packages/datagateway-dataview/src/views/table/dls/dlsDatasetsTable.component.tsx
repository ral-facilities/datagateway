import React from 'react';
import {
  Subject,
  ConfirmationNumber,
  CalendarToday,
} from '@mui/icons-material';
import {
  Table,
  tableLink,
  Dataset,
  formatCountOrSize,
  useDatasetCount,
  useDatasetsInfinite,
  parseSearchToQuery,
  useTextFilter,
  useDateFilter,
  ColumnType,
  useSort,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatasetsDatafileCount,
  DLSDatasetDetailsPanel,
} from 'datagateway-common';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';

interface DLSDatasetsTableProps {
  proposalName: string;
  investigationId: string;
}

const DLSDatasetsTable = (props: DLSDatasetsTableProps): React.ReactElement => {
  const { investigationId, proposalName } = props;

  const [t] = useTranslation();

  const location = useLocation();

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );

  const { filters, sort, view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();

  const { data: allIds, isLoading: allIdsLoading } = useIds(
    'dataset',
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: parseInt(investigationId) },
        }),
      },
    ],
    selectAllSetting
  );
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } =
    useAddToCart('dataset');
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart('dataset');

  const { data: totalDataCount } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);

  const { fetchNextPage, data } = useDatasetsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const datafileCountQueries = useDatasetsDatafileCount(data);

  const aggregatedData: Dataset[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Subject,
        label: t('datasets.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) =>
          tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigationId}/dataset/${cellProps.rowData.id}/datafile`,
            cellProps.rowData.name,
            view,
            'dls-datasets-table-title'
          ),
        filterComponent: textFilter,
      },
      {
        icon: ConfirmationNumber,
        label: t('datasets.datafile_count'),
        dataKey: 'datafileCount',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatCountOrSize(datafileCountQueries[cellProps.rowIndex]),
        disableSort: true,
      },
      {
        icon: CalendarToday,
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,

        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [
      t,
      textFilter,
      dateFilter,
      proposalName,
      investigationId,
      view,
      datafileCountQueries,
    ]
  );

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === 'dataset' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
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
      detailsPanel={DLSDatasetDetailsPanel}
      columns={columns}
    />
  );
};

export default DLSDatasetsTable;
