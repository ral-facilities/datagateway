import React from 'react';
import {
  type ColumnType,
  type Dataset,
  DatasetDetailsPanel,
  DLSDatasetDetailsPanel,
  type FacilityCycle,
  ISISDatasetDetailsPanel,
  parseSearchToQuery,
  type SearchResponse,
  type SearchResultSource,
  Table,
  tableLink,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useLuceneSearchInfinite,
  useRemoveFromCart,
  useSort,
} from 'datagateway-common';
import type { IndexRange, TableCellProps } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { StateType } from '../state/app.types';
import { Grid, Paper, Typography } from '@mui/material';
import { DatasetDatafileCountCell, DatasetSizeCell } from './cellRenderers';
import FacetPanel from '../facet/components/facetPanel/facetPanel.component';
import { facetClassificationFromSearchResponses } from '../facet/facet';
import useFacetFilters from '../facet/useFacetFilters';
import SelectedFilterChips from '../facet/components/selectedFilterChips.component';
import { useSearchResultCounter } from '../searchTabs/useSearchResultCounter';

interface DatasetTableProps {
  hierarchy: string;
}

const DatasetSearchTable = ({
  hierarchy,
}: DatasetTableProps): React.ReactElement => {
  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { startDate, endDate, sort, filters, restrict, searchText, dataset } =
    queryParams;

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgsearch.selectAllSetting
  );

  const minNumResults = useSelector(
    (state: StateType) => state.dgsearch.minNumResults
  );

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  console.log('dataset enabled', dataset);

  const { fetchNextPage, data, hasNextPage, refetch, isFetching } =
    useLuceneSearchInfinite(
      'Dataset',
      {
        searchText: searchText ?? '',
        startDate,
        endDate,
        sort,
        minCount: minNumResults,
        maxCount: maxNumResults,
        restrict,
        facets: [{ target: 'Dataset' }],
      },
      filters,
      { enabled: dataset }
    );

  const [t] = useTranslation();

  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } =
    useAddToCart('dataset');
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart('dataset');

  const {
    selectedFacetFilters,
    addFacetFilter,
    removeFacetFilter,
    applyFacetFilters,
  } = useFacetFilters();

  useSearchResultCounter({
    isFetching,
    dataSearchType: 'Dataset',
    searchResponses: data?.pages,
    hasMore: hasNextPage,
  });

  function mapSource(response: SearchResponse): SearchResultSource[] {
    return response.results?.map((result) => result.source) ?? [];
  }

  function mapIds(response: SearchResponse): number[] {
    return response.results?.map((result) => result.id) ?? [];
  }

  const { aggregatedSource, aggregatedIds, aborted } = React.useMemo(() => {
    if (data) {
      return {
        aggregatedSource: data.pages
          .map((response) => mapSource(response))
          .flat(),
        aggregatedIds: data.pages.map((response) => mapIds(response)).flat(),
        aborted: data.pages[data.pages.length - 1].aborted,
      };
    } else {
      return {
        aggregatedSource: [],
        aggregatedIds: [],
        aborted: false,
      };
    }
  }, [data]);

  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage(),
    [fetchNextPage]
  );

  const removeFilterChip = (dimension: string, filterValue: string): void => {
    removeFacetFilter({ dimension, filterValue, applyImmediately: true });
  };

  const dlsLinkURL = (
    datasetData: SearchResultSource,
    linkType = 'dataset'
  ): string | null => {
    if (datasetData['investigation.name'] && datasetData['investigation.id']) {
      return linkType === 'investigation'
        ? `/browse/proposal/${datasetData['investigation.name']}/investigation/${datasetData['investigation.id']}/dataset`
        : `/browse/proposal/${datasetData['investigation.name']}/investigation/${datasetData['investigation.id']}/dataset/${datasetData.id}/datafile`;
    }
    return null;
  };

  const dlsLink = React.useCallback(
    (
      datasetData: SearchResultSource,
      linkType = 'dataset'
    ): React.ReactElement | string => {
      const linkURL = dlsLinkURL(datasetData, linkType);

      if (datasetData['investigation.title'] && linkURL) {
        return linkType === 'investigation'
          ? tableLink(linkURL, datasetData['investigation.title'])
          : tableLink(linkURL, datasetData.name);
      }
      return linkType === 'investigation' ? '' : datasetData.name;
    },
    []
  );

  const isisLinkURL = React.useCallback(
    (datasetData: SearchResultSource, linkType = 'dataset') => {
      let instrumentId;
      let investigationId;
      let facilityCycleId;
      if (datasetData.investigationinstrument?.length) {
        instrumentId = datasetData.investigationinstrument[0]['instrument.id'];
        investigationId = datasetData['investigation.id'];
      } else {
        return null;
      }

      if (facilityCycles?.length && datasetData['investigation.startDate']) {
        const investigationDate = new Date(
          datasetData['investigation.startDate']
        ).toISOString();
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles?.filter(
          (facilityCycle: FacilityCycle) =>
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            investigationDate >= facilityCycle.startDate &&
            investigationDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId) {
        return linkType === 'investigation'
          ? `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}`
          : `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset/${datasetData.id}`;
      }
      return null;
    },
    [facilityCycles]
  );

  const isisLink = React.useCallback(
    (datasetData: SearchResultSource, linkType = 'dataset') => {
      const linkURL = isisLinkURL(datasetData, linkType);

      if (datasetData['investigation.title'] && linkURL) {
        return linkType === 'investigation'
          ? tableLink(linkURL, datasetData['investigation.title'])
          : tableLink(linkURL, datasetData.name);
      } else return linkType === 'investigation' ? '' : datasetData.name;
    },
    [isisLinkURL]
  );

  const genericLinkURL = React.useCallback(
    (datasetData: SearchResultSource, linkType = 'dataset'): string | null => {
      if (datasetData['investigation.id']) {
        return linkType === 'investigation'
          ? `/browse/investigation/${datasetData['investigation.id']}/dataset`
          : `/browse/investigation/${datasetData['investigation.id']}/dataset/${datasetData.id}/datafile`;
      }
      return null;
    },
    []
  );

  const genericLink = React.useCallback(
    (
      datasetData: SearchResultSource,
      linkType = 'dataset'
    ): React.ReactElement | string => {
      const linkURL = genericLinkURL(datasetData, linkType);
      if (datasetData['investigation.title'] && linkURL) {
        return linkType === 'investigation'
          ? tableLink(linkURL, datasetData['investigation.title'])
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
              (aggregatedIds && aggregatedIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, aggregatedIds]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('datasets.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datasetData = cellProps.rowData as SearchResultSource;
          return hierarchyLink(datasetData);
        },
        disableSort: true,
      },
      {
        label:
          hierarchy === 'isis'
            ? t('datasets.size')
            : t('datasets.datafile_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datafileCount',
        cellContentRenderer: (cellProps: TableCellProps): JSX.Element => {
          if (hierarchy === 'isis' && cellProps.rowData.fileSize) {
            return <>formatBytes(cellProps.rowData.fileSize)</>;
          }
          if (hierarchy === 'isis') {
            return <DatasetSizeCell dataset={cellProps.rowData as Dataset} />;
          }
          return (
            <DatasetDatafileCountCell dataset={cellProps.rowData as Dataset} />
          );
        },
        disableSort: true,
      },
      {
        label: t('datasets.investigation'),
        dataKey: 'investigation.title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datasetData = cellProps.rowData as SearchResultSource;
          return hierarchyLink(datasetData, 'investigation');
        },
        disableSort: true,
      },
      {
        label: t('datasets.create_time'),
        dataKey: 'startDate',
        disableSort: true,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return new Date(cellProps.cellData).toLocaleDateString();
          }
        },
      },
      {
        label: t('datasets.modified_time'),
        dataKey: 'endDate',
        disableSort: true,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return new Date(cellProps.cellData).toLocaleDateString();
          }
        },
      },
    ],
    [t, hierarchy, hierarchyLink]
  );

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => {
      if (hierarchy === 'isis') {
        const datafilesURL = hierarchyLinkURL(rowData as SearchResultSource);
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

  console.log('isFetching', isFetching);

  return (
    <Grid
      data-testid="dataset-search-table"
      container
      spacing={1}
      sx={{ height: '100%' }}
    >
      <Grid item xs={2} sx={{ height: '100%' }}>
        {data?.pages && (
          <FacetPanel
            facetClassification={facetClassificationFromSearchResponses(
              data.pages
            )}
            selectedFacetFilters={selectedFacetFilters}
            onAddFilter={(dimension, filterValue) =>
              addFacetFilter({
                dimension,
                filterValue,
                applyImmediately: false,
              })
            }
            onRemoveFilter={(dimension, filterValue) =>
              removeFacetFilter({
                dimension,
                filterValue,
                applyImmediately: false,
              })
            }
            onApplyFacetFilters={() => {
              applyFacetFilters();
              refetch();
            }}
          />
        )}
      </Grid>
      <Grid item xs={10}>
        <SelectedFilterChips
          filters={filters}
          onRemoveFilter={removeFilterChip}
        />
        <Paper variant="outlined" sx={{ height: '100%' }}>
          <div>
            {aborted ? (
              <Paper>
                <Typography align="center" variant="h6" component="h6">
                  {t('loading.abort_message')}
                </Typography>
              </Paper>
            ) : (
              <Table
                loading={
                  addToCartLoading || removeFromCartLoading || cartLoading
                }
                data={aggregatedSource}
                loadMoreRows={loadMoreRows}
                totalRowCount={
                  aggregatedSource?.length + (hasNextPage ? 1 : 0) ?? 0
                }
                sort={{}}
                onSort={handleSort}
                selectedRows={selectedRows}
                disableSelectAll={!selectAllSetting}
                allIds={aggregatedIds}
                onCheck={addToCart}
                onUncheck={removeFromCart}
                detailsPanel={detailsPanel}
                columns={columns}
                shortHeader={true}
              />
            )}
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DatasetSearchTable;
