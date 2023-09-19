import React from 'react';
import SubjectIcon from '@mui/icons-material/Subject';
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  Table,
  tableLink,
  TableActionProps,
  Dataset,
  formatCountOrSize,
  useDatasetCount,
  useDatasetsInfinite,
  parseSearchToQuery,
  parseQueryToSearch,
  SortType,
  useTextFilter,
  useDateFilter,
  ColumnType,
  useSort,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatasetSizes,
  DownloadButton,
  ISISDatasetDetailsPanel,
} from 'datagateway-common';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';

interface ISISDatasetsTableProps {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  dataPublication: boolean;
}

const ISISDatasetsTable = (
  props: ISISDatasetsTableProps
): React.ReactElement => {
  const { investigationId, instrumentChildId, instrumentId, dataPublication } =
    props;

  const pathRoot = dataPublication ? 'browseDataPublications' : 'browse';
  const instrumentChild = dataPublication ? 'dataPublication' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation/${investigationId}/dataset`;

  const [t] = useTranslation();

  const location = useLocation();
  const handleSort = useSort();

  // set default sort
  const defaultSort: SortType = {
    createTime: 'desc',
  };
  // apply default sort
  // had to use useMemo because useEffect doesn't run until the component is mounted
  React.useMemo(() => {
    if (location.search === '') {
      location.search = parseQueryToSearch({
        ...parseSearchToQuery(location.search),
        sort: defaultSort,
      }).toString();
      // TODO: will have to add shiftDown=true to append sort after improved sort ux pr is merged
      for (const [column, order] of Object.entries(defaultSort)) {
        handleSort(column, order, 'replace');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { push } = useHistory();

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );

  const { filters, sort, view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);

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

  const sizeQueries = useDatasetSizes(data);

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

  const isParentSelected = React.useMemo(() => {
    return cartItems?.some(
      (cartItem) =>
        cartItem.entityType === 'investigation' &&
        cartItem.entityId.toString() === investigationId
    );
  }, [cartItems, investigationId]);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: SubjectIcon,
        label: t('datasets.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) =>
          tableLink(
            `${urlPrefix}/${cellProps.rowData.id}`,
            cellProps.rowData.name,
            view
          ),
        filterComponent: textFilter,
      },
      {
        icon: SaveIcon,
        label: t('datasets.size'),
        dataKey: 'size',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatCountOrSize(sizeQueries[cellProps.rowIndex], true),
        disableSort: true,
      },
      {
        icon: CalendarTodayIcon,
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
        // defaultSort: 'desc',
      },
      {
        icon: CalendarTodayIcon,
        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [t, textFilter, dateFilter, urlPrefix, view, sizeQueries]
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

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => (
      <ISISDatasetDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        viewDatafiles={(id: number) => push(`${urlPrefix}/${id}/datafile`)}
      />
    ),
    [push, urlPrefix]
  );

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
      detailsPanel={detailsPanel}
      actions={[
        ({ rowData }: TableActionProps) => (
          <DownloadButton
            entityType="dataset"
            entityId={rowData.id}
            entityName={rowData.name}
            variant="icon"
            entitySize={
              sizeQueries[aggregatedData.indexOf(rowData as Dataset)]?.data ??
              -1
            }
          />
        ),
      ]}
      columns={columns}
    />
  );
};

export default ISISDatasetsTable;
