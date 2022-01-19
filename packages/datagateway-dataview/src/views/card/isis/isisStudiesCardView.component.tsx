import React from 'react';
import {
  CardView,
  CardViewDetails,
  getStudyInfoInvestigation,
  parseSearchToQuery,
  Study,
  tableLink,
  useDateFilter,
  useUpdateFilter,
  useUpdatePage,
  usePushResults,
  useUpdateSort,
  useStudiesPaginated,
  useStudyCount,
  useTextFilter,
} from 'datagateway-common';
import PublicIcon from '@material-ui/icons/Public';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { format, set } from 'date-fns';
import { Link as MuiLink } from '@material-ui/core';

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

  const textFilter = useTextFilter(filters, 'push');
  const dateFilter = useDateFilter(filters, 'push');
  const handleSort = useUpdateSort('push');
  const pushFilter = useUpdateFilter('push');
  const pushPage = useUpdatePage('push');
  const pushResults = usePushResults();

  const unembargoDate = format(
    // set s and ms to 0 to escape recursive loop of fetching data every time they change
    set(new Date(), { seconds: 0, milliseconds: 0 }),
    'yyyy-MM-dd HH:mm:ss'
  );

  const { data: totalDataCount, isLoading: countLoading } = useStudyCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'studyInvestigations.investigation.investigationInstruments.instrument.id': {
          eq: instrumentId,
        },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        // this matches the ISIS ICAT rule
        'studyInvestigations.investigation.releaseDate': {
          lt: unembargoDate,
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
      filterType: 'where',
      filterValue: JSON.stringify({
        // this matches the ISIS ICAT rule
        'studyInvestigations.investigation.releaseDate': {
          lt: unembargoDate,
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

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('studies.title'),
      dataKey: 'studyInvestigations.investigation.title',
      content: (study: Study) => {
        return getStudyInfoInvestigation(study)?.title ?? '';
      },
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information: CardViewDetails[] = React.useMemo(
    () => [
      {
        content: function studyPidFormat(entity: Study) {
          return (
            entity?.pid && (
              <MuiLink
                href={`https://doi.org/${entity.pid}`}
                data-testid="landing-study-card-pid-link"
              >
                {entity.pid}
              </MuiLink>
            )
          );
        },
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
          getStudyInfoInvestigation(study)?.startDate ?? '',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarTodayIcon,
        label: t('studies.end_date'),
        dataKey: 'studyInvestigations.investigation.endDate',
        content: (study: Study) =>
          getStudyInfoInvestigation(study)?.endDate ?? '',
        filterComponent: dateFilter,
      },
    ],
    [dateFilter, t, textFilter]
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
    />
  );
};

export default ISISStudiesCardView;
