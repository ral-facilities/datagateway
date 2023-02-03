import {
  buildDatafileTableUrlForDataset,
  buildDatasetLandingUrl,
  buildDatasetTableUrlForInvestigation,
  buildInvestigationLandingUrl,
  ColumnType,
  Dataset,
  DatasetDetailsPanel,
  DLSDatasetDetailsPanel,
  FACILITY_NAME,
  formatCountOrSize,
  ISISDatasetDetailsPanel,
  parseSearchToQuery,
  Table,
  tableLink,
  useAddToCart,
  useCart,
  useDatasetCount,
  useDatasetsDatafileCount,
  useDatasetsInfinite,
  useDatasetSizes,
  useDateFilter,
  useIds,
  useLuceneSearch,
  useRemoveFromCart,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import { isLandingPageSupportedForHierarchy } from 'datagateway-common/src';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { StateType } from '../state/app.types';

interface DatasetTableProps {
  hierarchy: string;
}

const DatasetSearchTable = (props: DatasetTableProps): React.ReactElement => {
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

  const { data: luceneData } = useLuceneSearch('Dataset', {
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

  const { data: totalDataCount } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { fetchNextPage, data } = useDatasetsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigation: {
          investigationInstruments: 'instrument',
          investigationFacilityCycles: 'facilityCycle',
        },
      }),
    },
  ]);
  const { data: allIds, isLoading: allIdsLoading } = useIds(
    'dataset',
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
    useAddToCart('dataset');
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart('dataset');

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
            cartItem.entityType === 'dataset' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (allIds && allIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, allIds]
  );

  // hierarchy === 'isis' ? data : undefined is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useDatasetsDatafileCount(
    hierarchy !== FACILITY_NAME.isis ? data : undefined
  );
  const sizeQueries = useDatasetSizes(hierarchy === 'isis' ? data : undefined);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('datasets.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const dataset = cellProps.rowData as Dataset;
          const url = isLandingPageSupportedForHierarchy(hierarchy)
            ? buildDatasetLandingUrl(dataset)
            : buildDatafileTableUrlForDataset({
                dataset,
                facilityName: hierarchy,
              });
          return url ? tableLink(url, dataset.name) : dataset.name;
        },
        filterComponent: textFilter,
      },
      {
        label:
          hierarchy === FACILITY_NAME.isis
            ? t('datasets.size')
            : t('datasets.datafile_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datafileCount',
        cellContentRenderer: (cellProps: TableCellProps): number | string => {
          const query =
            hierarchy === 'isis'
              ? sizeQueries[cellProps.rowIndex]
              : datasetCountQueries[cellProps.rowIndex];
          return formatCountOrSize(query, hierarchy === 'isis');
        },
        disableSort: true,
      },
      {
        label: t('datasets.investigation'),
        dataKey: 'investigation.title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datasetData = cellProps.rowData as Dataset;
          const investigation = datasetData.investigation;
          if (!investigation) return '';

          const link = isLandingPageSupportedForHierarchy(hierarchy)
            ? buildInvestigationLandingUrl(investigation)
            : buildDatasetTableUrlForInvestigation({
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
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
      },
      {
        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [t, textFilter, hierarchy, dateFilter, sizeQueries, datasetCountQueries]
  );

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => {
      switch (hierarchy) {
        case FACILITY_NAME.isis:
          const dataset = rowData as Dataset;
          const url = buildDatafileTableUrlForDataset({
            dataset,
            facilityName: hierarchy,
          });
          return (
            <ISISDatasetDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
              viewDatafiles={() => {
                if (url) push(url);
              }}
            />
          );

        case FACILITY_NAME.dls:
          return (
            <DLSDatasetDetailsPanel
              rowData={rowData}
              detailsPanelResize={detailsPanelResize}
            />
          );

        default:
          return (
            <DatasetDetailsPanel
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
      selectedRows={selectedRows}
      disableSelectAll={!selectAllSetting}
      allIds={allIds}
      onCheck={addToCart}
      onUncheck={removeFromCart}
      detailsPanel={detailsPanel}
      columns={columns}
    />
  );
};

export default DatasetSearchTable;
