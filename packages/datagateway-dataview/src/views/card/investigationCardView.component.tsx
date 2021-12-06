import {
  CalendarToday,
  ConfirmationNumber,
  Fingerprint,
  Public,
} from '@material-ui/icons';
import { Link as MuiLink } from '@material-ui/core';
import {
  CardView,
  formatCountOrSize,
  formatFilterCount,
  Investigation,
  investigationLink,
  parseSearchToQuery,
  useDateFilter,
  useCustomFilter,
  useCustomFilterCount,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationsPaginated,
  usePushFilters,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
  AddToCartButton,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const InvestigationCardView = (): React.ReactElement => {
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
  } = useInvestigationCount();

  const { isLoading: dataLoading, data } = useInvestigationsPaginated([
    {
      filterType: 'include',
      filterValue: JSON.stringify('type'),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify('facility'),
    },
  ]);
  const countQueries = useInvestigationsDatasetCount(data);
  const { data: typeIds } = useCustomFilter('investigation', 'type.id');
  const { data: facilityIds } = useCustomFilter('investigation', 'facility.id');

  const typeIdCounts = useCustomFilterCount(
    'investigation',
    'type.id',
    typeIds
  );
  const facilityIdCounts = useCustomFilterCount(
    'investigation',
    'facility.id',
    facilityIds
  );

  const title = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('investigations.title'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'title',
      content: (investigation: Investigation) => {
        return investigationLink(investigation.id, investigation.title, view);
      },
      filterComponent: textFilter,
    }),
    [t, textFilter, view]
  );

  const description = React.useMemo(
    () => ({
      label: t('investigations.details.summary'),
      dataKey: 'summary',
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information = React.useMemo(
    () => [
      {
        content: function doiFormat(entity: Investigation) {
          return (
            entity?.doi && (
              <MuiLink
                href={`https://doi.org/${entity.doi}`}
                data-testid="investigation-card-doi-link"
              >
                {entity.doi}
              </MuiLink>
            )
          );
        },
        label: t('investigations.doi'),
        icon: Public,
        dataKey: 'doi',
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.details.name'),
        dataKey: 'name',
        filterComponent: textFilter,
        disableSort: true,
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
        label: t('investigations.details.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarToday,
        label: t('investigations.details.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [countQueries, data, dateFilter, t, textFilter]
  );

  const buttons = React.useMemo(
    () => [
      (investigation: Investigation) => (
        <AddToCartButton
          entityType="investigation"
          allIds={data?.map((investigation) => investigation.id) ?? []}
          entityId={investigation.id}
        />
      ),
    ],
    [data]
  );

  const customFilters = React.useMemo(
    () => [
      {
        label: t('investigations.type.id'),
        dataKey: 'type.id',
        filterItems: typeIds
          ? typeIds.map((id, i) => ({
              name: id,
              count: formatFilterCount(typeIdCounts[i]),
            }))
          : [],
        prefixLabel: true,
      },
      {
        label: t('investigations.facility.id'),
        dataKey: 'facility.id',
        filterItems: facilityIds
          ? facilityIds.map((id, i) => ({
              name: id,
              count: formatFilterCount(facilityIdCounts[i]),
            }))
          : [],
        prefixLabel: true,
      },
    ],
    [facilityIds, t, typeIds, typeIdCounts, facilityIdCounts]
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
      buttons={buttons}
      // If was a specific dataKey on the custom filter request,
      // use that over the filterKey here.
      customFilters={customFilters}
    />
  );
};

export default InvestigationCardView;
