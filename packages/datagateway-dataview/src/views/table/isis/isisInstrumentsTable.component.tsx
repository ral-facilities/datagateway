import {
  ColumnType,
  Instrument,
  parseSearchToQuery,
  Table,
  tableLink,
  useInstrumentCount,
  useInstrumentsInfinite,
  useSort,
  useTextFilter,
  ISISInstrumentDetailsPanel,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import SubjectIcon from '@mui/icons-material/Subject';
import { useLocation } from 'react-router-dom';

interface ISISInstrumentsTableProps {
  dataPublication: boolean;
}

const ISISInstrumentsTable = (
  props: ISISInstrumentsTableProps
): React.ReactElement => {
  const { dataPublication } = props;

  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: totalDataCount } = useInstrumentCount();
  const { fetchNextPage, data } = useInstrumentsInfinite(undefined, isMounted);

  /* istanbul ignore next */
  const aggregatedData: Instrument[] = React.useMemo(() => {
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
  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(() => {
    const pathRoot = dataPublication ? 'browseDataPublications' : 'browse';
    const instrumentChild = dataPublication
      ? 'dataPublication'
      : 'facilityCycle';
    return [
      {
        icon: SubjectIcon,
        label: t('instruments.name'),
        dataKey: 'fullName',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const instrumentData = cellProps.rowData as Instrument;
          return tableLink(
            `/${pathRoot}/instrument/${instrumentData.id}/${instrumentChild}`,
            instrumentData.fullName || instrumentData.name,
            view,
            'isis-instrument-table-name'
          );
        },
        filterComponent: textFilter,
        defaultSort: 'asc',
      },
      {
        icon: SubjectIcon,
        label: t('instruments.type'),
        dataKey: 'type',
        filterComponent: textFilter,
      },
    ];
  }, [t, textFilter, view, dataPublication]);

  return (
    <Table
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={handleSort}
      detailsPanel={ISISInstrumentDetailsPanel}
      columns={columns}
    />
  );
};

export default ISISInstrumentsTable;
