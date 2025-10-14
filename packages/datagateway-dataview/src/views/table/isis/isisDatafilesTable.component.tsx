import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExploreIcon from '@mui/icons-material/Explore';
import SaveIcon from '@mui/icons-material/Save';
import SubjectIcon from '@mui/icons-material/Subject';
import {
  ColumnType,
  Datafile,
  DownloadButton,
  ISISDatafileDetailsPanel,
  ConnectedTable as Table,
  TableActionProps,
  formatBytes,
  parseSearchToQuery,
  useAddToCart,
  useCart,
  useDatafileCount,
  useDatafilesInfinite,
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
import { StateType } from '../../../state/app.types';
import PreviewDatafileButton from '../../datafilePreview/previewDatafileButton.component';

interface ISISDatafilesTableProps {
  datasetId: string;
  investigationId: string;
}

const ISISDatafilesTable = (
  props: ISISDatafilesTableProps
): React.ReactElement => {
  const { datasetId, investigationId } = props;

  const [t] = useTranslation();

  const location = useLocation();

  const disableSelectAll = useSelector(
    (state: StateType) => state.dgcommon.features?.disableSelectAll ?? false
  );

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();

  const { data: allIds, isInitialLoading: allIdsLoading } = useIds(
    'datafile',
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
      },
    ],
    !disableSelectAll
  );
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } =
    useAddToCart('datafile');
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart('datafile');

  const { data: totalDataCount } = useDatafileCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
    },
  ]);

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { fetchNextPage, data } = useDatafilesInfinite(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
      },
    ],
    isMounted
  );

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  /* istanbul ignore next */
  const aggregatedData: Datafile[] = React.useMemo(() => {
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
        (cartItem.entityType === 'dataset' &&
          cartItem.entityId.toString() === datasetId) ||
        (cartItem.entityType === 'investigation' &&
          cartItem.entityId.toString() === investigationId)
    );
  }, [cartItems, datasetId, investigationId]);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: SubjectIcon,
        label: t('datafiles.name'),
        dataKey: 'name',
        filterComponent: textFilter,
        defaultSort: 'asc',
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
      },
      {
        icon: CalendarTodayIcon,
        label: t('datafiles.modified_time'),
        dataKey: 'datafileModTime',
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
            cartItem.entityType === 'datafile' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (disableSelectAll || (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, disableSelectAll, allIds]
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
      detailsPanel={ISISDatafileDetailsPanel}
      actionsWidth={96}
      actions={[
        ({ rowData }: TableActionProps) => (
          <DownloadButton
            entityType="datafile"
            entityId={rowData.id}
            entityName={(rowData as Datafile).location}
            variant="icon"
            entitySize={(rowData as Datafile).fileSize ?? -1}
          />
        ),
        ({ rowData }: TableActionProps) => (
          <PreviewDatafileButton datafile={rowData as Datafile} />
        ),
      ]}
      columns={columns}
    />
  );
};

export default ISISDatafilesTable;
