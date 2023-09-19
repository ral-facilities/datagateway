import {
  ColumnType,
  FacilityCycle,
  parseSearchToQuery,
  parseQueryToSearch,
  SortType,
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
import { Subject, CalendarToday } from '@mui/icons-material';

interface ISISFacilityCyclesTableProps {
  instrumentId: string;
}

const ISISFacilityCyclesTable = (
  props: ISISFacilityCyclesTableProps
): React.ReactElement => {
  const { instrumentId } = props;

  const location = useLocation();
  const [t] = useTranslation();
  const pushSort = useSort();

  // set default sort
  const defaultSort: SortType = {
    startDate: 'desc',
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
        pushSort(column, order, 'replace');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  /* istanbul ignore next */
  const aggregatedData: FacilityCycle[] = React.useMemo(() => {
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

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Subject,
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
        icon: CalendarToday,
        label: t('facilitycycles.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        // defaultSort: 'desc',
      },
      {
        icon: CalendarToday,
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
