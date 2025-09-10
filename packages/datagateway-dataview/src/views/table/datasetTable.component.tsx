import {
  CalendarToday,
  ConfirmationNumber,
  Subject,
} from '@mui/icons-material';
import {
  ColumnType,
  Dataset,
  DatasetDetailsPanel,
  ConnectedTable as Table,
  datasetLink,
  parseSearchToQuery,
  useAddToCart,
  useCart,
  useDatasetCount,
  useDatasetsInfinite,
  useDateFilter,
  useIds,
  useRemoveFromCart,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import { StateType } from '../../state/app.types';

interface DatasetTableProps {
  investigationId: string;
}

const DatasetTable = (props: DatasetTableProps): React.ReactElement => {
  const { investigationId } = props;

  const [t] = useTranslation();

  const location = useLocation();

  const disableSelectAll = useSelector(
    (state: StateType) => state.dgcommon.features?.disableSelectAll ?? false
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
    !disableSelectAll
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
        cellContentRenderer: (cellProps) => {
          const datasetData = cellProps.rowData as Dataset;
          return datasetLink(
            investigationId,
            datasetData.id,
            datasetData.name,
            view
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: ConfirmationNumber,
        label: t('datasets.datafile_count'),
        dataKey: 'fileCount',
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
    [t, textFilter, dateFilter, investigationId, view]
  );

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === 'dataset' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (disableSelectAll || (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, disableSelectAll, allIds]
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
      detailsPanel={DatasetDetailsPanel}
      columns={columns}
    />
  );
};

export default DatasetTable;
