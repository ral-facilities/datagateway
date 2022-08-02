import {
  ColumnType,
  formatCountOrSize,
  Investigation,
  parseSearchToQuery,
  readSciGatewayToken,
  Table,
  tableLink,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationsInfinite,
  usePushFilter,
  useSort,
  useTextFilter,
  DLSVisitDetailsPanel,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';

import {
  Subject,
  Fingerprint,
  ConfirmationNumber,
  Assessment,
  CalendarToday,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

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
      ]),
    },
  ]);

  const datasetCountQueries = useInvestigationsDatasetCount(data);

  /* istanbul ignore next */
  const aggregatedData: Investigation[] = React.useMemo(() => {
    if (data) {
      if ('pages' in data) {
        return data.pages.flat();
      } else if (data instanceof Array) {
        return data;
      }
    }

    return [];
  }, [data]);

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();
  const pushFilter = usePushFilter();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Subject,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`,
            investigationData.title,
            view,
            'dls-mydata-table-name'
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`,
            investigationData.visitId,
            view,
            'dls-mydata-table-visitId'
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: ConfirmationNumber,
        label: t('investigations.dataset_count'),
        dataKey: 'datasetCount',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatCountOrSize(datasetCountQueries[cellProps.rowIndex]),
        disableSort: true,
      },
      {
        icon: Assessment,
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
    [t, dateFilter, textFilter, view, datasetCountQueries]
  );

  React.useEffect(() => {
    // Sort and filter by startDate upon load.
    if (!('startDate' in filters))
      pushFilter('startDate', {
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
      onSort={handleSort}
      detailsPanel={DLSVisitDetailsPanel}
      columns={columns}
    />
  );
};

export default DLSMyDataTable;
