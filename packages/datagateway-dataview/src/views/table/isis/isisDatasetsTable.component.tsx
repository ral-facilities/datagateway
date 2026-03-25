import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SaveIcon from '@mui/icons-material/Save';
import SubjectIcon from '@mui/icons-material/Subject';
import {
  ColumnType,
  Dataset,
  DetailsPanelProps,
  DownloadButton,
  ISISDatasetDetailsPanel,
  ConnectedTable as Table,
  TableActionProps,
  formatBytes,
  parseSearchToQuery,
  tableLink,
  useAddToCart,
  useCart,
  useDataPublication,
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
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IndexRange, TableCellProps } from 'react-virtualized';
import {
  checkInstrumentAndFacilityCycleId,
  checkInstrumentId,
  checkStudyDataPublicationId,
} from '../../../page/idCheckFunctions';
import WithIdCheck from '../../../page/withIdCheck';
import { StateType } from '../../../state/app.types';

interface BaseISISDatasetsTableProps {
  investigationId: string;
}

const BaseISISDatasetsTable = (
  props: BaseISISDatasetsTableProps
): React.ReactElement => {
  const { investigationId } = props;

  const [t] = useTranslation();

  const location = useLocation();

  const navigate = useNavigate();

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

  const { data: allIds, isPending: allIdsLoading } = useIds(
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
  const { data: cartItems, isPending: cartLoading } = useCart();
  const { mutate: addToCart, isPending: addToCartLoading } =
    useAddToCart('dataset');
  const { mutate: removeFromCart, isPending: removeFromCartLoading } =
    useRemoveFromCart('dataset');

  const { data: totalDataCount } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);

  // isInitialised is used to disable queries when the component isn't fully initialised.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isInitialised, setIsInitialised] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialised && Object.keys(sort).length > 0) setIsInitialised(true);
  }, [isInitialised, sort]);

  const { fetchNextPage, data } = useDatasetsInfinite(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: investigationId },
        }),
      },
    ],
    isInitialised
  );

  const loadMoreRows = React.useCallback(
    (_offsetParams: IndexRange) => fetchNextPage(),
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
            `${location.pathname}/${cellProps.rowData.id}`,
            cellProps.rowData.name,
            view
          ),
        filterComponent: textFilter,
        defaultSort: 'asc',
      },
      {
        icon: SaveIcon,
        label: t('datasets.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatBytes(cellProps.rowData.fileSize),
      },
      {
        icon: CalendarTodayIcon,
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [t, textFilter, dateFilter, view, location.pathname]
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

  const detailsPanel: React.ComponentType<DetailsPanelProps> =
    React.useCallback(
      ({ rowData, detailsPanelResize }) => (
        <ISISDatasetDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
          viewDatafiles={(id: number) =>
            navigate(`${location.pathname}/${id}/datafile`)
          }
        />
      ),
      [location.pathname, navigate]
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
      detailsPanel={detailsPanel}
      actions={[
        ({ rowData }: TableActionProps) => (
          <DownloadButton
            entityType="dataset"
            entityId={rowData.id}
            entityName={rowData.name}
            variant="icon"
            entitySize={rowData.fileSize ?? -1}
          />
        ),
      ]}
      columns={columns}
    />
  );
};

const ISISDatasetsTable = (props: { dataPublication: boolean }) => {
  const {
    instrumentId = '',
    dataPublicationId = '',
    facilityCycleId = '',
    investigationId = '',
  } = useParams();
  const { data, isPending } = useDataPublication(
    parseInt(investigationId),
    props.dataPublication
  );

  const dataPublicationInvestigationId =
    data?.content?.dataCollectionInvestigations?.[0]?.investigation?.id;

  const checkingPromise = props.dataPublication
    ? Promise.all([
        checkInstrumentId(parseInt(instrumentId), parseInt(dataPublicationId)),
        checkStudyDataPublicationId(
          parseInt(dataPublicationId),
          parseInt(investigationId)
        ),
        ...(isPending ? [new Promise(() => undefined)] : []),
      ]).then((values) => !values.includes(false))
    : checkInstrumentAndFacilityCycleId(
        parseInt(instrumentId),
        parseInt(facilityCycleId),
        parseInt(investigationId)
      );

  return (
    <WithIdCheck checkingPromise={checkingPromise}>
      <BaseISISDatasetsTable
        investigationId={
          dataPublicationInvestigationId
            ? dataPublicationInvestigationId.toString()
            : investigationId
        }
      />
    </WithIdCheck>
  );
};

export default ISISDatasetsTable;
