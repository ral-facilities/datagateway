import React from 'react';
import {
  ColumnType,
  DLSVisitDetailsPanel,
  externalSiteLink,
  FacilityCycle,
  formatBytes,
  Investigation,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
  parseSearchToQuery,
  SearchFilter,
  SearchResponse,
  SearchResultSource,
  Table,
  tableLink,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useLuceneSearchInfinite,
  useRemoveFromCart,
  useSort,
} from 'datagateway-common';
import { TableCellProps } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Grid, Paper, Typography } from '@mui/material';
import { StateType } from '../state/app.types';
import {
  InvestigationDatasetCountCell,
  InvestigationSizeCell,
} from './cellRenderers';
import FacetPanel from '../facet/components/facetPanel/facetPanel.component';
import { facetClassificationFromSearchResponses } from '../facet/facet';
import SelectedFilterChips from '../facet/components/selectedFilterChips.component';
import useFacetFilters from '../facet/useFacetFilters';
import { useSearchResultCounter } from '../searchTabs/useSearchResultCounter';

interface InvestigationTableProps {
  hierarchy: string;
}

const InvestigationSearchTable = ({
  hierarchy,
}: InvestigationTableProps): React.ReactElement => {
  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { startDate, endDate, sort, filters, restrict, investigation } =
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

  const [t] = useTranslation();

  // this is only used for pagination in the table
  // the initial data fetching is triggered by the search button
  // in searchPageContainer.
  const { fetchNextPage, data, hasNextPage, refetch, isFetching } =
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
            dimensions: [{ dimension: 'type.name' }],
          },
        ],
      },
      filters,
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

  const loadMoreRows = React.useCallback(
    (_) => fetchNextPage(),
    [fetchNextPage]
  );

  const removeFilterChip = (
    dimension: string,
    filterValue: SearchFilter
  ): void => {
    removeFacetFilter({ dimension, filterValue, applyImmediately: true });
  };

  const dlsLinkURL = (investigationData: SearchResultSource): string =>
    `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`;

  const isisLinkURL = React.useCallback(
    (investigationData: SearchResultSource) => {
      let instrumentId;
      let facilityCycleId;
      if (investigationData.investigationinstrument?.length) {
        instrumentId =
          investigationData.investigationinstrument[0]['instrument.id'];
      } else {
        return null;
      }

      if (investigationData.startDate && facilityCycles?.length) {
        const investigationDate = new Date(
          investigationData.startDate
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

      if (facilityCycleId)
        return `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationData.id}/dataset`;

      return null;
    },
    [facilityCycles]
  );

  const isisLink = React.useCallback(
    (investigationData: SearchResultSource) => {
      const linkURL = isisLinkURL(investigationData);

      if (linkURL && investigationData.title) {
        return tableLink(linkURL, investigationData.title);
      }

      return investigationData.title;
    },
    [isisLinkURL]
  );

  const genericLinkURL = (investigationData: SearchResultSource): string =>
    `/browse/investigation/${investigationData.id}/dataset`;

  const hierarchyLinkURL = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLinkURL;
    } else if (hierarchy === 'isis') {
      return isisLinkURL;
    } else {
      return genericLinkURL;
    }
  }, [hierarchy, isisLinkURL]);

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      const dlsLink = (
        investigationData: SearchResultSource
      ): React.ReactElement =>
        tableLink(
          dlsLinkURL(investigationData),
          investigationData.title as string
        );

      return dlsLink;
    }

    if (hierarchy === 'isis') {
      return isisLink;
    }

    const genericLink = (
      investigationData: SearchResultSource
    ): React.ReactElement =>
      tableLink(
        genericLinkURL(investigationData),
        investigationData.title as string
      );

    return genericLink;
  }, [hierarchy, isisLink]);

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
          return hierarchyLink(investigationData);
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
      {
        label: t('investigations.doi'),
        dataKey: 'doi',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return externalSiteLink(
            `https://doi.org/${investigationData.doi}`,
            investigationData.doi,
            'investigation-search-table-doi-link'
          );
        },
        disableSort: true,
      },
      {
        label:
          hierarchy === 'isis'
            ? t('investigations.size')
            : t('investigations.dataset_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datasetCount',
        cellContentRenderer: (cellProps: TableCellProps): React.ReactNode => {
          if (hierarchy === 'isis' && cellProps.rowData.fileSize) {
            return formatBytes(cellProps.rowData.fileSize);
          }
          if (hierarchy === 'isis') {
            return (
              <InvestigationSizeCell
                investigation={cellProps.rowData as Investigation}
              />
            );
          }
          return (
            <InvestigationDatasetCountCell
              investigation={cellProps.rowData as Investigation}
            />
          );
        },
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
    [t, hierarchy, hierarchyLink]
  );

  const detailsPanel = React.useCallback(
    ({ rowData, detailsPanelResize }) => {
      if (hierarchy === 'isis') {
        const datasetsURL = hierarchyLinkURL(rowData as SearchResultSource);
        return (
          <ISISInvestigationDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
            viewDatasets={
              datasetsURL
                ? (_) => {
                    push(datasetsURL);
                  }
                : undefined
            }
          />
        );
      } else if (hierarchy === 'dls') {
        return (
          <DLSVisitDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
          />
        );
      } else {
        return (
          <InvestigationDetailsPanel
            rowData={rowData}
            detailsPanelResize={detailsPanelResize}
          />
        );
      }
    },
    [hierarchy, hierarchyLinkURL, push]
  );

  return (
    <Grid
      data-testid="investigation-search-table"
      container
      spacing={1}
      sx={{ height: '100%' }}
    >
      <Grid item xs={2} sx={{ height: '100%' }}>
        {data?.pages && (
          <FacetPanel
            allIds={aggregatedIds}
            entityName="Investigation"
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
        <Paper variant="outlined" sx={{ height: '100%', marginTop: 1 }}>
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
                  aggregatedSource?.length + (hasNextPage ? 1 : 0) ?? 0
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
  );
};

export default InvestigationSearchTable;
