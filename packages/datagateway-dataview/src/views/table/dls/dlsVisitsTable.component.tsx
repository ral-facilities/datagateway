import {
  Investigation,
  Table,
  tableLink,
  ColumnType,
  parseSearchToQuery,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsInfinite,
  useInvestigationsDatasetCount,
  usePushSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { useLocation } from 'react-router';

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
    () => data?.pages.flat() ?? [],
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = usePushSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: FingerprintIcon,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `/browse/proposal/${proposalName}/investigation/${investigationData.id}/dataset`,
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
        cellContentRenderer: (cellProps: TableCellProps): number | string => {
          const countQuery = datasetCountQueries[cellProps.rowIndex];
          if (countQuery?.isFetching) {
            return 'Calculating...';
          } else {
            return countQuery?.data ?? 'Unknown';
          }
        },
        disableSort: true,
      },
      {
        icon: AssessmentIcon,
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
    [t, dateFilter, textFilter, view, proposalName, datasetCountQueries]
  );

  return (
    <Table
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      detailsPanel={VisitDetailsPanel}
      columns={columns}
    />
  );
};

export default DLSVisitsTable;
