import React from 'react';
import {
  buildDatafileUrl,
  buildDatasetUrl,
  ColumnType,
  Datafile,
  DatafileDetailsPanel,
  Dataset,
  DLSDatafileDetailsPanel,
  formatBytes,
  ISISDatafileDetailsPanel,
  parseSearchToQuery,
  Table,
  tableLink,
  useAddToCart,
  useCart,
  useDatafileCount,
  useDatafilesInfinite,
  useDateFilter,
  useIds,
  useLuceneSearch,
  useRemoveFromCart,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';

interface DatafileSearchTableProps {
  hierarchy: string;
}

const DatafileSearchTable = (
  props: DatafileSearchTableProps
): React.ReactElement => {
  const { hierarchy } = props;

  const location = useLocation();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { startDate, endDate } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgsearch.selectAllSetting
  );

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const { data: luceneData } = useLuceneSearch('Datafile', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });
  const [t] = useTranslation();

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useDatafileCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { fetchNextPage, data } = useDatafilesInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        dataset: { investigation: { investigationInstruments: 'instrument' } },
      }),
    },
  ]);
  const { data: allIds, isLoading: allIdsLoading } = useIds(
    'datafile',
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: luceneData || [] },
        }),
      },
    ],
    selectAllSetting
  );
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } =
    useAddToCart('datafile');
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart('datafile');

  /* istanbul ignore next */
  const aggregatedData: Dataset[] = React.useMemo(() => {
    if (data) {
      if ('pages' in data) {
        return data.pages.flat();
      } else if (data instanceof Array) {
        return data;
      }
    }

    return [];
  }, [data]);

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === 'datafile' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('datafiles.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datafileData = cellProps.rowData as Datafile;
          const link = buildDatafileUrl({
            facilityName: hierarchy,
            datafile: datafileData,
          });
          return link ? tableLink(link, datafileData.name) : datafileData.name;
        },
        filterComponent: textFilter,
      },
      {
        label: t('datafiles.location'),
        dataKey: 'location',
        filterComponent: textFilter,
      },
      {
        label: t('datafiles.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps) => {
          return formatBytes(cellProps.cellData);
        },
      },
      {
        label: t('datafiles.dataset'),
        dataKey: 'dataset.name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datafileData = cellProps.rowData as Datafile;
          const dataset = datafileData.dataset;
          if (!dataset) return '';

          const link = buildDatasetUrl({ dataset, facilityName: hierarchy });
          return link ? tableLink(link, dataset.name) : dataset.name;
        },
        filterComponent: textFilter,
      },
      {
        label: t('datafiles.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [t, textFilter, dateFilter, hierarchy]
  );

  let detailsPanel = DatafileDetailsPanel;
  if (hierarchy === 'isis') detailsPanel = ISISDatafileDetailsPanel;
  else if (hierarchy === 'dls') detailsPanel = DLSDatafileDetailsPanel;

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
      disableSelectAll={!selectAllSetting}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={detailsPanel}
      columns={columns}
    />
  );
};

export default DatafileSearchTable;
