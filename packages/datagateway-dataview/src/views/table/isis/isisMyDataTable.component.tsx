import {
  Assessment,
  CalendarToday,
  Fingerprint,
  Public,
  Save,
  Subject,
} from '@mui/icons-material';
import {
  ColumnType,
  externalSiteLink,
  FACILITY_NAME,
  formatCountOrSize,
  Investigation,
  ISISInvestigationDetailsPanel,
  parseSearchToQuery,
  readSciGatewayToken,
  Table,
  tableLink,
  useAddToCart,
  useCart,
  useDateFilter,
  useIds,
  useInvestigationCount,
  useInvestigationsInfinite,
  useInvestigationSizes,
  useRemoveFromCart,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import {
  buildDatasetTableUrlForInvestigation,
  buildInvestigationLandingUrl,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { StateType } from '../../../state/app.types';

const ISISMyDataTable = (): React.ReactElement => {
  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );
  const location = useLocation();
  const { push } = useHistory();
  const [t] = useTranslation();
  const username = readSciGatewayToken().username || '';

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationUsers.user.name': { eq: username },
      }),
    },
  ]);
  const { fetchNextPage, data } = useInvestigationsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationUsers.user.name': { eq: username },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify([
        {
          investigationInstruments: 'instrument',
        },
        { investigationFacilityCycles: 'facilityCycle' },
        { studyInvestigations: 'study' },
      ]),
    },
  ]);
  const { data: allIds, isLoading: allIdsLoading } = useIds(
    'investigation',
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigationUsers.user.name': { eq: username },
        }),
      },
    ],
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

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const sizeQueries = useInvestigationSizes(data);

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => {
      const datasetTableUrl = buildDatasetTableUrlForInvestigation({
        facilityName: FACILITY_NAME.isis,
        investigation: rowData as Investigation,
      });
      return (
        <ISISInvestigationDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
          viewDatasets={() => {
            if (datasetTableUrl) push(datasetTableUrl);
          }}
        />
      );
    },
    [push]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Subject,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          const url = buildInvestigationLandingUrl(investigationData);
          return url
            ? tableLink(
                url,
                investigationData.title,
                view,
                'isis-mydata-table-title'
              )
            : investigationData.title;
        },
        filterComponent: textFilter,
      },
      {
        icon: Public,
        label: t('investigations.doi'),
        dataKey: 'studyInvestigations.study.pid',
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
              'isis-mydata-table-doi-link'
            );
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        icon: Subject,
        label: t('investigations.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          const url = buildInvestigationLandingUrl(investigationData);
          return url
            ? tableLink(url, investigationData.name, view)
            : investigationData.name;
        },
        filterComponent: textFilter,
      },
      {
        icon: Assessment,
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.fullName',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.investigationInstruments?.[0]?.instrument) {
            return investigationData.investigationInstruments[0].instrument
              .fullName;
          }
          return '';
        },
        filterComponent: textFilter,
      },
      {
        icon: Save,
        label: t('investigations.size'),
        dataKey: 'size',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatCountOrSize(sizeQueries[cellProps.rowIndex], true),
        disableSort: true,
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
    [t, textFilter, dateFilter, view, sizeQueries]
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
      columns={columns}
    />
  );
};

export default ISISMyDataTable;
