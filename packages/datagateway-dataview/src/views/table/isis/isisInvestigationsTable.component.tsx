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
  instrumentChildId: string;
  dataPublication: boolean;
}

const ISISInvestigationsTable = (
  props: ISISInvestigationsTableProps
): React.ReactElement => {
  const { instrumentId, instrumentChildId, dataPublication } = props;
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
        [dataPublication
          ? 'dataCollectionInvestigations.dataCollection.dataPublications.id'
          : 'investigationFacilityCycles.facilityCycle.id']: {
          eq: parseInt(instrumentChildId),
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
              dataCollection: 'dataPublications',
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
  const { data: allIds, isLoading: allIdsLoading } = useIds(
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

  const pathRoot = dataPublication ? 'browseDataPublications' : 'browse';
  const instrumentChild = dataPublication ? 'dataPublication' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation`;

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => (
      <ISISInvestigationDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        viewDatasets={(id: number) => push(`${urlPrefix}/${id}/dataset`)}
      />
    ),
    [push, urlPrefix]
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
            `${urlPrefix}/${investigationData.id}`,
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
        // TODO: this was previously the Study DOI - currently there are no datapublication
        // representations of Studies, only of Investigations themselves
        // should this be showing the study DOI or the investigation DOI anyway?
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (
            investigationData?.dataCollectionInvestigations?.[0]?.dataCollection
              ?.dataPublications?.[0]
          ) {
            return externalSiteLink(
              `https://doi.org/${investigationData.dataCollectionInvestigations?.[0]?.dataCollection?.dataPublications?.[0].pid}`,
              investigationData.dataCollectionInvestigations?.[0]
                ?.dataCollection?.dataPublications?.[0].pid,
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
        dataKey: 'size',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatBytes(cellProps.rowData.fileSize),
        disableSort: true,
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
    [t, textFilter, principalExperimenterFilter, dateFilter, urlPrefix, view]
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
