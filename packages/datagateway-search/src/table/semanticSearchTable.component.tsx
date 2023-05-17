import {
  ColumnType,
  externalSiteLink,
  Investigation,
  parseSearchToQuery,
  Table,
  useDateFilter,
  useSemanticSearch,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { TableCellProps } from 'react-virtualized';
import { useTranslation } from 'react-i18next';

function SemanticSearchTable(): JSX.Element {
  const location = useLocation();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const [t] = useTranslation();

  const searchText = queryParams.searchText ?? '';
  const { data: searchResults } = useSemanticSearch({
    query: searchText,
    enabled: true,
  });

  const textFilter = useTextFilter(queryParams.filters);
  const dateFilter = useDateFilter(queryParams.filters);
  const handleSort = useSort();

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('investigations.title'),
        dataKey: 'title',
        filterComponent: textFilter,
      },
      {
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        filterComponent: textFilter,
      },
      {
        label: t('investigations.name'),
        dataKey: 'name',
        filterComponent: textFilter,
      },
      {
        label: t('investigations.doi'),
        dataKey: 'doi',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return externalSiteLink(
            `https://doi.org/${investigationData.doi}`,
            investigationData.doi,
            'investigation-search-table-doi-link'
          );
        },
        filterComponent: textFilter,
      },
      {
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
      },
      {
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return cellProps.cellData.toString().split(' ')[0];
          }
        },
      },
    ],
    [t, textFilter, dateFilter]
  );

  return (
    <Table
      data={searchResults || []}
      columns={columns}
      sort={queryParams.sort}
      onSort={handleSort}
    />
  );
}

export default SemanticSearchTable;
