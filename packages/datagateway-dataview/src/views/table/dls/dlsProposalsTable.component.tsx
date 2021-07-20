import {
  Table,
  tableLink,
  Investigation,
  ColumnType,
  useInvestigationsInfinite,
  useInvestigationCount,
  parseSearchToQuery,
  usePushSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { StateType } from '../../../state/app.types';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import TitleIcon from '@material-ui/icons/Title';

const DLSProposalsTable = (): React.ReactElement => {
  const selectAllSetting = useSelector(
    (state: StateType) => state.dgdataview.selectAllSetting
  );
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
    () => data?.pages.flat() ?? [],
    [data]
  );

  const textFilter = useTextFilter(filters);
  const pushSort = usePushSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: <TitleIcon />,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `/browse/proposal/${investigationData.name}/investigation`,
            investigationData.title,
            view
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: <TitleIcon />,
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
      },
    ],
    [t, textFilter, view]
  );

  return (
    <Table
      loading={false}
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount}
      sort={sort}
      onSort={pushSort}
      disableSelectAll={!selectAllSetting}
      columns={columns}
    />
  );
};

export default DLSProposalsTable;
