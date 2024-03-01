import React from 'react';
import {
  CardView,
  CardViewDetails,
  parseSearchToQuery,
  DataPublication,
  tableLink,
  useDateFilter,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useDataPublicationsPaginated,
  useDataPublicationCount,
  useTextFilter,
} from 'datagateway-common';
import { Public, CalendarToday } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Link as MuiLink } from '@mui/material';

interface ISISDataPublicationsCVProps {
  instrumentId: string;
  studyDataPublicationId?: string;
}

const ISISDataPublicationsCardView = (
  props: ISISDataPublicationsCVProps
): React.ReactElement => {
  const { instrumentId, studyDataPublicationId } = props;

  const [t] = useTranslation();
  const location = useLocation();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: totalDataCount, isLoading: countLoading } =
    useDataPublicationCount([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: instrumentId,
            },
        }),
      },
      ...(studyDataPublicationId
        ? [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'content.dataCollectionInvestigations.investigation.dataCollectionInvestigations.dataCollection.dataPublications.id':
                  {
                    eq: studyDataPublicationId,
                  },
              }),
            },
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'type.name': { eq: 'investigation' },
              }),
            },
          ]
        : [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'type.name': { eq: 'study' },
              }),
            },
            {
              filterType: 'distinct',
              filterValue: JSON.stringify(['id', 'title', 'pid']),
            },
          ]),
    ]);

  const { isLoading: dataLoading, data } = useDataPublicationsPaginated(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: instrumentId,
            },
        }),
      },
      ...(studyDataPublicationId
        ? [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'content.dataCollectionInvestigations.investigation.dataCollectionInvestigations.dataCollection.dataPublications.id':
                  {
                    eq: studyDataPublicationId,
                  },
              }),
            },
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'type.name': { eq: 'investigation' },
              }),
            },
          ]
        : [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'type.name': { eq: 'study' },
              }),
            },
            {
              filterType: 'distinct',
              filterValue: JSON.stringify(['id', 'title', 'pid']),
            },
          ]),
    ],
    isMounted
  );

  const title: CardViewDetails = React.useMemo(() => {
    return {
      label: t('datapublications.title'),
      dataKey: 'title',
      content: (dataPublication: DataPublication) =>
        tableLink(
          `${location.pathname}/${dataPublication.id}`,
          dataPublication.title,
          view
        ),
      filterComponent: textFilter,
      defaultSort: studyDataPublicationId ? undefined : 'desc',
    };
  }, [t, textFilter, studyDataPublicationId, location.pathname, view]);

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('datapublications.description'),
      dataKey: 'description',
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information: CardViewDetails[] = React.useMemo(
    () => [
      {
        content: function dataPublicationPidFormat(entity: DataPublication) {
          return (
            entity?.pid && (
              <MuiLink
                href={`https://doi.org/${entity.pid}`}
                data-testid="landing-datapublication-card-pid-link"
              >
                {entity.pid}
              </MuiLink>
            )
          );
        },
        icon: Public,
        label: t('datapublications.pid'),
        dataKey: 'pid',
        filterComponent: textFilter,
      },
      ...(studyDataPublicationId
        ? ([
            {
              icon: CalendarToday,
              label: t('datapublications.publication_date'),
              dataKey: 'publicationDate',
              content: (dataPublication: DataPublication) =>
                dataPublication.publicationDate?.slice(0, 10) ?? '',
              filterComponent: dateFilter,
              defaultSort: 'desc',
            },
          ] as CardViewDetails[])
        : []),
    ],
    [dateFilter, studyDataPublicationId, t, textFilter]
  );

  return (
    <CardView
      data-testid="isis-dataPublications-card-view"
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
    />
  );
};

export default ISISDataPublicationsCardView;
