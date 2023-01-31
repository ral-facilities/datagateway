import React from 'react';
import {
  ColumnType,
  DatafileDetailsPanel,
  DLSDatafileDetailsPanel,
  FacilityCycle,
  formatBytes,
  ISISDatafileDetailsPanel,
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
import type { TableCellProps } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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

const DatafileSearchTable = ({
  hierarchy,
}: DatafileSearchTableProps): React.ReactElement => {
  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const location = useLocation();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { startDate, endDate, sort, filters, restrict, datafile } = queryParams;
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
        ],
      },
      filters,
      { enabled: datafile }
    );
  const [t] = useTranslation();

  const { data: cartItems } = useCart();
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

  const dlsLink = (
    datafileData: SearchResultSource,
    linkType = 'datafile'
  ): React.ReactElement | string => {
    if (
      datafileData['investigation.name'] &&
      datafileData['investigation.id'] &&
      datafileData['dataset.id'] &&
      datafileData['dataset.name']
    ) {
      return linkType === 'dataset'
        ? tableLink(
            `/browse/proposal/${datafileData['investigation.name']}/investigation/${datafileData['investigation.id']}/dataset/${datafileData['dataset.id']}/datafile`,
            datafileData['dataset.name']
          )
        : tableLink(
            `/browse/proposal/${datafileData['dataset.name']}/investigation/${datafileData['investigation.id']}/dataset/${datafileData['dataset.id']}/datafile`,
            datafileData.name
          );
    }
    if (linkType === 'dataset') return datafileData['dataset.name'] ?? '';
    return datafileData.name;
  };

  const isisLink = React.useCallback(
    (datafileData: SearchResultSource, linkType = 'datafile') => {
      let instrumentId;
      let investigationId;
      let datasetId;
      let facilityCycleId;
      if (datafileData.investigationinstrument?.length) {
        instrumentId = datafileData.investigationinstrument[0]['instrument.id'];
        investigationId = datafileData['investigation.id'];
        datasetId = datafileData['dataset.id'];
      } else {
        if (linkType === 'dataset') return datafileData['dataset.name'] ?? '';
        return datafileData.name;
      }

      if (facilityCycles?.length && datafileData['investigation.startDate']) {
        const investigationDate = new Date(
          datafileData['investigation.startDate']
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

      if (facilityCycleId && datafileData['dataset.name']) {
        return linkType === 'dataset'
          ? tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset/${datasetId}`,
              datafileData['dataset.name']
            )
          : tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset/${datasetId}/datafile`,
              datafileData.name
            );
      }
      return linkType === 'dataset' ? '' : datafileData.name;
    },
    [facilityCycles]
  );

  const genericLink = (
    datafileData: SearchResultSource,
    linkType = 'datafile'
  ): React.ReactElement | string => {
    if (
      datafileData['investigation.id'] &&
      datafileData['dataset.name'] &&
      datafileData['dataset.id']
    ) {
      return linkType === 'dataset'
        ? tableLink(
            `/browse/investigation/${datafileData['investigation.id']}/dataset/${datafileData['dataset.id']}/datafile`,
            datafileData['dataset.name']
          )
        : tableLink(
            `/browse/investigation/${datafileData['investigation.id']}/dataset/${datafileData['dataset.id']}/datafile`,
            datafileData.name
          );
    }
    if (linkType === 'dataset') return datafileData['dataset.name'] ?? '';
    return datafileData.name;
  };

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLink;
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      return genericLink;
    }
  }, [hierarchy, isisLink]);

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
          return hierarchyLink(datafileData);
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
      },
      {
        label: t('datafiles.dataset'),
        dataKey: 'dataset.name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datafileData = cellProps.rowData as SearchResultSource;
          return hierarchyLink(datafileData, 'dataset');
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
    [t, hierarchyLink]
  );

  let detailsPanel = DatafileDetailsPanel;
  if (hierarchy === 'isis') detailsPanel = ISISDatafileDetailsPanel;
  else if (hierarchy === 'dls') detailsPanel = DLSDatafileDetailsPanel;

  return (
    <Grid
      data-testid="datafile-search-table"
      container
      spacing={1}
      sx={{ height: '100%' }}
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
                loading={addToCartLoading || removeFromCartLoading}
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

export default DatafileSearchTable;
