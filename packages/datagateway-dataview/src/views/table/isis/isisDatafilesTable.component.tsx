import React from 'react';
import SubjectIcon from '@mui/icons-material/Subject';
import ExploreIcon from '@mui/icons-material/Explore';
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  Table,
  TableActionProps,
  formatBytes,
  Datafile,
  useDatafileCount,
  useDatafilesInfinite,
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
  DownloadButton,
  ISISDatafileDetailsPanel,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';
import { IndexRange } from 'react-virtualized';
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
  const handleSort = useSort();
  const location = useLocation();

  // set default sort
  const defaultSort: SortType = {
    modTime: 'desc',
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

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);

  const { data: allIds, isLoading: allIdsLoading } = useIds(
    'datafile',
    [
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
    ],
    selectAllSetting
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
        dataKey: 'modTime',
        filterComponent: dateFilter,
        // defaultSort: 'desc',
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
