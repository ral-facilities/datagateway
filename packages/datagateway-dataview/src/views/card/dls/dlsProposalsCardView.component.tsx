import React from 'react';
import {
  CardView,
  CardViewDetails,
  Investigation,
  tableLink,
  parseSearchToQuery,
  useInvestigationCount,
  useInvestigationsPaginated,
  useUpdateFilter,
  useUpdatePage,
  useUpdateResults,
  useUpdateSort,
  useTextFilter,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const DLSProposalsCardView = (): React.ReactElement => {
  const [t] = useTranslation();
  const location = useLocation();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters, 'push');
  const handleSort = useUpdateSort('push');
  const pushFilter = useUpdateFilter('push');
  const pushPage = useUpdatePage('push');
  const pushResults = useUpdateResults('push');

  const {
    data: totalDataCount,
    isLoading: countLoading,
  } = useInvestigationCount([
    {
      filterType: 'distinct',
      filterValue: JSON.stringify(['name', 'title']),
    },
  ]);
  const { isLoading: dataLoading, data } = useInvestigationsPaginated([
    {
      filterType: 'distinct',
      filterValue: JSON.stringify(['name', 'title']),
    },
  ]);

  const title: CardViewDetails = React.useMemo(
    () => ({
      label: t('investigations.title'),
      dataKey: 'title',
      content: (investigation: Investigation) =>
        tableLink(
          `/browse/proposal/${investigation.name}/investigation`,
          investigation.title,
          view,
          'dls-proposal-card-title'
        ),
      filterComponent: textFilter,
      disableSort: true,
    }),
    [t, textFilter, view]
  );

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('investigations.name'),
      dataKey: 'name',
      filterComponent: textFilter,
      disableSort: true,
    }),
    [t, textFilter]
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
    />
  );
};

export default DLSProposalsCardView;
