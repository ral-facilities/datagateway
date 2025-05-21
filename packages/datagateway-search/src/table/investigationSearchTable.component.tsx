import {
  ColumnType,
  DLSVisitDetailsPanel,
  externalSiteLink,
  formatBytes,
  buildDatasetTableUrlForInvestigation,
  FACILITY_NAME,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
  parseSearchToQuery,
  SearchFilter,
  SearchResponse,
  SearchResultSource,
  Table,
  tableLink,
  useAddToCart,
  useCart,
  useLuceneSearchInfinite,
  useRemoveFromCart,
  useSort,
  DetailsPanelProps,
} from 'datagateway-common';
import { TableCellProps } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Grid, Paper, Typography } from '@mui/material';
import { StateType } from '../state/app.types';
import FacetPanel from '../facet/components/facetPanel/facetPanel.component';
import { facetClassificationFromSearchResponses } from '../facet/facet';
import SelectedFilterChips from '../facet/components/selectedFilterChips.component';
import useFacetFilters from '../facet/useFacetFilters';
import { useSearchResultCounter } from '../searchTabs/useSearchResultCounter';
import React from 'react';

interface InvestigationTableProps {
  hierarchy: string;
}

const InvestigationSearchTable: React.FC<InvestigationTableProps> = (props) => {
  const { hierarchy } = props;

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
    investigation,
    currentTab,
  } = queryParams;
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

  const [t] = useTranslation();

  const { fetchNextPage, data, hasNextPage, isFetching } =
    useLuceneSearchInfinite(
      'Investigation',
      {
        searchText,
        startDate,
        endDate,
        sort,
        minCount: minNumResults,
        maxCount: maxNumResults,
        restrict,
        facets: [
          { target: 'Investigation' },
          {
            target: 'InvestigationParameter',
            dimensions: [{ dimension: 'type.name' }],
          },
          {
            target: 'Sample',
            dimensions: [{ dimension: 'sample.type.name' }],
          },
          {
            target: 'InvestigationInstrument',
            dimensions: [{ dimension: 'instrument.name' }],
          },
        ],
      },
      currentTab === 'investigation' ? filters : {},

      { enabled: investigation }
    );
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } =
    useAddToCart('investigation');
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart('investigation');

  const {
    selectedFacetFilters,
    addFacetFilter,
    removeFacetFilter,
    applyFacetFilters,
    haveUnappliedFilters,
  } = useFacetFilters();

  useSearchResultCounter({
    isFetching,
    dataSearchType: 'Investigation',
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
    const definedData = data ?? {
      results: [],
    };
    if ('pages' in definedData) {
      return {
        aggregatedSource: definedData.pages
          .map((response) => mapSource(response))
          .flat(),
        aggregatedIds: definedData.pages
          .map((response) => mapIds(response))
          .flat(),
        aborted: definedData.pages[definedData.pages.length - 1].aborted,
      };
    } else {
      return {
        aggregatedSource: mapSource(definedData),
        aggregatedIds: mapIds(definedData),
        aborted: false,
      };
    }
  }, [data]);

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
            cartItem.entityType === 'investigation' &&
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
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as SearchResultSource;
          const link = buildDatasetTableUrlForInvestigation({
            investigation: {
              id: investigationData.id,
              name: investigationData.name,
              instrumentId:
                investigationData.investigationinstrument?.[0]?.[
                  'instrument.id'
                ],
              facilityCycleId:
                investigationData.investigationfacilitycycle?.[0]?.[
                  'facilityCycle.id'
                ],
            },
            facilityName: hierarchy,
          });
          if (!investigationData.title) return '';
          return link
            ? tableLink(link, investigationData.title)
            : investigationData.title;
        },
        disableSort: true,
      },
      {
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        disableSort: true,
      },
      {
        label: t('investigations.name'),
        dataKey: 'name',
        disableSort: true,
      },
      ...(hierarchy !== FACILITY_NAME.dls
        ? [
            {
              label: t('investigations.doi'),
              dataKey: 'doi',
              cellContentRenderer: (cellProps: TableCellProps) => {
                const investigation = cellProps.rowData as SearchResultSource;
                return externalSiteLink(
                  `https://doi.org/${investigation.doi}`,
                  investigation.doi,
                  'investigation-search-table-doi-link'
                );
              },
              disableSort: true,
            },
          ]
        : []),
      {
        label: t('investigations.size'),
        dataKey: 'size',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatBytes(cellProps.rowData.fileSize),
        disableSort: true,
      },
      {
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.fullName',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as SearchResultSource;
          const investigationInstrument =
            investigationData.investigationinstrument?.[0];
          return (
            investigationInstrument?.['instrument.fullName'] ??
            investigationInstrument?.['instrument.name'] ??
            ''
          );
        },
        disableSort: true,
      },
      {
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return new Date(cellProps.cellData).toLocaleDateString();
          }
        },
        disableSort: true,
      },
      {
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return new Date(cellProps.cellData).toLocaleDateString();
          }
        },
        disableSort: true,
      },
    ],
    [t, hierarchy]
  );

  const detailsPanel: React.ComponentType<DetailsPanelProps> =
    React.useCallback(
      ({ rowData, detailsPanelResize }) => {
        switch (hierarchy) {
          case FACILITY_NAME.isis:
            const investigation = rowData as SearchResultSource;
            const url = buildDatasetTableUrlForInvestigation({
              facilityName: hierarchy,
              investigation: {
                id: investigation.id,
                name: investigation.name,
                instrumentId:
                  investigation.investigationinstrument?.[0]?.['instrument.id'],
                facilityCycleId:
                  investigation.investigationfacilitycycle?.[0]?.[
                    'facilityCycle.id'
                  ],
              },
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

  if (currentTab !== 'investigation') return null;

  return (
    <Grid
      data-testid="investigation-search-table"
      container
      spacing={1}
      sx={{ height: 'calc(100% - 24px)' }}
    >
      <Grid item xs={2} sx={{ height: '100%' }}>
        {data?.pages && (
          <FacetPanel
            allIds={aggregatedIds}
            entityName="Investigation"
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
                <Typography align="center" variant="h6" component="h6">
                  {t('loading.abort_message')}
                </Typography>
              ) : (
                <Table
                  loading={
                    addToCartLoading || removeFromCartLoading || cartLoading
                  }
                  data={aggregatedSource}
                  loadMoreRows={loadMoreRows}
                  totalRowCount={
                    aggregatedSource.length + (hasNextPage ? 1 : 0)
                  }
                  sort={{}}
                  onSort={handleSort}
                  detailsPanel={detailsPanel}
                  columns={columns}
                  {...(hierarchy !== 'dls' && {
                    selectedRows,
                    aggregatedIds,
                    onCheck: addToCart,
                    onUncheck: removeFromCart,
                    disableSelectAll: !selectAllSetting,
                  })}
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

export default InvestigationSearchTable;
