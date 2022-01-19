import React from 'react';
import TitleIcon from '@material-ui/icons/Title';
import SaveIcon from '@material-ui/icons/Save';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import {
  Table,
  tableLink,
  TableActionProps,
  Dataset,
  formatCountOrSize,
  useDatasetCount,
  useDatasetsInfinite,
  parseSearchToQuery,
  useTextFilter,
  useDateFilter,
  ColumnType,
  useUpdateSort,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatasetSizes,
  DownloadButton,
} from 'datagateway-common';
import { TableCellProps, IndexRange } from 'react-virtualized';
import DatasetDetailsPanel from '../../detailsPanels/isis/datasetDetailsPanel.component';
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';

interface ISISDatasetsTableProps {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  studyHierarchy: boolean;
}

const ISISDatasetsTable = (
  props: ISISDatasetsTableProps
): React.ReactElement => {
  const {
    investigationId,
    instrumentChildId,
    instrumentId,
    studyHierarchy,
  } = props;

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation/${investigationId}/dataset`;

  const [t] = useTranslation();

  const location = useLocation();

  const { push } = useHistory();

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );

  const { filters, sort, view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters, 'push');
  const dateFilter = useDateFilter(filters, 'push');
  const handleSort = useUpdateSort('push');

  const { data: allIds } = useIds(
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
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'dataset'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('dataset');

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

  const aggregatedData: Dataset[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: TitleIcon,
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
        defaultSort: 'desc',
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
      <DatasetDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        viewDatafiles={(id: number) => push(`${urlPrefix}/${id}/datafile`)}
      />
    ),
    [push, urlPrefix]
  );

  return (
    <Table
      loading={addToCartLoading || removeFromCartLoading}
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
          />
        ),
      ]}
      columns={columns}
    />
  );
};

export default ISISDatasetsTable;
