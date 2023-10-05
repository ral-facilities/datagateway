import {
  type ColumnType,
  DatasetDetailsPanel,
  DLSDatasetDetailsPanel,
  ISISDatasetDetailsPanel,
  parseSearchToQuery,
  SearchFilter,
  type SearchResponse,
  type SearchResultSource,
  buildDatafileTableUrlForDataset,
  buildDatasetLandingUrl,
  buildDatasetTableUrlForInvestigation,
  buildInvestigationLandingUrl,
  FACILITY_NAME,
  isLandingPageSupportedForHierarchy,
  Table,
  tableLink,
  useAddToCart,
  useCart,
  useLuceneSearchInfinite,
  useRemoveFromCart,
  useSort,
  formatBytes,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { StateType } from '../state/app.types';
import { Grid, Paper, Typography } from '@mui/material';
import { DatasetDatafileCountCell, DatasetSizeCell } from './cellRenderers';
import FacetPanel from '../facet/components/facetPanel/facetPanel.component';
import { facetClassificationFromSearchResponses } from '../facet/facet';
import useFacetFilters from '../facet/useFacetFilters';
import SelectedFilterChips from '../facet/components/selectedFilterChips.component';
import { useSearchResultCounter } from '../searchTabs/useSearchResultCounter';
import { useHistory, useLocation } from 'react-router-dom';
import type { IndexRange, TableCellProps } from 'react-virtualized';

interface DatasetTableProps {
  hierarchy: string;
}

const DatasetSearchTable = ({
  hierarchy,
}: DatasetTableProps): React.ReactElement => {
  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const {
    startDate,
    endDate,
    sort,
    filters,
    restrict,
    searchText,
    dataset,
    currentTab,
  } = queryParams;

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgsearch.selectAllSetting
  );

  const minNumResults = useSelector(
    (state: StateType) => state.dgsearch.minNumResults
  );

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const { fetchNextPage, data, hasNextPage, isFetching } =
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
        facets: [
          { target: 'Dataset' },
          {
            target: 'DatasetParameter',
            dimensions: [{ dimension: 'type.name' }],
          },
          {
            target: 'InvestigationInstrument',
            dimensions: [{ dimension: 'instrument.name' }],
          },
        ],
      },
      currentTab === 'dataset' ? filters : {},
      {
        enabled: dataset,
        // // this select removes the facet count for the InvestigationInstrument.instrument.name
        // // facet since the number is confusing
        // select: (data) => ({
        //   ...data,
        //   pages: data.pages.map((searchResponse) => {
        //     console.log('test', {
        //       ...searchResponse.dimensions,
        //       'InvestigationInstrument.instrument.name': Object.keys(
        //         searchResponse.dimensions?.[
        //           'InvestigationInstrument.instrument.name'
        //         ] ?? {}
        //       ).reduce(
        //         (
        //           accumulator: { [key: string]: undefined },
        //           current: string
        //         ) => {
        //           accumulator[current] = undefined;
        //           return accumulator;
        //         },
        //         {}
        //       ),
        //     });
        //     return {
        //       ...searchResponse,
        //       dimensions: {
        //         ...searchResponse.dimensions,
        //         'InvestigationInstrument.instrument.name': Object.keys(
        //           searchResponse.dimensions?.[
        //             'InvestigationInstrument.instrument.name'
        //           ] ?? {}
        //         ).reduce(
        //           (
        //             accumulator: { [key: string]: undefined },
        //             current: string
        //           ) => {
        //             accumulator[current] = undefined;
        //             return accumulator;
        //           },
        //           {}
        //         ),
        //       },
        //     };
        //   }),
        // }),
      }
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
    haveUnappliedFilters,
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

  const removeFilterChip = (
    dimension: string,
    filterValue: SearchFilter
  ): void => {
    removeFacetFilter({ dimension, filterValue, applyImmediately: true });
  };

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
          if (
            !datasetData['investigation.id'] ||
            !datasetData['investigation.name']
          )
            return datasetData.name;
          const dataset = {
            id: datasetData.id,
            name: datasetData.name,
            investigation: {
              id: datasetData['investigation.id'],
              name: datasetData['investigation.name'],
              instrumentId:
                datasetData.investigationinstrument?.[0]?.['instrument.id'],
              facilityCycleId:
                datasetData.investigationfacilitycycle?.[0]?.[
                  'facilityCycle.id'
                ],
            },
          };
          const url = isLandingPageSupportedForHierarchy(hierarchy)
            ? buildDatasetLandingUrl(dataset)
            : buildDatafileTableUrlForDataset({
                dataset,
                facilityName: hierarchy,
              });
          return url ? tableLink(url, dataset.name) : dataset.name;
        },
        disableSort: true,
      },
      {
        label:
          hierarchy === FACILITY_NAME.isis
            ? t('datasets.size')
            : t('datasets.datafile_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datafileCount',
        cellContentRenderer: (cellProps: TableCellProps): JSX.Element => {
          if (hierarchy === 'isis' && cellProps.rowData.fileSize) {
            return <>{formatBytes(cellProps.rowData.fileSize)}</>;
          }
          if (hierarchy === 'isis') {
            return (
              <DatasetSizeCell
                dataset={cellProps.rowData as SearchResultSource}
              />
            );
          }
          return (
            <DatasetDatafileCountCell
              dataset={cellProps.rowData as SearchResultSource}
            />
          );
        },
        disableSort: true,
      },
      {
        label: t('datasets.investigation'),
        dataKey: 'investigation.title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datasetData = cellProps.rowData as SearchResultSource;
          if (
            !datasetData['investigation.id'] ||
            !datasetData['investigation.name'] ||
            !datasetData['investigation.title']
          )
            return '';

          const investigation = {
            id: datasetData['investigation.id'],
            name: datasetData['investigation.name'],
            title: datasetData['investigation.title'],
            instrumentId:
              datasetData.investigationinstrument?.[0]?.['instrument.id'],
            facilityCycleId:
              datasetData.investigationfacilitycycle?.[0]?.['facilityCycle.id'],
          };

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
    [t, hierarchy]
  );

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => {
      switch (hierarchy) {
        case FACILITY_NAME.isis:
          const dataset = rowData as SearchResultSource;
          let url: string | null = null;
          if (dataset['investigation.id'] && dataset['investigation.name']) {
            const formattedDataset = {
              id: dataset.id,
              name: dataset.name,
              investigation: {
                id: dataset['investigation.id'],
                name: dataset['investigation.name'],
                instrumentId:
                  dataset.investigationinstrument?.[0]?.['instrument.id'],
                facilityCycleId:
                  dataset.investigationfacilitycycle?.[0]?.['facilityCycle.id'],
              },
            };
            url = buildDatafileTableUrlForDataset({
              dataset: formattedDataset,
              facilityName: hierarchy,
            });
          }
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
    <Grid
      data-testid="dataset-search-table"
      container
      spacing={1}
      sx={{ height: '100%' }}
    >
      <Grid item xs={2} sx={{ height: '100%' }}>
        {data?.pages && (
          <FacetPanel
            allIds={aggregatedIds}
            entityName="Dataset"
            showApplyButton={haveUnappliedFilters}
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
            onApplyFacetFilters={applyFacetFilters}
          />
        )}
      </Grid>
      <Grid item xs={10}>
        <SelectedFilterChips
          filters={filters}
          onRemoveFilter={removeFilterChip}
        />
        <Paper variant="outlined" sx={{ height: '100%', marginTop: 1 }}>
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
