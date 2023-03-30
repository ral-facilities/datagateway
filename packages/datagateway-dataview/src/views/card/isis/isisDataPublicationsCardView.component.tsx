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
}

const ISISDataPublicationsCardView = (
  props: ISISDataPublicationsCVProps
): React.ReactElement => {
  const { instrumentId } = props;

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
    ]);

  const { isLoading: dataLoading, data } = useDataPublicationsPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
          {
            eq: instrumentId,
          },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        content: {
          dataCollectionInvestigations: 'investigation',
        },
      }),
    },
  ]);

  const title = React.useMemo(() => {
    const pathRoot = 'browseDataPublications';
    const instrumentChild = 'dataPublication';

    return {
      label: t('datapublications.id'),
      dataKey: 'id',
      content: (dataPublication: DataPublication) =>
        tableLink(
          `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${dataPublication.id}`,
          dataPublication.id.toString(),
          view
        ),
      filterComponent: textFilter,
    };
  }, [t, textFilter, instrumentId, view]);

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('datapublications.title'),
      dataKey: 'dataPublication.title',
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
      {
        icon: CalendarToday,
        label: t('datapublications.publication_date'),
        dataKey:
          'dataPublication.content.dataCollectionInvestigations.investigation.publicationDate',
        content: (dataPublication: DataPublication) =>
          dataPublication?.publicationDate?.slice(0, 10) ?? '',
        filterComponent: dateFilter,
        //TODO: sorting not working until publication date populated
        //defaultSort: 'desc',
      },
    ],
    [dateFilter, t, textFilter]
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
