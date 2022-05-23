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
  studyHierarchy: boolean;
}

const ISISInstrumentsTable = (
  props: ISISInstrumentsTableProps
): React.ReactElement => {
  const { studyHierarchy } = props;

  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInstrumentCount();
  const { fetchNextPage, data } = useInstrumentsInfinite();

  const aggregatedData: Instrument[] = React.useMemo(
    () => (data ? ('pages' in data ? data.pages.flat() : data) : []),
    [data]
  );

  const textFilter = useTextFilter(filters);
  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(() => {
    const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
    const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
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
  }, [t, textFilter, view, studyHierarchy]);

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
