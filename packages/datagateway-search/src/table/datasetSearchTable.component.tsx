import React from 'react';
import {
  Table,
  Dataset,
  tableLink,
  FacilityCycle,
  ColumnType,
  formatCountOrSize,
  parseSearchToQuery,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDatasetCount,
  useDatasetsDatafileCount,
  useDatasetsInfinite,
  useDatasetSizes,
  useDateFilter,
  useIds,
  useLuceneSearch,
  useSort,
  useRemoveFromCart,
  useTextFilter,
  DatasetDetailsPanel,
  ISISDatasetDetailsPanel,
  DLSDatasetDetailsPanel,
} from 'datagateway-common';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';

interface DatasetTableProps {
  hierarchy: string;
}

const DatasetSearchTable = (props: DatasetTableProps): React.ReactElement => {
  const { hierarchy } = props;

  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
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
        investigation: { investigationInstruments: 'instrument' },
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
  const { mutate: addToCart, isLoading: addToCartLoading } = useAddToCart(
    'dataset'
  );
  const {
    mutate: removeFromCart,
    isLoading: removeFromCartLoading,
  } = useRemoveFromCart('dataset');

  const aggregatedData: Dataset[] = React.useMemo(
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

  const dlsLinkURL = (
    datasetData: Dataset,
    linkType = 'dataset'
  ): string | null => {
    if (datasetData.investigation) {
      return linkType === 'investigation'
        ? `/browse/proposal/${datasetData.investigation.name}/investigation/${datasetData.investigation.id}/dataset`
        : `/browse/proposal/${datasetData.investigation.name}/investigation/${datasetData.investigation.id}/dataset/${datasetData.id}/datafile`;
    }
    return null;
  };

  const dlsLink = React.useCallback(
    (
      datasetData: Dataset,
      linkType = 'dataset'
    ): React.ReactElement | string => {
      const linkURL = dlsLinkURL(datasetData, linkType);

      if (datasetData.investigation && linkURL) {
        return linkType === 'investigation'
          ? tableLink(linkURL, datasetData.investigation.title)
          : tableLink(linkURL, datasetData.name);
      }
      return linkType === 'investigation' ? '' : datasetData.name;
    },
    []
  );

  const isisLinkURL = React.useCallback(
    (datasetData: Dataset, linkType = 'dataset') => {
      let instrumentId;
      let facilityCycleId;
      if (datasetData.investigation?.investigationInstruments?.length) {
        instrumentId =
          datasetData.investigation?.investigationInstruments[0].instrument?.id;
      } else {
        return null;
      }

      if (facilityCycles?.length && datasetData.investigation?.startDate) {
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles?.filter(
          (facilityCycle: FacilityCycle) =>
            datasetData.investigation?.startDate &&
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            datasetData.investigation.startDate >= facilityCycle.startDate &&
            datasetData.investigation.startDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId) {
        return linkType === 'investigation'
          ? `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datasetData.investigation.id}`
          : `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${datasetData.investigation.id}/dataset/${datasetData.id}`;
      }
      return null;
    },
    [facilityCycles]
  );

  const isisLink = React.useCallback(
    (datasetData: Dataset, linkType = 'dataset') => {
      const linkURL = isisLinkURL(datasetData, linkType);

      if (datasetData.investigation && linkURL) {
        return linkType === 'investigation'
          ? tableLink(linkURL, datasetData.investigation.title)
          : tableLink(linkURL, datasetData.name);
      } else return linkType === 'investigation' ? '' : datasetData.name;
    },
    [isisLinkURL]
  );

  const genericLinkURL = React.useCallback(
    (datasetData: Dataset, linkType = 'dataset'): string | null => {
      if (datasetData.investigation) {
        return linkType === 'investigation'
          ? `/browse/investigation/${datasetData.investigation.id}/dataset`
          : `/browse/investigation/${datasetData.investigation.id}/dataset/${datasetData.id}/datafile`;
      }
      return null;
    },
    []
  );

  const genericLink = React.useCallback(
    (
      datasetData: Dataset,
      linkType = 'dataset'
    ): React.ReactElement | string => {
      const linkURL = genericLinkURL(datasetData, linkType);
      if (datasetData.investigation && linkURL) {
        return linkType === 'investigation'
          ? tableLink(linkURL, datasetData.investigation.title)
          : tableLink(linkURL, datasetData.name);
      }
      return linkType === 'investigation' ? '' : datasetData.name;
    },
    [genericLinkURL]
  );

  const hierarchyLinkURL = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLinkURL;
    } else if (hierarchy === 'isis') {
      return isisLinkURL;
    } else {
      return genericLinkURL;
    }
  }, [genericLinkURL, hierarchy, isisLinkURL]);

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLink;
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      return genericLink;
    }
  }, [dlsLink, genericLink, hierarchy, isisLink]);

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
    hierarchy !== 'isis' ? data : undefined
  );
  const sizeQueries = useDatasetSizes(hierarchy === 'isis' ? data : undefined);

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('datasets.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datasetData = cellProps.rowData as Dataset;
          return hierarchyLink(datasetData);
        },
        filterComponent: textFilter,
      },
      {
        label:
          hierarchy === 'isis'
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
          return hierarchyLink(datasetData, 'investigation');
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
    [
      t,
      textFilter,
      hierarchy,
      dateFilter,
      hierarchyLink,
      sizeQueries,
      datasetCountQueries,
    ]
  );

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => {
      if (hierarchy === 'isis') {
        const datafilesURL = hierarchyLinkURL(rowData as Dataset);
        return (
          <ISISDatasetDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            viewDatafiles={
              datafilesURL
                ? (id: number) => {
                    push(datafilesURL);
                  }
                : undefined
            }
          />
        );
      } else if (hierarchy === 'dls') {
        return (
          <DLSDatasetDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
          />
        );
      } else {
        return (
          <DatasetDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
          />
        );
      }
    },
    [hierarchy, hierarchyLinkURL, push]
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
