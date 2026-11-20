import React from 'react';

import Assessment from '@mui/icons-material/Assessment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Public from '@mui/icons-material/Public';
import Save from '@mui/icons-material/Save';
import { Typography } from '@mui/material';
import {
  ArrowTooltip,
  CardView,
  CardViewDetails,
  DLSVisitDetailsPanel,
  Investigation,
  externalSiteLink,
  formatBytes,
  nestedValue,
  parseSearchToQuery,
  tableLink,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsPaginated,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { StateType } from '../../../state/app.types';

interface DLSVisitsCVProps {
  proposalName: string;
}

const DLSVisitsCardView = (props: DLSVisitsCVProps): React.ReactElement => {
  const { proposalName } = props;

  const [t] = useTranslation();
  const location = useLocation();
  const doiHandleUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiHandleUrl
  );

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

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: totalDataCount, isLoading: countLoading } =
    useInvestigationCount([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ name: { eq: proposalName } }),
      },
    ]);
  const { isLoading: dataLoading, data } = useInvestigationsPaginated(
    [
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
    ],
    undefined,
    isMounted
  );

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
        content: function doiFormat(entity: Investigation) {
          if (entity.doi) {
            return externalSiteLink(
              `${doiHandleUrl}/${entity.doi}`,
              entity.doi,
              'dls-investigations-card-doi-link'
            );
          } else {
            return '';
          }
        },
        icon: Public,
        label: t('investigations.doi'),
        dataKey: 'doi',
        filterComponent: textFilter,
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
        icon: Save,
        label: t('investigations.details.size'),
        dataKey: 'fileSize',
        content: (investigation: Investigation): number | string =>
          formatBytes(investigation.fileSize),
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
    [dateFilter, doiHandleUrl, t, textFilter]
  );

  return (
    <CardView
      data-testid="dls-visits-card-view"
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
      moreInformation={(investigation: Investigation) => (
        <DLSVisitDetailsPanel rowData={investigation} />
      )}
    />
  );
};

export default DLSVisitsCardView;
