import {
  CalendarToday,
  Fingerprint,
  Person,
  Public,
  Save,
  Subject,
} from '@mui/icons-material';
import {
  AdditionalFilters,
  ColumnType,
  DetailsPanelProps,
  DownloadButton,
  externalSiteLink,
  formatBytes,
  Investigation,
  ISISInvestigationDetailsPanel,
  parseSearchToQuery,
  Table,
  TableActionProps,
  tableLink,
  useAddToCart,
  useCart,
  useDateFilter,
  useIds,
  useInvestigationCount,
  useInvestigationsInfinite,
  usePrincipalExperimenterFilter,
  useRemoveFromCart,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { StateType } from '../../../state/app.types';

interface ISISInvestigationsTableProps {
  instrumentId: string;
  facilityCycleId: string;
}

const ISISInvestigationsTable = (
  props: ISISInvestigationsTableProps
): React.ReactElement => {
  const { instrumentId, facilityCycleId } = props;
  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );
  const location = useLocation();
  const { push } = useHistory();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const investigationQueryFilters: AdditionalFilters = [
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationInstruments.instrument.id': {
          eq: parseInt(instrumentId),
        },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationFacilityCycles.facilityCycle.id': {
          eq: parseInt(facilityCycleId),
        },
      }),
    },
  ];

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: totalDataCount } = useInvestigationCount(
    investigationQueryFilters
  );
  const { fetchNextPage, data } = useInvestigationsInfinite(
    [
      ...investigationQueryFilters,
      {
        filterType: 'include',
        filterValue: JSON.stringify([
          {
            investigationInstruments: 'instrument',
          },
          {
            dataCollectionInvestigations: {
              dataCollection: { dataPublications: 'type' },
            },
          },
          {
            investigationUsers: 'user',
          },
        ]),
      },
    ],
    undefined,
    isMounted
  );
  const { data: allIds, isInitialLoading: allIdsLoading } = useIds(
    'investigation',
    investigationQueryFilters,
    selectAllSetting
  );
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } =
    useAddToCart('investigation');
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart('investigation');

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === 'investigation' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
  );

  /* istanbul ignore next */
  const aggregatedData: Investigation[] = React.useMemo(() => {
    if (data) {
      if ('pages' in data) {
        return data.pages.flat();
      } else if ((data as unknown) instanceof Array) {
        return data;
      }
    }

    return [];
  }, [data]);

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();
  const principalExperimenterFilter = usePrincipalExperimenterFilter(filters);

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const detailsPanel: React.ComponentType<DetailsPanelProps> =
    React.useCallback(
      ({ rowData, detailsPanelResize }) => (
        <ISISInvestigationDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
          viewDatasets={(id: number) =>
            push(`${location.pathname}/${id}/dataset`)
          }
        />
      ),
      [push, location.pathname]
    );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Subject,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `${location.pathname}/${investigationData.id}`,
            investigationData.title,
            view,
            'isis-investigations-table-title'
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        icon: Public,
        label: t('investigations.doi'),
        dataKey:
          'dataCollectionInvestigations.dataCollection.dataPublications.pid',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          const studyDataPublication =
            investigationData.dataCollectionInvestigations?.filter(
              (dci) =>
                dci.dataCollection?.dataPublications?.[0]?.type?.name ===
                'study'
            )?.[0]?.dataCollection?.dataPublications?.[0];
          if (studyDataPublication) {
            return externalSiteLink(
              `https://doi.org/${studyDataPublication.pid}`,
              studyDataPublication.pid,
              'isis-investigations-table-doi-link'
            );
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: Save,
        label: t('investigations.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatBytes(cellProps.rowData.fileSize),
      },
      {
        icon: Person,
        label: t('investigations.principal_investigators'),
        dataKey: 'investigationUsers.user.fullName',
        disableSort: true,
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          const principal_investigators =
            investigationData?.investigationUsers?.filter(
              (iu) => iu.role === 'principal_experimenter'
            );
          if (principal_investigators && principal_investigators.length !== 0) {
            return principal_investigators?.[0].user?.fullName;
          } else {
            return '';
          }
        },
        filterComponent: principalExperimenterFilter,
      },
      {
        icon: CalendarToday,
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,

        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [
      t,
      textFilter,
      principalExperimenterFilter,
      dateFilter,
      location.pathname,
      view,
    ]
  );

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
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      disableSelectAll={!selectAllSetting}
      detailsPanel={detailsPanel}
      actions={[
        ({ rowData }: TableActionProps) => (
          <DownloadButton
            entityType="investigation"
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

export default ISISInvestigationsTable;
