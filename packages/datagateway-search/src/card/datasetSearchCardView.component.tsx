import React from 'react';
import {
  CalendarToday,
  ConfirmationNumber,
  Fingerprint,
} from '@mui/icons-material';
import {
  AddToCartButton,
  CardView,
  type CVCustomFilters,
  DatasetDetailsPanel,
  DLSDatasetDetailsPanel,
  DownloadButton,
  FacilityCycle,
  FiltersType,
  formatBytes,
  formatCountOrSize,
  ISISDatasetDetailsPanel,
  parseSearchToQuery,
  SearchResponse,
  SearchResultSource,
  tableLink,
  useAllFacilityCycles,
  useDatasetsDatafileCount,
  useDatasetSizes,
  useLuceneSearchInfinite,
  usePushDatasetFilter,
  usePushPage,
  usePushResults,
  useSort,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { Grid, Paper, styled, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
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

  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const location = useLocation();
  const { push } = useHistory();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { startDate, endDate, page, results, sort, filters, restrict } =
    queryParams;
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
        facets: [{ target: 'Dataset' }],
      },
      filters
    );

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

  const mapFacets = React.useCallback(
    (responses: SearchResponse[]): CVCustomFilters[] => {
      const filters: { [dimension: string]: { [label: string]: number } } = {};
      responses.forEach((response) => {
        if (response.dimensions !== undefined) {
          Object.entries(response.dimensions).forEach((dimension) => {
            const dimensionKey = dimension[0];
            const dimensionValue = dimension[1];
            if (!Object.keys(filters).includes(dimensionKey)) {
              filters[dimensionKey] = {};
            }
            Object.entries(dimensionValue).forEach((labelValue) => {
              const label = labelValue[0];
              const count =
                typeof labelValue[1] === 'number'
                  ? labelValue[1]
                  : labelValue[1].count;
              if (Object.keys(filters[dimensionKey]).includes(label)) {
                filters[dimensionKey][label] += count;
              } else {
                filters[dimensionKey][label] = count;
              }
            });
          });
        }
      });
      return Object.entries(filters).map((dimension) => {
        const dimensionKey = dimension[0].toLocaleLowerCase();
        const dimensionValue = dimension[1];
        return {
          label: t(dimensionKey),
          dataKey: dimensionKey,
          dataKeySearch: dimensionKey.replace('dataset.', ''),
          filterItems: Object.entries(dimensionValue).map((labelValue) => ({
            name: labelValue[0],
            count: labelValue[1].toString(),
          })),
          prefixLabel: true,
        };
      });
    },
    [t]
  );

  const parsedFilters = React.useMemo(() => {
    const parsedFilters = {} as FiltersType;
    Object.entries(filters).forEach((v) => {
      parsedFilters[v[0].substring(8)] = v[1]; // "dataset." is 8 characters
    });
    return parsedFilters;
  }, [filters]);

  const { paginatedSource, aggregatedIds, customFilters, aborted } =
    React.useMemo(() => {
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
          customFilters: mapFacets(data.pages),
          aborted: data.pages[data.pages.length - 1].aborted,
        };
      } else {
        return {
          paginatedSource: [],
          aggregatedIds: [],
          customFilters: [],
          aborted: false,
        };
      }
    }, [data, fetchNextPage, hasNextPage, mapFacets, page, results]);

  const handleSort = useSort();
  const pushFilter = usePushDatasetFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

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
        return hierarchyLink(dataset);
      },
      disableSort: true,
    }),
    [hierarchyLink, t]
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
          hierarchy === 'isis'
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
            hierarchy === 'isis'
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
          return hierarchyLink(dataset, 'investigation');
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
    [
      paginatedSource,
      datasetCountQueries,
      hierarchy,
      hierarchyLink,
      sizeQueries,
      t,
    ]
  );

  const moreInformation = React.useCallback(
    (dataset: SearchResultSource) => {
      const datasetsURL = hierarchyLinkURL(dataset);

      if (hierarchy === 'isis') {
        return (
          <ISISDatasetDetailsPanel
            rowData={dataset}
            viewDatafiles={
              datasetsURL
                ? (id: number) => {
                    push(datasetsURL);
                  }
                : undefined
            }
          />
        );
      } else if (hierarchy === 'dls')
        return <DLSDatasetDetailsPanel rowData={dataset} />;
      else return <DatasetDetailsPanel rowData={dataset} />;
    },
    [hierarchy, hierarchyLinkURL, push]
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

  const removeFilterChip = (dimension: string, filterValue: string): void => {
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
                filters={parsedFilters}
                sort={{}}
                page={page}
                results={results}
                title={title}
                description={description}
                information={information}
                moreInformation={moreInformation}
                buttons={buttons}
                customFilters={customFilters}
              />
            )}
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DatasetCardView;
