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
  Investigation,
  parseSearchToQuery,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationsPaginated,
  usePushFilters,
  usePushPage,
  usePushResults,
  useSort,
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
import {
  Typography,
  Link as MuiLink,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';

interface InvestigationCardProps {
  hierarchy: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actionButtons: {
      display: 'flex',
      flexDirection: 'column',
      '& button': {
        marginTop: theme.spacing(1),
        margin: 'auto',
      },
    },
  })
);

const InvestigationCardView = (
  props: InvestigationCardProps
): React.ReactElement => {
  const { hierarchy } = props;

  const [t] = useTranslation();
  const location = useLocation();

  const queryParams = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const {
    investigationFilters,
    sort,
    page,
    results,
    startDate,
    endDate,
  } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

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

  const textFilter = useTextFilter(investigationFilters, 'investigation');
  const dateFilter = useDateFilter(investigationFilters, 'investigation');
  const handleSort = useSort();
  const pushFilters = usePushFilters();
  const pushPage = usePushPage('investigation');
  const pushResults = usePushResults();

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const { data: luceneData } = useLuceneSearch('Investigation', {
    searchText,
    startDate,
    endDate,
    maxCount: maxNumResults,
  });

  const {
    data: totalDataCount,
    isLoading: countLoading,
  } = useInvestigationCount(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: luceneData || [] },
        }),
      },
    ],
    'investigation'
  );
  const { isLoading: dataLoading, data } = useInvestigationsPaginated(
    [
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
    ],
    'investigation'
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
                data-testid="investigation-search-card-doi-link"
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

  const classes = useStyles();

  const buttons = React.useMemo(
    () =>
      hierarchy !== 'dls'
        ? [
            (investigation: Investigation) => (
              <div className={classes.actionButtons}>
                <AddToCartButton
                  entityType="investigation"
                  allIds={data?.map((investigation) => investigation.id) ?? []}
                  entityId={investigation.id}
                />
                <DownloadButton
                  entityType="investigation"
                  entityId={investigation.id}
                  entityName={investigation.name}
                />
              </div>
            ),
          ]
        : [],
    [classes.actionButtons, data, hierarchy]
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
      filters={investigationFilters}
      sort={sort}
      page={page}
      results={results}
      title={title}
      description={description}
      information={information}
      buttons={buttons}
    />
  );
};

export default InvestigationCardView;
