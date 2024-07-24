import {
  Assessment,
  CalendarToday,
  Fingerprint,
  Public,
  Save,
} from '@mui/icons-material';
import {
  AddToCartButton,
  ArrowTooltip,
  buildDatasetTableUrlForInvestigation,
  CardView,
  DLSVisitDetailsPanel,
  DownloadButton,
  formatBytes,
  FACILITY_NAME,
  Investigation,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
  parseSearchToQuery,
  SearchFilter,
  SearchResponse,
  SearchResultSource,
  tableLink,
  useLuceneSearchInfinite,
  usePushInvestigationFilter,
  usePushPage,
  usePushResults,
  useSort,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Link as MuiLink,
  Paper,
  styled,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { StateType } from '../state/app.types';
import useFacetFilters from '../facet/useFacetFilters';
import FacetPanel from '../facet/components/facetPanel/facetPanel.component';
import { facetClassificationFromSearchResponses } from '../facet/facet';
import SelectedFilterChips from '../facet/components/selectedFilterChips.component';
import { useSearchResultCounter } from '../searchTabs/useSearchResultCounter';

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

const InvestigationCardView: React.FC<InvestigationCardProps> = (props) => {
  const { hierarchy } = props;

  const [t] = useTranslation();
  const location = useLocation();
  const { push } = useHistory();

  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const {
    filters,
    sort,
    page,
    results,
    startDate,
    endDate,
    restrict,
    investigation,
    currentTab,
  } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

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

  const { data, isLoading, isFetching, hasNextPage, fetchNextPage, refetch } =
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

  function mapSource(response: SearchResponse): SearchResultSource[] {
    return response.results?.map((result) => result.source) ?? [];
  }

  function mapIds(response: SearchResponse): number[] {
    return response.results?.map((result) => result.id) ?? [];
  }

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

  const title = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('investigations.title'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'title',
      content: (investigation: SearchResultSource) => {
        const url = buildDatasetTableUrlForInvestigation({
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
          facilityName: hierarchy,
        });
        if (!investigation.title) return '';
        return url ? tableLink(url, investigation.title) : investigation.title;
      },
      disableSort: true,
    }),
    [hierarchy, t]
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
        icon: Save,
        label: t('investigations.size'),
        dataKey: 'size',
        content: (investigation: Investigation): string =>
          formatBytes(investigation.fileSize),
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
    [t]
  );

  const moreInformation = React.useCallback(
    (investigation: SearchResultSource) => {
      switch (hierarchy) {
        case FACILITY_NAME.isis:
          const url = buildDatasetTableUrlForInvestigation({
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
            facilityName: FACILITY_NAME.isis,
          });
          return (
            <ISISInvestigationDetailsPanel
              rowData={investigation}
              viewDatasets={() => {
                if (url) push(url);
              }}
            />
          );

        case FACILITY_NAME.dls:
          return <DLSVisitDetailsPanel rowData={investigation} />;

        default:
          return <InvestigationDetailsPanel rowData={investigation} />;
      }
    },
    [hierarchy, push]
  );

  const removeFilterChip = (
    dimension: string,
    filterValue: SearchFilter
  ): void => {
    removeFacetFilter({ dimension, filterValue, applyImmediately: true });
  };

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
                  entitySize={investigation.fileSize ?? -1}
                />
              </ActionButtonDiv>
            ),
          ]
        : [],
    [aggregatedIds, hierarchy]
  );

  if (currentTab !== 'investigation') return null;

  return (
    <Grid
      data-testid="investigation-search-card-view"
      container
      spacing={1}
      sx={{ height: '100%' }}
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
            onApplyFacetFilters={() => {
              applyFacetFilters();
              refetch();
            }}
          />
        )}
      </Grid>
      <Grid container item xs={10} direction="column" wrap="nowrap">
        <SelectedFilterChips
          filters={filters}
          onRemoveFilter={removeFilterChip}
        />
        <Grid item xs>
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
                  entityName="Investigation"
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
                  sort={sort}
                  page={page}
                  results={results}
                  title={title}
                  description={description}
                  information={information}
                  moreInformation={moreInformation}
                  buttons={buttons}
                  allIds={aggregatedIds}
                />
              )}
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default InvestigationCardView;
