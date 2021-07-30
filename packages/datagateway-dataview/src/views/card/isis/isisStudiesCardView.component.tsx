import React from 'react';
import {
  CardViewQuery,
  parseSearchToQuery,
  Study,
  tableLink,
  useDateFilter,
  usePushFilters,
  usePushPage,
  usePushResults,
  usePushSort,
  useStudiesPaginated,
  useStudyCount,
  useTextFilter,
} from 'datagateway-common';
import PublicIcon from '@material-ui/icons/Public';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

interface ISISStudiesCVProps {
  instrumentId: string;
}

const ISISStudiesCardView = (props: ISISStudiesCVProps): React.ReactElement => {
  const { instrumentId } = props;

  const [t] = useTranslation();
  const location = useLocation();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();
  const pushFilters = usePushFilters();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const { data: totalDataCount, isLoading: countLoading } = useStudyCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'studyInvestigations.investigation.investigationInstruments.instrument.id': {
          eq: instrumentId,
        },
      }),
    },
  ]);
  const { isLoading: dataLoading, data } = useStudiesPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'studyInvestigations.investigation.investigationInstruments.instrument.id': {
          eq: instrumentId,
        },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        studyInvestigations: 'investigation',
      }),
    },
  ]);

  const title = React.useMemo(() => {
    const pathRoot = 'browseStudyHierarchy';
    const instrumentChild = 'study';

    return {
      label: t('studies.name'),
      dataKey: 'name',
      content: (study: Study) =>
        tableLink(
          `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${study.id}`,
          study.name,
          view
        ),
      filterComponent: textFilter,
    };
  }, [t, textFilter, instrumentId, view]);

  const description = React.useMemo(
    () => ({
      label: t('studies.title'),
      dataKey: 'studyInvestigations.investigation.title',
      content: (study: Study) => {
        return study.studyInvestigations?.[0]?.investigation.title ?? '';
      },
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information = React.useMemo(
    () => [
      {
        icon: PublicIcon,
        label: t('studies.pid'),
        dataKey: 'pid',
        filterComponent: textFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('studies.start_date'),
        dataKey: 'studyInvestigations.investigation.startDate',
        content: (study: Study) =>
          study.studyInvestigations?.[0]?.investigation.startDate ?? '',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('studies.end_date'),
        dataKey: 'studyInvestigations.investigation.endDate',
        content: (study: Study) =>
          study.studyInvestigations?.[0]?.investigation.endDate ?? '',
        filterComponent: dateFilter,
      },
    ],
    [dateFilter, t, textFilter]
  );

  return (
    <CardViewQuery
      data={data ?? []}
      totalDataCount={totalDataCount ?? 0}
      onPageChange={pushPage}
      onFilter={pushFilters}
      onSort={pushSort}
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

export default ISISStudiesCardView;
