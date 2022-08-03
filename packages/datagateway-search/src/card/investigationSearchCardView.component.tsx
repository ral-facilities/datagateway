import {
  CalendarToday,
  ConfirmationNumber,
  Fingerprint,
  Public,
  Assessment,
} from '@mui/icons-material';
import {
  CardView,
  formatCountOrSize,
  Investigation,
  parseSearchToQuery,
  useInvestigationsDatasetCount,
  usePushPage,
  usePushResults,
  useSort,
  useAllFacilityCycles,
  tableLink,
  FacilityCycle,
  useInvestigationSizes,
  ArrowTooltip,
  AddToCartButton,
  DownloadButton,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
  DLSVisitDetailsPanel,
  SearchResultSource,
  useLuceneSearchInfinite,
  SearchResponse,
  usePushInvestigationFilter,
  FiltersType,
  formatBytes,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { Typography, Paper, Link as MuiLink, styled } from '@mui/material';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';
import { CVCustomFilters } from 'datagateway-common/lib/card/cardView.component';

interface InvestigationCardProps {
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

const InvestigationCardView = (
  props: InvestigationCardProps
): React.ReactElement => {
  const { hierarchy } = props;

  const [t] = useTranslation();
  const location = useLocation();
  const { push } = useHistory();

  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const {
    filters,
    sort,
    page,
    results,
    startDate,
    endDate,
    restrict,
  } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

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
      else return null;
    },
    [facilityCycles]
  );

  const isisLink = React.useCallback(
    (investigationData: SearchResultSource) => {
      const linkURL = isisLinkURL(investigationData);

      if (linkURL) return tableLink(linkURL, investigationData.title as string);
      else return investigationData.title;
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
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      const genericLink = (
        investigationData: SearchResultSource
      ): React.ReactElement =>
        tableLink(
          genericLinkURL(investigationData),
          investigationData.title as string
        );

      return genericLink;
    }
  }, [hierarchy, isisLink]);

  const handleSort = useSort();
  const pushFilter = usePushInvestigationFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const minNumResults = useSelector(
    (state: StateType) => state.dgsearch.minNumResults
  );

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useLuceneSearchInfinite(
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
    filters
  );

  function mapSource(response: SearchResponse): SearchResultSource[] {
    return response.results?.map((result) => result.source) ?? [];
  }

  function mapIds(response: SearchResponse): number[] {
    return response.results?.map((result) => result.id) ?? [];
  }

  const mapFacets = React.useCallback(
    (responses: SearchResponse[]): CVCustomFilters[] => {
      // Aggregate pages
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
      // Convert to custom filters
      return Object.entries(filters).map((dimension) => {
        const dimensionKey = dimension[0].toLocaleLowerCase();
        const dimensionValue = dimension[1];
        return {
          label: t(dimensionKey),
          dataKey: dimensionKey,
          dataKeySearch: dimensionKey
            .replace('investigation.', '')
            .replace('investigationparameter.', 'investigationparameter ')
            .replace('sample.', 'sample '),
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

  const {
    paginatedSource,
    aggregatedIds,
    customFilters,
    aborted,
  } = React.useMemo(() => {
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

  const parsedFilters = React.useMemo(() => {
    const parsedFilters = {} as FiltersType;
    Object.entries(filters).forEach((v) => {
      parsedFilters[v[0].substring(14)] = v[1]; // 14 skips "investigation."
    });
    return parsedFilters;
  }, [filters]);

  // hierarchy === 'isis' ? data : undefined is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useInvestigationsDatasetCount(
    hierarchy !== 'isis' ? paginatedSource : undefined
  );
  const sizeQueries = useInvestigationSizes(
    hierarchy === 'isis' ? paginatedSource : undefined
  );

  const title = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('investigations.title'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'title',
      content: (investigation: SearchResultSource) => {
        return hierarchyLink(investigation);
      },
      disableSort: true,
    }),
    [hierarchyLink, t]
  );

  const description = React.useMemo(
    () => ({
      label: t('investigations.details.summary'),
      dataKey: 'summary',
      disableSort: true,
    }),
    [t]
  );

  const information = React.useMemo(
    () => [
      {
        content: function doiFormat(entity: Investigation) {
          return (
            entity?.doi && (
              <MuiLink
                href={`https://doi.org/${entity.doi}`}
                data-testid="investigation-search-card-doi-link"
              >
                {entity.doi}
              </MuiLink>
            )
          );
        },
        icon: Public,
        label: t('investigations.doi'),
        dataKey: 'doi',
        disableSort: true,
      },
      {
        icon: Fingerprint,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        disableSort: true,
      },
      {
        icon: Fingerprint,
        label: t('investigations.details.name'),
        dataKey: 'name',
        disableSort: true,
      },
      {
        icon: ConfirmationNumber,
        label:
          hierarchy === 'isis'
            ? t('investigations.size')
            : t('investigations.dataset_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datasetCount',
        content: (investigation: Investigation): string => {
          if (
            hierarchy === 'isis' &&
            (investigation as SearchResultSource).fileSize
          ) {
            return formatBytes((investigation as SearchResultSource).fileSize);
          }
          const index = paginatedSource?.findIndex(
            (item) => item.id === investigation.id
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
        icon: Assessment,
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.name',
        content: function Content(investigation: SearchResultSource) {
          const investigationInstrument =
            investigation.investigationinstrument?.[0];
          const instrument =
            investigationInstrument?.['instrument.fullName'] ??
            investigationInstrument?.['instrument.name'] ??
            'Unknown';
          return (
            <ArrowTooltip title={instrument}>
              <Typography>{instrument}</Typography>
            </ArrowTooltip>
          );
        },
        noTooltip: true,
        disableSort: true,
      },
      {
        content: function (investigation: Investigation): string {
          return investigation.startDate
            ? new Date(investigation.startDate).toLocaleDateString()
            : 'Unknown';
        },
        icon: CalendarToday,
        label: t('investigations.details.start_date'),
        dataKey: 'startDate',
        disableSort: true,
      },
      {
        content: function (investigation: Investigation): string {
          return investigation.endDate
            ? new Date(investigation.endDate).toLocaleDateString()
            : 'Unknown';
        },
        icon: CalendarToday,
        label: t('investigations.details.end_date'),
        dataKey: 'endDate',
        disableSort: true,
      },
    ],
    [paginatedSource, datasetCountQueries, hierarchy, sizeQueries, t]
  );

  const moreInformation = React.useCallback(
    (investigation: SearchResultSource) => {
      if (hierarchy === 'isis') {
        const datasetsURL = hierarchyLinkURL(investigation);
        return (
          <ISISInvestigationDetailsPanel
            rowData={investigation}
            viewDatasets={
              datasetsURL
                ? (id: number) => {
                    push(datasetsURL);
                  }
                : undefined
            }
          />
        );
      } else if (hierarchy === 'dls')
        return <DLSVisitDetailsPanel rowData={investigation} />;
      else return <InvestigationDetailsPanel rowData={investigation} />;
    },
    [hierarchy, hierarchyLinkURL, push]
  );

  const buttons = React.useMemo(
    () =>
      hierarchy !== 'dls'
        ? [
            (investigation: SearchResultSource) => (
              <ActionButtonDiv>
                <AddToCartButton
                  entityType="investigation"
                  allIds={aggregatedIds}
                  entityId={investigation.id}
                />
                <DownloadButton
                  entityType="investigation"
                  entityId={investigation.id}
                  entityName={investigation.name}
                  entitySize={
                    sizeQueries[paginatedSource.indexOf(investigation)]?.data ??
                    -1
                  }
                />
              </ActionButtonDiv>
            ),
          ]
        : [],
    [hierarchy, aggregatedIds, sizeQueries, paginatedSource]
  );

  return (
    <div>
      {aborted ? (
        <Paper>
          <Typography align="center" variant="h6" component="h6">
            {t('loading.abort_message')}
          </Typography>
        </Paper>
      ) : (
        <CardView
          entityName="Investigation"
          data={paginatedSource ?? []}
          totalDataCount={aggregatedIds?.length + (hasNextPage ? 1 : 0) ?? 0}
          onPageChange={pushPage}
          onFilter={pushFilter}
          onSort={handleSort}
          onResultsChange={pushResults}
          loadedData={!isLoading}
          loadedCount={!isLoading}
          filters={parsedFilters}
          sort={sort}
          page={page}
          results={results}
          title={title}
          description={description}
          information={information}
          moreInformation={moreInformation}
          buttons={buttons}
          customFilters={customFilters}
          allIds={aggregatedIds}
        />
      )}
    </div>
  );
};

export default InvestigationCardView;
