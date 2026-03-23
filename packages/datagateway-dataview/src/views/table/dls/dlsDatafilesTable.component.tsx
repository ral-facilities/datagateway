import CalendarToday from '@mui/icons-material/CalendarToday';
import Explore from '@mui/icons-material/Explore';
import Save from '@mui/icons-material/Save';
import Subject from '@mui/icons-material/Subject';
import {
  ColumnType,
  DLSDatafileDetailsPanel,
  Datafile,
  ConnectedTable as Table,
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
import { useLocation, useParams } from 'react-router-dom';
import { IndexRange } from 'react-virtualized';
import {
  checkInvestigationId,
  checkProposalName,
} from '../../../page/idCheckFunctions';
import WithIdCheck from '../../../page/withIdCheck';
import { StateType } from '../../../state/app.types';

interface BaseDLSDatafilesTableProps {
  datasetId: string;
  investigationId: string;
}

const BaseDLSDatafilesTable = (
  props: BaseDLSDatafilesTableProps
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

  const { data: allIds, isPending: allIdsLoading } = useIds(
    'datafile',
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
      },
    ],
    !disableSelectAll
  );
  const { data: cartItems, isPending: cartLoading } = useCart();
  const { mutate: addToCart, isPending: addToCartLoading } =
    useAddToCart('datafile');
  const { mutate: removeFromCart, isPending: removeFromCartLoading } =
    useRemoveFromCart('datafile');

  const { data: totalDataCount } = useDatafileCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
    },
  ]);

  // isInitialised is used to disable queries when the component isn't fully initialised.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isInitialised, setIsInitialised] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialised && Object.keys(sort).length > 0) setIsInitialised(true);
  }, [isInitialised, sort]);

  const { fetchNextPage, data } = useDatafilesInfinite(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
      },
    ],
    isInitialised
  );

  const loadMoreRows = React.useCallback(
    (_offsetParams: IndexRange) => fetchNextPage(),
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

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Subject,
        label: t('datafiles.name'),
        dataKey: 'name',
        filterComponent: textFilter,
        defaultSort: 'asc',
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
        label: t('datafiles.create_time'),
        dataKey: 'datafileCreateTime',
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
      detailsPanel={DLSDatafileDetailsPanel}
      columns={columns}
    />
  );
};

const DLSDatafilesTable = () => {
  const {
    proposalName = '',
    investigationId = '',
    datasetId = '',
  } = useParams();
  return (
    <WithIdCheck
      checkingPromise={Promise.all([
        checkProposalName(proposalName, parseInt(investigationId)),
        checkInvestigationId(parseInt(investigationId), parseInt(datasetId)),
      ]).then((values) => !values.includes(false))}
    >
      <BaseDLSDatafilesTable
        investigationId={investigationId}
        datasetId={datasetId}
      />
    </WithIdCheck>
  );
};

export default DLSDatafilesTable;
