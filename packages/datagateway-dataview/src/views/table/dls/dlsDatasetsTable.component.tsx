import React from 'react';
import {
  Subject,
  ConfirmationNumber,
  CalendarToday,
  Save,
} from '@mui/icons-material';
import {
  Table,
  tableLink,
  Dataset,
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
  DLSDatasetDetailsPanel,
  formatBytes,
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

  const { data: allIds, isInitialLoading: allIdsLoading } = useIds(
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

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { fetchNextPage, data } = useDatasetsInfinite(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: investigationId },
        }),
      },
    ],
    isMounted
  );

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  /* istanbul ignore next */
  const aggregatedData: Dataset[] = React.useMemo(() => {
    if (data) {
      if ('pages' in data) {
        return data.pages.flat();
      } else if ((data as unknown) instanceof Array) {
        return data;
      }
    }

    return [];
  }, [data]);

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
        defaultSort: 'asc',
      },
      {
        icon: ConfirmationNumber,
        label: t('datasets.datafile_count'),
        dataKey: 'fileCount',
      },
      {
        icon: Save,
        label: t('datasets.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatBytes(cellProps.rowData.fileSize),
      },
      {
        icon: CalendarToday,
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarToday,

        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [t, textFilter, dateFilter, proposalName, investigationId, view]
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

  const isParentSelected = React.useMemo(() => {
    return cartItems?.some(
      (cartItem) =>
        cartItem.entityType === 'investigation' &&
        cartItem.entityId.toString() === investigationId
    );
  }, [cartItems, investigationId]);

  return (
    <Table
      loading={
        addToCartLoading ||
        removeFromCartLoading ||
        cartLoading ||
        allIdsLoading
      }
      parentSelected={isParentSelected}
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
