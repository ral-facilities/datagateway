import Assessment from '@mui/icons-material/Assessment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Fingerprint from '@mui/icons-material/Fingerprint';
import Save from '@mui/icons-material/Save';
import {
  ColumnType,
  DLSVisitDetailsPanel,
  Investigation,
  ConnectedTable as Table,
  formatBytes,
  parseSearchToQuery,
  tableLink,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsInfinite,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router';
import { IndexRange, TableCellProps } from 'react-virtualized';

interface BaseDLSVisitsTableProps {
  proposalName: string;
}

const BaseDLSVisitsTable = (
  props: BaseDLSVisitsTableProps
): React.ReactElement => {
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

  // isInitialised is used to disable queries when the component isn't fully initialised.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isInitialised, setIsInitialised] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialised && Object.keys(sort).length > 0) setIsInitialised(true);
  }, [isInitialised, sort]);

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
    isInitialised
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
    (_offsetParams: IndexRange) => fetchNextPage(),
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
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatBytes(cellProps.rowData.fileSize),
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

const DLSVisitsTable = () => {
  const { proposalName = '' } = useParams();
  return <BaseDLSVisitsTable proposalName={proposalName} />;
};

export default DLSVisitsTable;
