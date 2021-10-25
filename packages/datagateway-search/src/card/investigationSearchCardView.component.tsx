import {
  CalendarToday,
  ConfirmationNumber,
  Fingerprint,
  Public,
  Assessment,
} from '@material-ui/icons';
import {
  CardView,
  formatCountOrSize,
  formatFilterCount,
  Investigation,
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
  usePushSort,
  useTextFilter,
  useAllFacilityCycles,
  tableLink,
  FacilityCycle,
  useInvestigationSizes,
  useLuceneSearch,
  nestedValue,
  ArrowTooltip,
  AddToCartButton,
  DownloadButton,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { StateType } from '../state/app.types';
import { useSelector } from 'react-redux';
import { Typography, Link as MuiLink } from '@material-ui/core';

interface InvestigationCardProps {
  hierarchy: string;
}

const InvestigationCardView = (
  props: InvestigationCardProps
): React.ReactElement => {
  const { hierarchy } = props;

  const [t] = useTranslation();
  const location = useLocation();

  const { filters, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const dlsLink = (investigationData: Investigation): React.ReactElement =>
    tableLink(
      `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`,
      investigationData.title
    );

  const isisLink = React.useCallback(
    (investigationData: Investigation) => {
      let instrumentId;
      let facilityCycleId;
      if (investigationData.investigationInstruments?.length) {
        instrumentId =
          investigationData.investigationInstruments[0].instrument?.id;
      } else {
        return investigationData.title;
      }

      if (investigationData.startDate && facilityCycles?.length) {
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles?.filter(
          (facilityCycle: FacilityCycle) =>
            investigationData.startDate &&
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            investigationData.startDate >= facilityCycle.startDate &&
            investigationData.startDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId) {
        return tableLink(
          `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationData.id}/dataset`,
          investigationData.title
        );
      } else {
        return investigationData.title;
      }
    },
    [facilityCycles]
  );

  const genericLink = (investigationData: Investigation): React.ReactElement =>
    tableLink(
      `/browse/investigation/${investigationData.id}/dataset`,
      investigationData.title
    );

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLink;
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      return genericLink;
    }
  }, [hierarchy, isisLink]);

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();
  const pushFilters = usePushFilters();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const searchText = useSelector(
    (state: StateType) => state.dgsearch.searchText
  );
  const startDate = useSelector(
    (state: StateType) => state.dgsearch.selectDate.startDate
  );
  const endDate = useSelector(
    (state: StateType) => state.dgsearch.selectDate.endDate
  );
  const { data: luceneData } = useLuceneSearch('Investigation', {
    searchText,
    startDate,
    endDate,
  });

  const {
    data: totalDataCount,
    isLoading: countLoading,
  } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
  ]);
  const { isLoading: dataLoading, data } = useInvestigationsPaginated([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        id: { in: luceneData || [] },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        investigationInstruments: 'instrument',
      }),
    },
  ]);
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

  // hierarchy === 'isis' ? data : [] is a 'hack' to only perform
  // the correct calculation queries for each facility
  const datasetCountQueries = useInvestigationsDatasetCount(
    hierarchy !== 'isis' ? data : []
  );
  const sizeQueries = useInvestigationSizes(hierarchy === 'isis' ? data : []);

  const title = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('investigations.title'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'title',
      content: (investigation: Investigation) => {
        return hierarchyLink(investigation);
      },
      filterComponent: textFilter,
    }),
    // [t, textFilter, view]
    [hierarchyLink, t, textFilter]
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
                data-testId="investigation-search-card-doi-link"
              >
                {entity.doi}
              </MuiLink>
            )
          );
        },
        icon: Public,
        label: t('investigations.doi'),
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
        label:
          hierarchy === 'isis'
            ? t('investigations.size')
            : t('investigations.dataset_count'),
        dataKey: hierarchy === 'isis' ? 'size' : 'datasetCount',
        content: (investigation: Investigation): string => {
          const index = data?.findIndex((item) => item.id === investigation.id);
          if (typeof index === 'undefined') return 'Unknown';
          const query =
            hierarchy === 'isis'
              ? sizeQueries[index]
              : datasetCountQueries[index];
          return formatCountOrSize(query, hierarchy === 'isis');
        },
        disableSort: true,
      },
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
    [
      data,
      datasetCountQueries,
      dateFilter,
      hierarchy,
      sizeQueries,
      t,
      textFilter,
    ]
  );

  const buttons = React.useMemo(
    () => [
      (investigation: Investigation) => (
        <div>
          <AddToCartButton
            entityType="investigation"
            allIds={data?.map((investigation) => investigation.id) ?? []}
            entityId={investigation.id}
          />
          <DownloadButton
            entityType="investigation"
            entityId={investigation.id}
            entityName={investigation.name}
            variant="outlined"
          />
        </div>
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
      buttons={buttons}
      // If was a specific dataKey on the custom filter request,
      // use that over the filterKey here.
      customFilters={customFilters}
    />
  );
};

export default InvestigationCardView;
