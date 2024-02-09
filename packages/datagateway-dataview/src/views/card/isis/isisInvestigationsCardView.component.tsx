import {
  CalendarToday,
  Fingerprint,
  Person,
  Public,
  Save,
} from '@mui/icons-material';
import { styled } from '@mui/material';
import {
  AdditionalFilters,
  AddToCartButton,
  CardView,
  CardViewDetails,
  Investigation,
  tableLink,
  DownloadButton,
  externalSiteLink,
  ISISInvestigationDetailsPanel,
  parseSearchToQuery,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsPaginated,
  usePrincipalExperimenterFilter,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
  formatBytes,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

const ActionButtonsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& button': {
    margin: 'auto',
    marginTop: theme.spacing(1),
  },
}));

interface ISISInvestigationsCardViewProps {
  instrumentId: string;
  instrumentChildId: string;
  dataPublication: boolean;
}

const ISISInvestigationsCardView = (
  props: ISISInvestigationsCardViewProps
): React.ReactElement => {
  const { instrumentId, instrumentChildId, dataPublication } = props;

  const [t] = useTranslation();
  const location = useLocation();
  const { push } = useHistory();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const principalExperimenterFilter = usePrincipalExperimenterFilter(filters);
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const investigationQueryFilters: AdditionalFilters = [
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationInstruments.instrument.id': {
          eq: parseInt(instrumentId),
        },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        [dataPublication
          ? 'dataCollectionInvestigations.dataCollection.dataPublications.id'
          : 'investigationFacilityCycles.facilityCycle.id']: {
          eq: parseInt(instrumentChildId),
        },
      }),
    },
  ];

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: totalDataCount, isLoading: countLoading } =
    useInvestigationCount(investigationQueryFilters);
  const { data, isLoading: dataLoading } = useInvestigationsPaginated(
    [
      ...investigationQueryFilters,
      {
        filterType: 'include',
        filterValue: JSON.stringify([
          {
            investigationInstruments: 'instrument',
          },
          {
            dataCollectionInvestigations: {
              dataCollection: { dataPublications: 'type' },
            },
          },
          {
            investigationUsers: 'user',
          },
        ]),
      },
    ],
    undefined,
    isMounted
  );

  const title: CardViewDetails = React.useMemo(
    () => ({
      label: t('investigations.title'),
      dataKey: 'title',
      content: (investigation: Investigation) =>
        tableLink(
          `${location.pathname}/${investigation.id}`,
          investigation.title,
          view,
          'isis-investigations-card-title'
        ),
      filterComponent: textFilter,
    }),
    [location.pathname, t, textFilter, view]
  );

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('investigations.details.summary'),
      dataKey: 'summary',
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information: CardViewDetails[] = React.useMemo(
    () => [
      {
        icon: Fingerprint,
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        content: function doiFormat(entity: Investigation) {
          const studyDataPublication =
            entity.dataCollectionInvestigations?.filter(
              (dci) =>
                dci.dataCollection?.dataPublications?.[0]?.type?.name ===
                'study'
            )?.[0]?.dataCollection?.dataPublications?.[0];
          if (studyDataPublication) {
            return externalSiteLink(
              `https://doi.org/${studyDataPublication.pid}`,
              studyDataPublication.pid,
              'isis-investigations-card-doi-link'
            );
          } else {
            return '';
          }
        },
        icon: Public,
        label: t('investigations.doi'),
        dataKey:
          'dataCollectionInvestigations.dataCollection.dataPublications.pid',
        filterComponent: textFilter,
      },
      {
        icon: Save,
        label: t('investigations.details.size'),
        dataKey: 'size',
        content: (investigation: Investigation): number | string =>
          formatBytes(investigation.fileSize),
        disableSort: true,
      },
      {
        icon: Person,
        label: t('investigations.principal_investigators'),
        dataKey: 'investigationUsers.user.fullName',
        disableSort: true,
        content: function Content(investigation: Investigation) {
          const principal_investigators =
            investigation?.investigationUsers?.filter(
              (iu) => iu.role === 'principal_experimenter'
            );
          let principal_investigator = '';
          if (principal_investigators && principal_investigators.length !== 0) {
            principal_investigator =
              principal_investigators?.[0].user?.fullName ?? '';
          }

          return principal_investigator;
        },
        filterComponent: principalExperimenterFilter,
      },
      {
        icon: CalendarToday,
        label: t('investigations.details.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,
        label: t('investigations.details.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [dateFilter, principalExperimenterFilter, t, textFilter]
  );

  const buttons = React.useMemo(
    () => [
      (investigation: Investigation) => (
        <ActionButtonsContainer>
          <AddToCartButton
            entityType="investigation"
            allIds={data?.map((investigation) => investigation.id) ?? []}
            entityId={investigation.id}
          />
          <DownloadButton
            entityType="investigation"
            entityId={investigation.id}
            entityName={investigation.name}
            entitySize={investigation.fileSize ?? -1}
          />
        </ActionButtonsContainer>
      ),
    ],
    [data]
  );

  const moreInformation = React.useCallback(
    (investigation: Investigation) => (
      <ISISInvestigationDetailsPanel
        rowData={investigation}
        viewDatasets={(id: number) => {
          const url = view
            ? `${location.pathname}/${id}/dataset?view=${view}`
            : `${location.pathname}/${id}/dataset`;
          push(url);
        }}
      />
    ),
    [location.pathname, push, view]
  );

  return (
    <CardView
      data-testid="isis-investigations-card-view"
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

export default ISISInvestigationsCardView;
