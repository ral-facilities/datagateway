import {
  Table,
  tableLink,
  Investigation,
  ColumnType,
  useInvestigationsInfinite,
  useInvestigationCount,
  parseSearchToQuery,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { useLocation } from 'react-router-dom';
import TitleIcon from '@material-ui/icons/Title';

const DLSProposalsTable = (): React.ReactElement => {
  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount([
    {
      filterType: 'distinct',
      filterValue: JSON.stringify(['name', 'title']),
    },
  ]);
  const { fetchNextPage, data } = useInvestigationsInfinite([
    {
      filterType: 'distinct',
      filterValue: JSON.stringify(['name', 'title']),
    },
  ]);

  const aggregatedData: Investigation[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const textFilter = useTextFilter(filters, 'push');
  const handleSort = useSort();

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
            `/browse/proposal/${investigationData.name}/investigation`,
            investigationData.title,
            view,
            'dls-proposals-table-title'
          );
        },
        filterComponent: textFilter,
        disableSort: true,
      },
      {
        icon: TitleIcon,
        label: t('investigations.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          return tableLink(
            `/browse/proposal/${cellProps.rowData.name}/investigation`,
            cellProps.rowData.name,
            view
          );
        },
        filterComponent: textFilter,
        disableSort: true,
      },
    ],
    [t, textFilter, view]
  );

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

export default DLSProposalsTable;
