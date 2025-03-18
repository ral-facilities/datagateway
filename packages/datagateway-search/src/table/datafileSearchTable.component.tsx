import {
  ColumnType,
  DatafileDetailsPanel,
  DLSDatafileDetailsPanel,
  formatBytes,
  ISISDatafileDetailsPanel,
  parseSearchToQuery,
  SearchFilter,
  SearchResponse,
  SearchResultSource,
  buildDatafileTableUrlForDataset,
  buildDatasetLandingUrl,
  buildUrlToDatafileTableContainingDatafile,
  FACILITY_NAME,
  isLandingPageSupportedForHierarchy,
  Table,
  tableLink,
  useAddToCart,
  useCart,
  useLuceneSearchInfinite,
  useRemoveFromCart,
  useSort,
} from 'datagateway-common';
import type { TableCellProps } from 'react-virtualized';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { StateType } from '../state/app.types';
import { Grid, Paper, Typography } from '@mui/material';
import FacetPanel from '../facet/components/facetPanel/facetPanel.component';
import { facetClassificationFromSearchResponses } from '../facet/facet';
import useFacetFilters from '../facet/useFacetFilters';
import SelectedFilterChips from '../facet/components/selectedFilterChips.component';
import { useSearchResultCounter } from '../searchTabs/useSearchResultCounter';

interface DatafileSearchTableProps {
  hierarchy: string;
}

const DatafileSearchTable: React.FC<DatafileSearchTableProps> = (props) => {
  const { hierarchy } = props;

  const location = useLocation();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { startDate, endDate, sort, filters, restrict, datafile, currentTab } =
    queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

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
      'Datafile',
      {
        searchText,
        startDate,
        endDate,
        sort,
        minCount: minNumResults,
        maxCount: maxNumResults,
        restrict,
        facets: [
          { target: 'Datafile' },
          {
            target: 'DatafileParameter',
            dimensions: [{ dimension: 'type.name' }],
          },
          {
            target: 'InvestigationInstrument',
            dimensions: [{ dimension: 'instrument.name' }],
          },
        ],
      },
      currentTab === 'datafile' ? filters : {},
      {
        enabled: datafile,
        // this select removes the facet count for the InvestigationInstrument.instrument.name
        // facet since the number is confusing for datafiles
        select: (data) => ({
          ...data,
          pages: data.pages.map((searchResponse) => ({
            ...searchResponse,
            dimensions: {
              ...searchResponse.dimensions,
              ...(searchResponse.dimensions?.[
                'InvestigationInstrument.instrument.name'
              ]
                ? {
                    'InvestigationInstrument.instrument.name': Object.keys(
                      searchResponse.dimensions?.[
                        'InvestigationInstrument.instrument.name'
                      ]
                    ).reduce(
                      (
                        accumulator: { [key: string]: undefined },
                        current: string
                      ) => {
                        accumulator[current] = undefined;
                        return accumulator;
                      },
                      {}
                    ),
                  }
                : {}),
            },
          })),
        }),
      }
    );
  const [t] = useTranslation();

  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } =
    useAddToCart('datafile');
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart('datafile');

  useSearchResultCounter({
    isFetching,
    dataSearchType: 'Datafile',
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
    }

    return {
      aggregatedSource: [],
      aggregatedIds: [],
      aborted: false,
    };
  }, [data]);

  const {
    selectedFacetFilters,
    addFacetFilter,
    removeFacetFilter,
    applyFacetFilters,
    haveUnappliedFilters,
  } = useFacetFilters();

  const handleSort = useSort();

  const loadMoreRows: NonNullable<
    React.ComponentProps<typeof Table>['loadMoreRows']
  > = React.useCallback((_) => fetchNextPage(), [fetchNextPage]);

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
            cartItem.entityType === 'datafile' &&
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
        label: t('datafiles.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datafileData = cellProps.rowData as SearchResultSource;

          if (
            !datafileData['dataset.id'] ||
            !datafileData['dataset.name'] ||
            !datafileData['investigation.id'] ||
            !datafileData['investigation.name']
          )
            return datafileData.name;

          const datafile = {
            id: datafileData.id,
            name: datafileData.name,
            dataset: {
              id: datafileData['dataset.id'],
              name: datafileData['dataset.name'],
              investigation: {
                id: datafileData['investigation.id'],
                name: datafileData['investigation.name'],
                instrumentId:
                  datafileData.investigationinstrument?.[0]?.['instrument.id'],
                facilityCycleId:
                  datafileData.investigationfacilitycycle?.[0]?.[
                    'facilityCycle.id'
                  ],
              },
            },
          };
          const link = buildUrlToDatafileTableContainingDatafile({
            datafile,
            facilityName: hierarchy,
          });
          return link ? tableLink(link, datafile.name) : datafile.name;
        },
        disableSort: true,
      },
      {
        label: t('datafiles.location'),
        dataKey: 'location',
        disableSort: true,
      },
      {
        label: t('datafiles.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps) => {
          return formatBytes(cellProps.cellData);
        },
        disableSort: true,
      },
      {
        label: t('datafiles.dataset'),
        dataKey: 'dataset.name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datafileData = cellProps.rowData as SearchResultSource;

          if (
            !datafileData['dataset.id'] ||
            !datafileData['dataset.name'] ||
            !datafileData['investigation.id'] ||
            !datafileData['investigation.name']
          )
            return datafileData['dataset.name'] ?? '';

          const dataset = {
            id: datafileData['dataset.id'],
            name: datafileData['dataset.name'],
            investigation: {
              id: datafileData['investigation.id'],
              name: datafileData['investigation.name'],
              instrumentId:
                datafileData.investigationinstrument?.[0]?.['instrument.id'],
              facilityCycleId:
                datafileData.investigationfacilitycycle?.[0]?.[
                  'facilityCycle.id'
                ],
            },
          };

          const link = isLandingPageSupportedForHierarchy(hierarchy)
            ? buildDatasetLandingUrl(dataset)
            : buildDatafileTableUrlForDataset({
                dataset,
                facilityName: hierarchy,
              });
          return link ? tableLink(link, dataset.name) : dataset.name;
        },
        disableSort: true,
      },
      {
        label: t('datafiles.modified_time'),
        dataKey: 'date',
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

  let detailsPanel = DatafileDetailsPanel;
  if (hierarchy === FACILITY_NAME.isis) detailsPanel = ISISDatafileDetailsPanel;
  else if (hierarchy === FACILITY_NAME.dls)
    detailsPanel = DLSDatafileDetailsPanel;

  if (currentTab !== 'datafile') return null;

  return (
    <Grid
      data-testid="datafile-search-table"
      container
      spacing={1}
      sx={{ height: 'calc(100% - 24px)' }}
    >
      <Grid item xs={2} sx={{ height: '100%' }}>
        {data?.pages && (
          <FacetPanel
            allIds={aggregatedIds}
            entityName="Datafile"
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
      <Grid container item xs={10} direction="column">
        <SelectedFilterChips
          filters={filters}
          onRemoveFilter={removeFilterChip}
        />
        <Grid item xs>
          <Paper
            variant="outlined"
            sx={{
              height: '100%',
              minHeight: '300px',
              marginTop: 1,
            }}
          >
            <div style={{ height: '100%' }}>
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
    </Grid>
  );
};

export default DatafileSearchTable;
