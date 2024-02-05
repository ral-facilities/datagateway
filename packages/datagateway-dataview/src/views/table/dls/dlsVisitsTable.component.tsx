import {
  Investigation,
  Table,
  tableLink,
  ColumnType,
  parseSearchToQuery,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsInfinite,
  useSort,
  useTextFilter,
  DLSVisitDetailsPanel,
  formatBytes,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import {
  Fingerprint,
  Assessment,
  CalendarToday,
  Save,
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

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { fetchNextPage, data } = useInvestigationsInfinite(
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

  /* istanbul ignore next */
  const aggregatedData: Investigation[] = React.useMemo(() => {
    if (data) {
      if ('pages' in data) {
        return data.pages.flat();
      } else if ((data as unknown) instanceof Array) {
        return data;
      }
    }

    return [];
  }, [data]);

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
        icon: Save,
        label: t('investigations.size'),
        dataKey: 'size',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatBytes(cellProps.rowData.fileSize),
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
    [t, dateFilter, textFilter, view, proposalName]
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
