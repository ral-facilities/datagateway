import {
  ColumnType,
  formatCountOrSize,
  Investigation,
  parseSearchToQuery,
  readSciGatewayToken,
  Table,
  tableLink,
  externalSiteLink,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDateFilter,
  useIds,
  useInvestigationCount,
  useInvestigationsInfinite,
  useInvestigationSizes,
  useSort,
  useRemoveFromCart,
  useTextFilter,
  ISISInvestigationDetailsPanel,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { StateType } from '../../../state/app.types';

import {
  Subject,
  Fingerprint,
  Public,
  Save,
  Assessment,
  CalendarToday,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

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
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'investigation'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('investigation');
  const { data: facilityCycles } = useAllFacilityCycles();

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

  const aggregatedData: Investigation[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const sizeQueries = useInvestigationSizes(data);

  const urlPrefix = React.useCallback(
    (investigationData: Investigation): string => {
      if (
        investigationData?.investigationInstruments?.[0]?.instrument &&
        facilityCycles
      ) {
        const facilityCycle = facilityCycles.find(
          (facilitycycle) =>
            facilitycycle.startDate &&
            facilitycycle.endDate &&
            investigationData.startDate &&
            facilitycycle.startDate <= investigationData.startDate &&
            facilitycycle.endDate >= investigationData.startDate
        );
        if (facilityCycle) {
          return `/browse/instrument/${investigationData.investigationInstruments[0].instrument.id}/facilityCycle/${facilityCycle.id}/investigation`;
        }
      }
      return '';
    },
    [facilityCycles]
  );

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => (
      <ISISInvestigationDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        viewDatasets={
          urlPrefix(rowData as Investigation)
            ? (id: number) =>
                push(`${urlPrefix(rowData as Investigation)}/${id}/dataset`)
            : undefined
        }
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
          const url = urlPrefix(investigationData);
          if (url) {
            return tableLink(
              `${url}/${investigationData.id}`,
              investigationData.title,
              view,
              'isis-mydata-table-title'
            );
          } else {
            return investigationData.title;
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: Public,
        label: t('investigations.doi'),
        dataKey: 'studyInvestigations.study.pid',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.studyInvestigations?.[0]?.study) {
            return externalSiteLink(
              `https://doi.org/${investigationData.studyInvestigations[0].study.pid}`,
              investigationData.studyInvestigations[0].study.pid,
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
          const url = urlPrefix(investigationData);
          if (url) {
            return tableLink(
              `${url}/${investigationData.id}`,
              investigationData.name,
              view
            );
          } else {
            return investigationData.name;
          }
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
    [t, textFilter, dateFilter, urlPrefix, view, sizeQueries]
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
