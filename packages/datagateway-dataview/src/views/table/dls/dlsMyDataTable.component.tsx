import {
  ColumnType,
  formatCountOrSize,
  Investigation,
  //MicroFrontendId,
  //NotificationType,
  parseSearchToQuery,
  readSciGatewayToken,
  Table,
  tableLink,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationsInfinite,
  usePushFilters,
  usePushSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';

import TitleIcon from '@material-ui/icons/Title';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { useLocation } from 'react-router';

const DLSMyDataTable = (): React.ReactElement => {
  const [t] = useTranslation();
  const location = useLocation();
  const username = readSciGatewayToken().username || '';

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationUsers.user.name': { eq: username },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({ investigationUsers: 'user' }),
    },
  ]);
  const { fetchNextPage, data } = useInvestigationsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationUsers.user.name': { eq: username },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify([
        {
          investigationInstruments: 'instrument',
        },
        { investigationUsers: 'user' },
      ]),
    },
  ]);

  const datasetCountQueries = useInvestigationsDatasetCount(data);

  const aggregatedData: Investigation[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();
  const pushFilters = usePushFilters();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: TitleIcon,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`,
            investigationData.title,
            view
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: FingerprintIcon,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`,
            investigationData.visitId,
            view
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: ConfirmationNumberIcon,
        label: t('investigations.dataset_count'),
        dataKey: 'datasetCount',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatCountOrSize(datasetCountQueries[cellProps.rowIndex]),
        disableSort: true,
      },
      {
        icon: AssessmentIcon,
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.fullName',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.investigationInstruments?.[0]?.instrument) {
            return investigationData.investigationInstruments[0].instrument
              .fullName;
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarTodayIcon,

        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [t, dateFilter, textFilter, view, datasetCountQueries]
  );

  //  Broadcast a SciGateway notification for any warning encountered.
  // const broadcastWarning = (message: string): void => {
  //   document.dispatchEvent(
  //     new CustomEvent(MicroFrontendId, {
  //       detail: {
  //         type: NotificationType,
  //         payload: {
  //           severity: 'warning',
  //           message,
  //         },
  //       },
  //     })
  //   );
  // };

  React.useEffect(() => {
    // Sort and filter by startDate upon load.
    if (!('startDate' in sort)) pushSort('startDate', 'desc');
    if (!('startDate' in filters))
      pushFilters('startDate', {
        endDate: `${new Date(Date.now()).toISOString().split('T')[0]}`,
      });
    // we only want this to run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Table
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={pushSort}
      detailsPanel={VisitDetailsPanel}
      columns={columns}
    />
  );
};

export default DLSMyDataTable;
