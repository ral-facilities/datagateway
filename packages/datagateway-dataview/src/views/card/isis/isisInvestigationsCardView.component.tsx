import { styled } from '@mui/material';
import {
  Fingerprint,
  Save,
  Person,
  CalendarToday,
  Public,
} from '@mui/icons-material';
import {
  CardView,
  CardViewDetails,
  formatCountOrSize,
  Investigation,
  tableLink,
  useInvestigationSizes,
  parseSearchToQuery,
  useDateFilter,
  useISISInvestigationCount,
  useISISInvestigationsPaginated,
  usePrincipalExperimenterFilter,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
  AddToCartButton,
  DownloadButton,
  ISISInvestigationDetailsPanel,
  externalSiteLink,
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

  const { data: totalDataCount, isLoading: countLoading } =
    useISISInvestigationCount(
      parseInt(instrumentId),
      parseInt(instrumentChildId),
      dataPublication
    );
  const { data, isLoading: dataLoading } = useISISInvestigationsPaginated(
    parseInt(instrumentId),
    parseInt(instrumentChildId),
    dataPublication
  );
  const sizeQueries = useInvestigationSizes(data);

  const pathRoot = dataPublication ? 'browseDataPublications' : 'browse';
  const instrumentChild = dataPublication ? 'dataPublication' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation`;

  const title: CardViewDetails = React.useMemo(
    () => ({
      label: t('investigations.title'),
      dataKey: 'title',
      content: (investigation: Investigation) =>
        tableLink(
          `${urlPrefix}/${investigation.id}`,
          investigation.title,
          view,
          'isis-investigations-card-title'
        ),
      filterComponent: textFilter,
    }),
    [t, textFilter, urlPrefix, view]
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
        // TODO: this was previously the Study DOI - currently there are no datapublication
        // representations of Studies, only of Investigations themselves
        // should this be showing the study DOI or the investigation DOI anyway?
        content: function doiFormat(entity: Investigation) {
          if (
            entity?.dataCollectionInvestigations?.[0]?.dataCollection
              ?.dataPublications?.[0]
          ) {
            return externalSiteLink(
              `https://doi.org/${entity.dataCollectionInvestigations?.[0]?.dataCollection?.dataPublications?.[0].pid}`,
              entity.dataCollectionInvestigations?.[0]?.dataCollection
                ?.dataPublications?.[0].pid,
              'isis-investigations-card-doi-link'
            );
          } else {
            return '';
          }
        },
        icon: Public,
        label: t('investigations.doi'),
        dataKey:
          'dataCollectionInvestigations.[0].dataCollection.dataPublications.[0].pid',
        filterComponent: textFilter,
      },
      {
        icon: Save,
        label: t('investigations.details.size'),
        dataKey: 'size',
        content: (investigation: Investigation): number | string => {
          const index = data?.findIndex((item) => item.id === investigation.id);
          if (typeof index === 'undefined') return 'Unknown';
          return formatCountOrSize(sizeQueries[index], true);
        },
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
    [data, dateFilter, principalExperimenterFilter, sizeQueries, t, textFilter]
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
            entitySize={
              data ? sizeQueries[data.indexOf(investigation)]?.data ?? -1 : -1
            }
          />
        </ActionButtonsContainer>
      ),
    ],
    [data, sizeQueries]
  );

  const moreInformation = React.useCallback(
    (investigation: Investigation) => (
      <ISISInvestigationDetailsPanel
        rowData={investigation}
        viewDatasets={(id: number) => {
          const url = view
            ? `${urlPrefix}/${id}/dataset?view=${view}`
            : `${urlPrefix}/${id}/dataset`;
          push(url);
        }}
      />
    ),
    [push, urlPrefix, view]
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
