import {
  CalendarToday,
  ConfirmationNumber,
  Fingerprint,
} from '@mui/icons-material';
import {
  AddToCartButton,
  CardView,
  DatasetDetailsPanel,
  DLSDatasetDetailsPanel,
  DownloadButton,
  formatBytes,
  formatCountOrSize,
  ISISDatasetDetailsPanel,
  parseSearchToQuery,
  SearchFilter,
  SearchResponse,
  SearchResultSource,
  tableLink,
  useDatasetsDatafileCount,
  useDatasetSizes,
  useLuceneSearchInfinite,
  usePushDatasetFilter,
  usePushPage,
  usePushResults,
  useSort,
  buildDatafileTableUrlForDataset,
  buildDatasetLandingUrl,
  buildDatasetTableUrlForInvestigation,
  buildInvestigationLandingUrl,
  FACILITY_NAME,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Paper, styled, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { StateType } from '../state/app.types';
import FacetPanel from '../facet/components/facetPanel/facetPanel.component';
import { facetClassificationFromSearchResponses } from '../facet/facet';
import SelectedFilterChips from '../facet/components/selectedFilterChips.component';
import useFacetFilters from '../facet/useFacetFilters';
import { useSearchResultCounter } from '../searchTabs/useSearchResultCounter';

interface DatasetCardViewProps {
  hierarchy: string;
}

const ActionButtonDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& button': {
    margin: 'auto',
    marginTop: theme.spacing(1),
  },
}));

const DatasetCardView = (props: DatasetCardViewProps): React.ReactElement => {
  const [t] = useTranslation();
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
    page,
    results,
    sort,
    filters,
    restrict,
    dataset,
  } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const minNumResults = useSelector(
    (state: StateType) => state.dgsearch.minNumResults
  );

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const { data, isLoading, isFetching, hasNextPage, fetchNextPage, refetch } =
    useLuceneSearchInfinite(
      'Dataset',
      {
        searchText,
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
      filters,
      { enabled: dataset }
    );

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

  const { paginatedSource, aggregatedIds, aborted } = React.useMemo(() => {
    if (data) {
      const aggregatedIds = data.pages
        .map((response) => mapIds(response))
        .flat();
      const minResult = (page ? page - 1 : 0) * (results ?? 10);
      const maxResult = (page ?? 1) * (results ?? 10);
      if (hasNextPage && aggregatedIds.length < maxResult) {
        fetchNextPage();
      }
      const aggregatedSource = data.pages
        .map((response) => mapSource(response))
        .flat();
      return {
        paginatedSource: aggregatedSource.slice(minResult, maxResult),
        aggregatedIds: aggregatedIds,
        aborted: data.pages[data.pages.length - 1].aborted,
      };
    } else {
      return {
        paginatedSource: [],
        aggregatedIds: [],
        aborted: false,
      };
    }
  }, [data, fetchNextPage, hasNextPage, page, results]);

  const handleSort = useSort();
  const pushFilter = usePushDatasetFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  // hierarchy === 'isis' ? data : undefined is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useDatasetsDatafileCount(
    hierarchy !== 'isis' ? paginatedSource : undefined
  );
  const sizeQueries = useDatasetSizes(
    hierarchy === 'isis' ? paginatedSource : undefined
  );

  const title = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('datasets.name'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'name',
      content: (dataset: SearchResultSource) => {
        if (!dataset['investigation.id'] || !dataset['investigation.name'])
          return dataset.name;
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
        const url =
          hierarchy === FACILITY_NAME.isis
            ? buildDatasetLandingUrl(formattedDataset)
            : buildDatafileTableUrlForDataset({
                dataset: formattedDataset,
                facilityName: hierarchy,
              });
        return url ? tableLink(url, dataset.name) : dataset.name;
      },
      disableSort: true,
    }),
    [hierarchy, t]
  );

  const description = React.useMemo(
    () => ({
      label: t('datasets.details.description'),
      dataKey: 'description',
      disableSort: true,
    }),
    [t]
  );

  const information = React.useMemo(
    () => [
      {
        icon: ConfirmationNumber,
        label:
          hierarchy === FACILITY_NAME.isis
            ? t('datasets.size')
            : t('datasets.datafile_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datafileCount',
        content: (dataset: SearchResultSource): string => {
          if (
            hierarchy === 'isis' &&
            (dataset as SearchResultSource).fileSize
          ) {
            return formatBytes((dataset as SearchResultSource).fileSize);
          }
          const index = paginatedSource?.findIndex(
            (item) => item.id === dataset.id
          );
          if (typeof index === 'undefined') return 'Unknown';
          const query =
            hierarchy === FACILITY_NAME.isis
              ? sizeQueries[index]
              : datasetCountQueries[index];
          return formatCountOrSize(query, hierarchy === 'isis');
        },
        disableSort: true,
      },
      {
        icon: Fingerprint,
        label: t('datasets.investigation'),
        dataKey: 'investigation.title',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: (dataset: SearchResultSource): any => {
          if (
            !dataset['investigation.id'] ||
            !dataset['investigation.name'] ||
            !dataset['investigation.title']
          )
            return '';

          const investigation = {
            id: dataset['investigation.id'],
            name: dataset['investigation.name'],
            instrumentId:
              dataset.investigationinstrument?.[0]?.['instrument.id'],
            facilityCycleId:
              dataset.investigationfacilitycycle?.[0]?.['facilityCycle.id'],
          };

          const url =
            hierarchy === FACILITY_NAME.isis
              ? buildInvestigationLandingUrl(investigation)
              : buildDatasetTableUrlForInvestigation({
                  investigation,
                  facilityName: hierarchy,
                });
          return url
            ? tableLink(url, dataset['investigation.title'])
            : dataset['investigation.title'];
        },
        disableSort: true,
      },
      {
        icon: CalendarToday,
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        disableSort: true,
      },
      {
        icon: CalendarToday,
        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        disableSort: true,
      },
    ],
    [paginatedSource, datasetCountQueries, hierarchy, sizeQueries, t]
  );

  const moreInformation = React.useCallback(
    (dataset: SearchResultSource) => {
      switch (hierarchy) {
        case FACILITY_NAME.isis:
          let datasetsUrl: string | null = null;
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
            datasetsUrl = buildDatafileTableUrlForDataset({
              dataset: formattedDataset,
              facilityName: hierarchy,
            });
          }
          return (
            <ISISDatasetDetailsPanel
              rowData={dataset}
              viewDatafiles={() => {
                if (datasetsUrl) push(datasetsUrl);
              }}
            />
          );

        case FACILITY_NAME.dls:
          return <DLSDatasetDetailsPanel rowData={dataset} />;

        default:
          return <DatasetDetailsPanel rowData={dataset} />;
      }
    },
    [hierarchy, push]
  );

  const buttons = React.useMemo(
    () =>
      hierarchy !== 'dls'
        ? [
            (dataset: SearchResultSource) => (
              <ActionButtonDiv>
                <AddToCartButton
                  entityType="dataset"
                  allIds={aggregatedIds}
                  entityId={dataset.id}
                />
                <DownloadButton
                  entityType="dataset"
                  entityId={dataset.id}
                  entityName={dataset.name}
                  entitySize={
                    sizeQueries[paginatedSource.indexOf(dataset)]?.data ?? -1
                  }
                />
              </ActionButtonDiv>
            ),
          ]
        : [
            (dataset: SearchResultSource) => (
              <AddToCartButton
                entityType="dataset"
                allIds={aggregatedIds}
                entityId={dataset.id}
              />
            ),
          ],

    [hierarchy, aggregatedIds, sizeQueries, paginatedSource]
  );

  const removeFilterChip = (
    dimension: string,
    filterValue: SearchFilter
  ): void => {
    removeFacetFilter({ dimension, filterValue, applyImmediately: true });
  };

  return (
    <Grid
      data-testid="dataset-search-card-view"
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
          <div>
            {aborted ? (
              <Paper>
                <Typography align="center" variant="h6" component="h6">
                  {t('loading.abort_message')}
                </Typography>
              </Paper>
            ) : (
              <CardView
                entityName="Dataset"
                data={paginatedSource ?? []}
                totalDataCount={
                  aggregatedIds?.length + (hasNextPage ? 1 : 0) ?? 0
                }
                onPageChange={pushPage}
                onFilter={pushFilter}
                onSort={handleSort}
                onResultsChange={pushResults}
                loadedData={!isLoading}
                loadedCount={!isLoading}
                filters={{}}
                sort={{}}
                page={page}
                results={results}
                title={title}
                description={description}
                information={information}
                moreInformation={moreInformation}
                buttons={buttons}
              />
            )}
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DatasetCardView;
