import {
  Table,
  tableLink,
  parseSearchToQuery,
  useStudiesInfinite,
  useStudyCount,
  ColumnType,
  Study,
  useDateFilter,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';

import PublicIcon from '@material-ui/icons/Public';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import TitleIcon from '@material-ui/icons/Title';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { useLocation } from 'react-router';

interface ISISStudiesTableProps {
  instrumentId: string;
}

const ISISStudiesTable = (props: ISISStudiesTableProps): React.ReactElement => {
  const { instrumentId } = props;

  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useStudyCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'studyInvestigations.investigation.investigationInstruments.instrument.id': {
          eq: instrumentId,
        },
      }),
    },
  ]);
  const { fetchNextPage, data } = useStudiesInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'studyInvestigations.investigation.investigationInstruments.instrument.id': {
          eq: instrumentId,
        },
      }),
    },
    {
      filterType: 'include',
      filterValue: JSON.stringify({
        studyInvestigations: 'investigation',
      }),
    },
  ]);

  const aggregatedData: Study[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(() => {
    const pathRoot = 'browseStudyHierarchy';
    const instrumentChild = 'study';
    return [
      {
        icon: FingerprintIcon,
        label: t('studies.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) =>
          tableLink(
            `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${cellProps.rowData.id}`,
            cellProps.rowData.name,
            view
          ),
        filterComponent: textFilter,
      },
      {
        icon: TitleIcon,
        label: t('studies.title'),
        dataKey: 'studyInvestigations.investigation.title',
        cellContentRenderer: (cellProps: TableCellProps) =>
          (cellProps.rowData as Study)?.studyInvestigations?.[0]?.investigation
            ?.title ?? '',
        filterComponent: textFilter,
      },
      {
        icon: PublicIcon,
        label: t('studies.pid'),
        dataKey: 'pid',
        filterComponent: textFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('studies.start_date'),
        dataKey: 'studyInvestigations.investigation.startDate',
        cellContentRenderer: (cellProps: TableCellProps) =>
          (cellProps.rowData as Study)?.studyInvestigations?.[0]?.investigation
            ?.startDate ?? '',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('studies.end_date'),
        dataKey: 'studyInvestigations.investigation.endDate',
        cellContentRenderer: (cellProps: TableCellProps) =>
          (cellProps.rowData as Study)?.studyInvestigations?.[0]?.investigation
            ?.endDate ?? '',
        filterComponent: dateFilter,
      },
    ];
  }, [t, textFilter, dateFilter, instrumentId, view]);

  return (
    <Table
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={handleSort}
      columns={columns}
    />
  );
};

export default ISISStudiesTable;
