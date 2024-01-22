import { CalendarToday, Explore, Save, Subject } from '@mui/icons-material';
import {
  ColumnType,
  Datafile,
  DatafileDetailsPanel,
  DownloadButton,
  formatBytes,
  parseSearchToQuery,
  Table,
  TableActionProps,
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
import type { StateType } from '../../state/app.types';
// import { formatISO9075, toDate, parse } from 'date-fns';

interface DatafileTableProps {
  datasetId: string;
  investigationId: string;
}

const DatafileTable = (props: DatafileTableProps): React.ReactElement => {
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
  const handleSort = useSort();
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

  // Convert the dates to 'YYYY-MM-DD hh:mm:ss' iso format
  React.useEffect(() => {
    aggregatedData.forEach((datafile) => {
      if (datafile.createTime) {
        datafile.createTime = new Date(datafile.createTime)
          .toISOString()
          .replace('T', ' ')
          .split(/[.+]/)[0];
      }
      if (datafile.modTime) {
        datafile.modTime = new Date(datafile.modTime)
          .toISOString()
          .replace('T', ' ')
          .split(/[.+]/)[0];
      }
    });
  }, [aggregatedData]);

  // React.useEffect(() => {
  //   // console.log(formatISO9075(new Date('2021-04-11 00:30:00.879000+01:00')));
  //   // console.log(new Date('2021-04-11 00:30:00.879000+01:00'));
  //   // console.log(new Date('2019-12-06 08:30:00+00:00'));
  //   // console.log(toDate(new Date('2021-04-11 00:30:00.879000+01:00')));

  //   // console.log(
  //   //   new Date('2021-04-11 00:30:00.879000+01:00') ===
  //   //     toDate(new Date('2021-04-11 00:30:00.879000+01:00'))
  //   // );

  //   console.log(
  //     parse(
  //       '2021-04-11 00:30:00.879000+01:00',
  //       'yyyy-MM-dd HH:mm:ss.SSSSSSXXX',
  //       new Date()
  //     )
  //   );
  //   console.log(new Date('2021-04-11 00:30:00.879000+01:00'));

  //   // const d = new Date('2021-04-11 00:30:00.879000+01:00');
  //   const d = parse(
  //     '2021-04-11 00:30:00.879000+01:00',
  //     'yyyy-MM-dd HH:mm:ss.SSSSSSXXX',
  //     new Date()
  //   );
  //   const utcDate = d.toISOString().replace('T', ' ').split(/[.+]/)[0];
  //   console.log(utcDate);
  //   // convert d to UTC
  // }, []);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Subject,
        label: t('datafiles.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        icon: Explore,
        label: t('datafiles.location'),
        dataKey: 'location',
        filterComponent: textFilter,
      },
      {
        icon: Save,
        label: t('datafiles.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps) => {
          return formatBytes(cellProps.cellData);
        },
      },
      {
        icon: CalendarToday,
        label: t('datafiles.modified_time'),
        dataKey: 'modTime',
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
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
  );

  const isParentSelected = React.useMemo(() => {
    return cartItems?.some(
      (cartItem) =>
        (cartItem.entityType === 'dataset' &&
          cartItem.entityId.toString() === datasetId) ||
        (cartItem.entityType === 'investigation' &&
          cartItem.entityId.toString() === investigationId)
    );
  }, [cartItems, datasetId, investigationId]);

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
      detailsPanel={DatafileDetailsPanel}
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
      ]}
      columns={columns}
    />
  );
};

export default DatafileTable;
