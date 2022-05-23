import {
  ColumnType,
  FacilityCycle,
  parseSearchToQuery,
  useFacilityCycleCount,
  useFacilityCyclesInfinite,
  useSort,
  useTextFilter,
  useDateFilter,
  Table,
  tableLink,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { useLocation } from 'react-router-dom';
import SubjectIcon from '@mui/icons-material/Subject';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';

interface ISISFacilityCyclesTableProps {
  instrumentId: string;
}

const ISISFacilityCyclesTable = (
  props: ISISFacilityCyclesTableProps
): React.ReactElement => {
  const { instrumentId } = props;

  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useFacilityCycleCount(
    parseInt(instrumentId)
  );
  const { fetchNextPage, data } = useFacilityCyclesInfinite(
    parseInt(instrumentId)
  );

  const aggregatedData: FacilityCycle[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const pushSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: SubjectIcon,
        label: t('facilitycycles.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) =>
          tableLink(
            `/browse/instrument/${instrumentId}/facilityCycle/${cellProps.rowData.id}/investigation`,
            cellProps.rowData.name,
            view
          ),
        filterComponent: textFilter,
      },
      {
        icon: CalendarTodayIcon,
        label: t('facilitycycles.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
      {
        icon: CalendarTodayIcon,
        label: t('facilitycycles.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [t, textFilter, dateFilter, instrumentId, view]
  );

  return (
    <Table
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={pushSort}
      columns={columns}
    />
  );
};

export default ISISFacilityCyclesTable;
