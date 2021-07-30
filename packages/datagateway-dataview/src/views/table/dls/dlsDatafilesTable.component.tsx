import React from 'react';
import TitleIcon from '@material-ui/icons/Title';
import ExploreIcon from '@material-ui/icons/Explore';
import SaveIcon from '@material-ui/icons/Save';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import {
  Table,
  formatBytes,
  Datafile,
  useDatafileCount,
  useDatafilesInfinite,
  parseSearchToQuery,
  useTextFilter,
  useDateFilter,
  ColumnType,
  usePushSort,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';
import { IndexRange } from 'react-virtualized';
import DatafileDetailsPanel from '../../detailsPanels/dls/datafileDetailsPanel.component';

interface DLSDatafilesTableProps {
  datasetId: string;
  investigationId: string;
}

const DLSDatafilesTable = (
  props: DLSDatafilesTableProps
): React.ReactElement => {
  const { datasetId, investigationId } = props;

  const [t] = useTranslation();

  const location = useLocation();

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();

  const { data: allIds } = useIds('datafile', [
    {
      filterType: 'where',
      filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'dataset.investigation.id': { eq: investigationId },
      }),
    },
  ]);
  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'datafile'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('datafile');

  const { data: totalDataCount } = useDatafileCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'dataset.investigation.id': { eq: investigationId },
      }),
    },
  ]);

  const { fetchNextPage, data } = useDatafilesInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'dataset.investigation.id': { eq: investigationId },
      }),
    },
  ]);

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const aggregatedData: Datafile[] = React.useMemo(
    () => data?.pages.flat() ?? [],
    [data]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: TitleIcon,
        label: t('datafiles.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        icon: ExploreIcon,
        label: t('datafiles.location'),
        dataKey: 'location',
        filterComponent: textFilter,
      },
      {
        icon: SaveIcon,
        label: t('datafiles.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps) => {
          return formatBytes(cellProps.cellData);
        },
        filterComponent: textFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('datafiles.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
      },
    ],
    [t, dateFilter, textFilter]
  );

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            allIds &&
            cartItem.entityType === 'datafile' &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, allIds]
  );

  return (
    <Table
      loading={addToCartLoading || removeFromCartLoading}
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      selectedRows={selectedRows}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={({ rowData, detailsPanelResize }) => {
        return (
          <DatafileDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
          />
        );
      }}
      // actions={[
      //   function downloadButton({ rowData }: TableActionProps) {
      //     const { id, location } = rowData as Datafile;
      //     if (location) {
      //       return (
      //         <IconButton
      //           aria-label={t('datafiles.download')}
      //           key="download"
      //           onClick={() => {
      //             downloadData(id, location);
      //           }}
      //         >
      //           <GetApp />
      //         </IconButton>
      //       );
      //     } else {
      //       return null;
      //     }
      //   },
      // ]}
      columns={columns}
    />
  );
};

export default DLSDatafilesTable;
