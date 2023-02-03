import {
  buildDatasetTableUrlForInvestigation,
  ColumnType,
  DLSVisitDetailsPanel,
  externalSiteLink,
  FACILITY_NAME,
  formatCountOrSize,
  Investigation,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
  parseSearchToQuery,
  Table,
  tableLink,
  useAddToCart,
  useCart,
  useDateFilter,
  useIds,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationsInfinite,
  useInvestigationSizes,
  useLuceneSearch,
  useRemoveFromCart,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { StateType } from '../state/app.types';

interface InvestigationTableProps {
  hierarchy: string;
}

const InvestigationSearchTable = (
  props: InvestigationTableProps
): React.ReactElement => {
  const { hierarchy } = props;

  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { startDate, endDate } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgsearch.selectAllSetting
  );

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const { data: luceneData } = useLuceneSearch('Investigation', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });

  const [t] = useTranslation();

  const { filters, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { fetchNextPage, data } = useInvestigationsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigationInstruments: 'instrument',
        investigationFacilityCycles: 'facilityCycle',
      }),
    },
  ]);
  const { data: allIds, isLoading: allIdsLoading } = useIds(
    'investigation',
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: luceneData || [] },
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

  // hierarchy === 'isis' ? data : undefined is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useInvestigationsDatasetCount(
    hierarchy !== 'isis' ? data : undefined
  );
  const sizeQueries = useInvestigationSizes(
    hierarchy === 'isis' ? data : undefined
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigation = cellProps.rowData as Investigation;
          const link = buildDatasetTableUrlForInvestigation({
            investigation,
            facilityName: hierarchy,
          });
          return link
            ? tableLink(link, investigation.title)
            : investigation.title;
        },
        filterComponent: textFilter,
      },
      {
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        label: t('investigations.doi'),
        dataKey: 'doi',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigation = cellProps.rowData as Investigation;
          return externalSiteLink(
            `https://doi.org/${investigation.doi}`,
            investigation.doi,
            'investigation-search-table-doi-link'
          );
        },
        filterComponent: textFilter,
      },
      {
        label:
          hierarchy === FACILITY_NAME.isis
            ? t('investigations.size')
            : t('investigations.dataset_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datasetCount',
        cellContentRenderer: (cellProps: TableCellProps): number | string => {
          const query =
            hierarchy === FACILITY_NAME.isis
              ? sizeQueries[cellProps.rowIndex]
              : datasetCountQueries[cellProps.rowIndex];
          return formatCountOrSize(query, hierarchy === 'isis');
        },
        disableSort: true,
      },
      {
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
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
      },
      {
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
      },
    ],
    [t, textFilter, hierarchy, dateFilter, sizeQueries, datasetCountQueries]
  );

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => {
      switch (hierarchy) {
        case FACILITY_NAME.isis:
          const url = buildDatasetTableUrlForInvestigation({
            facilityName: hierarchy,
            investigation: rowData as Investigation,
          });
          return (
            <ISISInvestigationDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
              viewDatasets={() => {
                if (url) push(url);
              }}
            />
          );

        case FACILITY_NAME.dls:
          return (
            <DLSVisitDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
            />
          );

        default:
          return (
            <InvestigationDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
            />
          );
      }
    },
    [hierarchy, push]
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
      detailsPanel={detailsPanel}
      columns={columns}
      {...(hierarchy !== 'dls' && {
        selectedRows,
        allIds,
        onCheck: addToCart,
        onUncheck: removeFromCart,
        disableSelectAll: !selectAllSetting,
      })}
    />
  );
};

export default InvestigationSearchTable;
