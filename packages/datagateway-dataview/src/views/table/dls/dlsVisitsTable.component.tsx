import {
  Investigation,
  Table,
  tableLink,
  ColumnType,
  formatCountOrSize,
  parseSearchToQuery,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsInfinite,
  useInvestigationsDatasetCount,
  useSort,
  useTextFilter,
  DLSVisitDetailsPanel,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import {
  Fingerprint,
  ConfirmationNumber,
  Assessment,
  CalendarToday,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

interface DLSVisitsTableProps {
  proposalName: string;
}

const DLSVisitsTable = (props: DLSVisitsTableProps): React.ReactElement => {
  const { proposalName } = props;

  const [t] = useTranslation();
  const location = useLocation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({ name: { eq: proposalName } }),
    },
  ]);
  const { fetchNextPage, data } = useInvestigationsInfinite([
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

  const datasetCountQueries = useInvestigationsDatasetCount(data);

  const aggregatedData: Investigation[] = React.useMemo(
    () =>
      data
        ? 'pages' in data
          ? data.pages.flat()
          : data instanceof Array
          ? data
          : []
        : [],
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Fingerprint,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigationData.id}/dataset`,
            investigationData.visitId,
            view,
            'dls-visits-table-visitId'
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
        dataKey: 'investigationInstruments.instrument.name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.investigationInstruments?.[0]?.instrument) {
            return investigationData.investigationInstruments[0].instrument
              .name;
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
    [t, dateFilter, textFilter, view, proposalName, datasetCountQueries]
  );

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

export default DLSVisitsTable;
