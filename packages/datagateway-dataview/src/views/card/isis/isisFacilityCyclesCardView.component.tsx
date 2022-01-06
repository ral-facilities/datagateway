import React from 'react';
import {
  CardView,
  FacilityCycle,
  parseSearchToQuery,
  tableLink,
  useDateFilter,
  useFacilityCycleCount,
  useFacilityCyclesPaginated,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import { CalendarToday } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { CardViewDetails } from 'datagateway-common/lib/card/cardView.component';

interface ISISFacilityCyclesCVProps {
  instrumentId: string;
}

const ISISFacilityCyclesCardView = (
  props: ISISFacilityCyclesCVProps
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

  const {
    data: totalDataCount,
    isLoading: countLoading,
  } = useFacilityCycleCount(parseInt(instrumentId));
  const { isLoading: dataLoading, data } = useFacilityCyclesPaginated(
    parseInt(instrumentId)
  );

  const title: CardViewDetails = React.useMemo(
    () => ({
      label: t('facilitycycles.name'),
      dataKey: 'name',
      content: (facilityCycle: FacilityCycle) =>
        tableLink(
          `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycle.id}/investigation`,
          facilityCycle.name,
          view
        ),
      filterComponent: textFilter,
    }),
    [t, textFilter, instrumentId, view]
  );

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('facilitycycles.description'),
      dataKey: 'description',
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information: CardViewDetails[] = React.useMemo(
    () => [
      {
        icon: CalendarToday,
        label: t('facilitycycles.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,
        label: t('facilitycycles.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [t, dateFilter]
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

export default ISISFacilityCyclesCardView;
