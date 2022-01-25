import React from 'react';
import {
  CardView,
  CardViewDetails,
  Investigation,
  tableLink,
  parseSearchToQuery,
  useInvestigationCount,
  useInvestigationsPaginated,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
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

  const textFilter = useTextFilter(filters);
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const {
    data: totalDataCount,
    isLoading: countLoading,
  } = useInvestigationCount([
    {
      filterType: 'distinct',
      filterValue: JSON.stringify(['name', 'title']),
    },
  ]);
  const { isLoading: dataLoading, data } = useInvestigationsPaginated(
    [
      {
        filterType: 'distinct',
        filterValue: JSON.stringify(['name', 'title']),
      },
    ],
    //Do not add order by id as id is not a distinct field above and will otherwise
    //cause missing results
    true
  );

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
      //Sort to ensure a deterministic order for pagination (ignoreIDSort: true is
      //used above in useInvestigationsPaginated)
      defaultSort: 'asc',
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
