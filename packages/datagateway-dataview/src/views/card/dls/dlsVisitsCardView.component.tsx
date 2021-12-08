import React from 'react';

import {
  CardView,
  CardViewDetails,
  formatCountOrSize,
  Investigation,
  tableLink,
  parseSearchToQuery,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsPaginated,
  usePushFilters,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
  useInvestigationsDatasetCount,
  nestedValue,
  ArrowTooltip,
} from 'datagateway-common';
import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';
import {
  Assessment,
  CalendarToday,
  ConfirmationNumber,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Typography } from '@material-ui/core';

interface DLSVisitsCVProps {
  proposalName: string;
}

const DLSVisitsCardView = (props: DLSVisitsCVProps): React.ReactElement => {
  const { proposalName } = props;

  const [t] = useTranslation();
  const location = useLocation();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();
  const pushFilters = usePushFilters();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const {
    data: totalDataCount,
    isLoading: countLoading,
  } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({ name: { eq: proposalName } }),
    },
  ]);
  const { isLoading: dataLoading, data } = useInvestigationsPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({ name: { eq: proposalName } }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigationInstruments: 'instrument',
      }),
    },
  ]);
  const countQueries = useInvestigationsDatasetCount(data);

  const title = React.useMemo(
    () => ({
      label: t('investigations.visit_id'),
      dataKey: 'visitId',
      content: (investigation: Investigation) =>
        tableLink(
          `/browse/proposal/${proposalName}/investigation/${investigation.id}/dataset`,
          investigation.visitId,
          view
        ),
      filterComponent: textFilter,
    }),
    [proposalName, t, textFilter, view]
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
        icon: ConfirmationNumber,
        label: t('investigations.dataset_count'),
        dataKey: 'datasetCount',
        content: (investigation: Investigation): string => {
          const index = data?.findIndex((item) => item.id === investigation.id);
          if (typeof index === 'undefined') return 'Unknown';
          return formatCountOrSize(countQueries[index]);
        },
        disableSort: true,
      },
      {
        icon: CalendarToday,
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [countQueries, data, dateFilter, t, textFilter]
  );

  return (
    <CardView
      data={data ?? []}
      totalDataCount={totalDataCount ?? 0}
      onPageChange={pushPage}
      onFilter={pushFilters}
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
      moreInformation={(investigation: Investigation) => (
        <VisitDetailsPanel rowData={investigation} />
      )}
    />
  );
};

export default DLSVisitsCardView;
