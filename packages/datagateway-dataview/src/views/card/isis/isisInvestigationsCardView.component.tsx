import { Typography } from '@material-ui/core';
import {
  Fingerprint,
  Public,
  Save,
  Assessment,
  CalendarToday,
} from '@material-ui/icons';
import {
  CardView,
  formatCountOrSize,
  Investigation,
  nestedValue,
  tableLink,
  useInvestigationSizes,
  parseSearchToQuery,
  useDateFilter,
  useISISInvestigationCount,
  useISISInvestigationsPaginated,
  usePushFilters,
  usePushPage,
  usePushResults,
  usePushSort,
  useTextFilter,
  ArrowTooltip,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InvestigationDetailsPanel from '../../detailsPanels/isis/investigationDetailsPanel.component';
import { useHistory, useLocation } from 'react-router';
import AddToCartButton from '../../addToCartButton.component';

interface ISISInvestigationsCardViewProps {
  instrumentId: string;
  instrumentChildId: string;
  studyHierarchy: boolean;
}

const ISISInvestigationsCardView = (
  props: ISISInvestigationsCardViewProps
): React.ReactElement => {
  const { instrumentId, instrumentChildId, studyHierarchy } = props;

  const [t] = useTranslation();
  const location = useLocation();
  const { push } = useHistory();

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

  const {
    data: totalDataCount,
    isLoading: countLoading,
  } = useISISInvestigationCount(
    parseInt(instrumentId),
    parseInt(instrumentChildId),
    studyHierarchy
  );
  const { data, isLoading: dataLoading } = useISISInvestigationsPaginated(
    parseInt(instrumentId),
    parseInt(instrumentChildId),
    studyHierarchy
  );
  const sizeQueries = useInvestigationSizes(data);

  const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
  const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
  const urlPrefix = `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${instrumentChildId}/investigation`;

  const title = React.useMemo(
    () => ({
      label: t('investigations.title'),
      dataKey: 'title',
      content: (investigation: Investigation) =>
        tableLink(
          `${urlPrefix}/${investigation.id}`,
          investigation.title,
          view
        ),
      filterComponent: textFilter,
    }),
    [t, textFilter, urlPrefix, view]
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
        icon: Fingerprint,
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        icon: Public,
        label: t('investigations.doi'),
        dataKey: 'studyInvestigations[0].study.pid',
        filterComponent: textFilter,
      },
      {
        icon: Save,
        label: t('investigations.details.size'),
        dataKey: 'size',
        content: (investigation: Investigation): number | string => {
          const index = data?.findIndex((item) => item.id === investigation.id);
          if (typeof index === 'undefined') return 'Unknown';
          return formatCountOrSize(sizeQueries[index], true);
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
    [data, dateFilter, sizeQueries, t, textFilter]
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

  const moreInformation = React.useCallback(
    (investigation: Investigation) => (
      <InvestigationDetailsPanel
        rowData={investigation}
        viewDatasets={(id: number) => {
          const url = view
            ? `${urlPrefix}/${id}/dataset?view=${view}`
            : `${urlPrefix}/${id}/dataset`;
          push(url);
        }}
      />
    ),
    [push, urlPrefix, view]
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
      moreInformation={moreInformation}
      buttons={buttons}
    />
  );
};

export default ISISInvestigationsCardView;
