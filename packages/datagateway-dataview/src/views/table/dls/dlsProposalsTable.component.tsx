import {
  Table,
  tableLink,
  Investigation,
  ColumnType,
  useInvestigationsInfinite,
  useInvestigationCount,
  parseSearchToQuery,
  parseQueryToSearch,
  SortType,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { useLocation } from 'react-router-dom';
import SubjectIcon from '@mui/icons-material/Subject';

const DLSProposalsTable = (): React.ReactElement => {
  const location = useLocation();
  const [t] = useTranslation();
  const handleSort = useSort();

  // set default sort
  const defaultSort: SortType = {
    title: 'asc',
  };
  // apply default sort
  // had to use useMemo because useEffect doesn't run until the component is mounted
  React.useMemo(() => {
    if (location.search === '') {
      location.search = parseQueryToSearch({
        ...parseSearchToQuery(location.search),
        sort: defaultSort,
      }).toString();
      // TODO: will have to add shiftDown=true to append sort after improved sort ux pr is merged
      for (const [column, order] of Object.entries(defaultSort)) {
        handleSort(column, order, 'replace');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const { fetchNextPage, data } = useInvestigationsInfinite(
    [
      {
        filterType: 'distinct',
        filterValue: JSON.stringify(['name', 'title']),
      },
    ],
    // Do not add order by id as id is not a distinct field above and will otherwise
    // cause missing results
    true
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

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: SubjectIcon,
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
        // Sort to ensure a deterministic order for pagination (ignoreIDSort: true is
        // used above in useInvestigationsInfinite)
        // defaultSort: 'asc',
        disableSort: true,
      },
      {
        icon: SubjectIcon,
        label: t('investigations.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          return tableLink(
            `/browse/proposal/${cellProps.rowData.name}/investigation`,
            cellProps.rowData.name,
            view,
            'dls-proposals-table-name'
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
