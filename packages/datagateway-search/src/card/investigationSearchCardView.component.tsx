import {
  Assessment,
  CalendarToday,
  ConfirmationNumber,
  Fingerprint,
  Public,
} from '@mui/icons-material';
import { Link as MuiLink, styled, Typography } from '@mui/material';
import {
  AddToCartButton,
  ArrowTooltip,
  buildInvestigationUrl,
  CardView,
  DLSVisitDetailsPanel,
  DownloadButton,
  FACILITY_NAME,
  formatCountOrSize,
  Investigation,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
  nestedValue,
  parseSearchToQuery,
  tableLink,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationSizes,
  useInvestigationsPaginated,
  useLuceneSearch,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { StateType } from '../state/app.types';

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

  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { filters, sort, page, results, startDate, endDate } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const { data: luceneData } = useLuceneSearch('Investigation', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });

  const { data: totalDataCount, isLoading: countLoading } =
    useInvestigationCount([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: luceneData || [] },
        }),
      },
    ]);
  const { isLoading: dataLoading, data } = useInvestigationsPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigationInstruments: 'instrument',
      }),
    },
  ]);

  // hierarchy === 'isis' ? data : undefined is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useInvestigationsDatasetCount(
    hierarchy !== 'isis' ? data : undefined
  );
  const sizeQueries = useInvestigationSizes(
    hierarchy === 'isis' ? data : undefined
  );

  const title = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('investigations.title'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'title',
      content: (investigation: Investigation) => {
        const url = buildInvestigationUrl({
          investigation,
          facilityName: hierarchy,
          showLanding: false,
        });
        return url ? tableLink(url, investigation.title) : investigation.title;
      },
      filterComponent: textFilter,
    }),
    // [t, textFilter, view]
    [hierarchy, t, textFilter]
  );

  const description = React.useMemo(
    () => ({
      label: t('investigations.details.summary'),
      dataKey: 'summary',
      filterComponent: textFilter,
    }),
    [t, textFilter]
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
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.details.name'),
        dataKey: 'name',
        filterComponent: textFilter,
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
          const index = data?.findIndex((item) => item.id === investigation.id);
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
        content: function Content(investigation: Investigation) {
          const instrument = nestedValue(
            investigation,
            'investigationInstruments[0].instrument.name'
          );
          return (
            <ArrowTooltip title={instrument}>
              <Typography>{instrument}</Typography>
            </ArrowTooltip>
          );
        },
        noTooltip: true,
        filterComponent: textFilter,
      },
      {
        icon: CalendarToday,
        label: t('investigations.details.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarToday,
        label: t('investigations.details.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [
      data,
      datasetCountQueries,
      dateFilter,
      hierarchy,
      sizeQueries,
      t,
      textFilter,
    ]
  );

  const moreInformation = React.useCallback(
    (investigation: Investigation) => {
      switch (hierarchy) {
        case FACILITY_NAME.isis:
          const url = buildInvestigationUrl({
            investigation,
            facilityName: hierarchy,
            showLanding: false,
          });
          return (
            <ISISInvestigationDetailsPanel
              rowData={investigation}
              viewDatasets={
                url
                  ? (_) => {
                      push(url);
                    }
                  : undefined
              }
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

  const buttons = React.useMemo(
    () =>
      hierarchy !== 'dls'
        ? [
            (investigation: Investigation) => (
              <ActionButtonDiv>
                <AddToCartButton
                  entityType="investigation"
                  allIds={data?.map((investigation) => investigation.id) ?? []}
                  entityId={investigation.id}
                />
                <DownloadButton
                  entityType="investigation"
                  entityId={investigation.id}
                  entityName={investigation.name}
                  entitySize={
                    data
                      ? sizeQueries[data.indexOf(investigation)]?.data ?? -1
                      : -1
                  }
                />
              </ActionButtonDiv>
            ),
          ]
        : [],
    [data, hierarchy, sizeQueries]
  );

  return (
    <CardView
      data={data ?? []}
      totalDataCount={totalDataCount ?? 0}
      onPageChange={pushPage}
      onFilter={pushFilter}
      onSort={handleSort}
      onResultsChange={pushResults}
      loadedData={!dataLoading}
      loadedCount={!countLoading}
      filters={filters}
      sort={sort}
      page={page}
      results={results}
      title={title}
      description={description}
      information={information}
      moreInformation={moreInformation}
      buttons={buttons}
    />
  );
};

export default InvestigationCardView;
