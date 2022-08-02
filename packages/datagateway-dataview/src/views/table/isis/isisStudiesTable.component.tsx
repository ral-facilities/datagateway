import {
  Table,
  tableLink,
  parseSearchToQuery,
  useStudiesInfinite,
  useStudyCount,
  ColumnType,
  getStudyInfoInvestigation,
  Study,
  useDateFilter,
  useSort,
  useTextFilter,
  externalSiteLink,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';

import {
  Public,
  Fingerprint,
  Subject,
  CalendarToday,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { format, set } from 'date-fns';

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

  const unembargoDate = format(
    // set s and ms to 0 to escape recursive loop of fetching data every time they change
    set(new Date(), { seconds: 0, milliseconds: 0 }),
    'yyyy-MM-dd HH:mm:ss'
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
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        // this matches the ISIS ICAT rule
        'studyInvestigations.investigation.releaseDate': {
          lt: unembargoDate,
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
      filterType: 'where',
      filterValue: JSON.stringify({
        // this matches the ISIS ICAT rule
        'studyInvestigations.investigation.releaseDate': {
          lt: unembargoDate,
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

  const columns: ColumnType[] = React.useMemo(() => {
    const pathRoot = 'browseStudyHierarchy';
    const instrumentChild = 'study';
    return [
      {
        icon: Fingerprint,
        label: t('studies.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) =>
          tableLink(
            `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${cellProps.rowData.id}`,
            cellProps.rowData.name,
            view,
            'isis-study-table-name'
          ),
        filterComponent: textFilter,
      },
      {
        icon: Subject,
        label: t('studies.title'),
        dataKey: 'studyInvestigations.investigation.title',
        cellContentRenderer: (cellProps: TableCellProps) =>
          getStudyInfoInvestigation(cellProps.rowData as Study)?.title ?? '',
        filterComponent: textFilter,
      },
      {
        icon: Public,
        label: t('studies.pid'),
        dataKey: 'pid',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const studyData = cellProps.rowData as Study;
          if (studyData?.pid) {
            return externalSiteLink(
              `https://doi.org/${studyData.pid}`,
              studyData.pid,
              'isis-study-table-doi-link'
            );
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: CalendarToday,
        label: t('studies.start_date'),
        dataKey: 'studyInvestigations.investigation.startDate',
        cellContentRenderer: (cellProps: TableCellProps) =>
          getStudyInfoInvestigation(cellProps.rowData as Study)?.startDate ??
          '',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarToday,
        label: t('studies.end_date'),
        dataKey: 'studyInvestigations.investigation.endDate',
        cellContentRenderer: (cellProps: TableCellProps) =>
          getStudyInfoInvestigation(cellProps.rowData as Study)?.endDate ?? '',
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
