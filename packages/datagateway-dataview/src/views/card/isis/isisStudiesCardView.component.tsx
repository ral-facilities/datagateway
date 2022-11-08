import React from 'react';
import {
  CardView,
  CardViewDetails,
  filterStudyInfoInvestigations,
  getStudyInfoInvestigation,
  parseSearchToQuery,
  Study,
  tableLink,
  useDateFilter,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useStudiesPaginated,
  useStudyCount,
  useTextFilter,
} from 'datagateway-common';
import { Public, CalendarToday } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { format, set } from 'date-fns';
import { Link as MuiLink } from '@mui/material';

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
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
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
        'studyInvestigations.investigation.investigationInstruments.instrument.id':
          {
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
        'studyInvestigations.investigation.investigationInstruments.instrument.id':
          {
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
        icon: Public,
        label: t('studies.pid'),
        dataKey: 'pid',
        filterComponent: textFilter,
      },
      {
        icon: CalendarToday,
        label: t('studies.start_date'),
        dataKey: 'studyInvestigations.investigation.startDate',
        content: (study: Study) =>
          getStudyInfoInvestigation(study)?.startDate ?? '',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,
        label: t('studies.end_date'),
        dataKey: 'studyInvestigations.investigation.endDate',
        content: (study: Study) =>
          getStudyInfoInvestigation(study)?.endDate ?? '',
        filterComponent: dateFilter,
      },
    ],
    [dateFilter, t, textFilter]
  );

  const aggregatedData = React.useMemo(
    () =>
      // for each Investigation in studyInvestigations that matches the current filter
      // create a new Study object with the studyInvestigations array
      // having only one StudyInvestigation (& Investigation) object in it
      // so that each matched Investigation appears as a separate card
      data?.reduce<Study[]>((studies, study) => {
        const firstInvestigationMatched = filterStudyInfoInvestigations(
          study,
          filters
        )?.[0];
        studies.push({
          ...study,
          studyInvestigations: firstInvestigationMatched
            ? [firstInvestigationMatched]
            : study.studyInvestigations,
        });
        return studies;
      }, []),
    [data, filters]
  );

  return (
    <CardView
      data={aggregatedData ?? []}
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
