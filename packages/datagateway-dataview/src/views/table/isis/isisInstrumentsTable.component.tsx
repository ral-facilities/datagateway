import {
  ColumnType,
  Instrument,
  parseSearchToQuery,
  Table,
  tableLink,
  useInstrumentCount,
  useInstrumentsInfinite,
  usePushSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import InstrumentDetailsPanel from '../../detailsPanels/isis/instrumentDetailsPanel.component';
import TitleIcon from '@material-ui/icons/Title';
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
  const pushSort = usePushSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(() => {
    const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
    const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
    return [
      {
        icon: TitleIcon,
        label: t('instruments.name'),
        dataKey: 'fullName',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const instrumentData = cellProps.rowData as Instrument;
          return tableLink(
            `/${pathRoot}/instrument/${instrumentData.id}/${instrumentChild}`,
            instrumentData.fullName || instrumentData.name,
            view
          );
        },
        filterComponent: textFilter,
        defaultSort: 'asc',
      },
    ];
  }, [t, textFilter, view, studyHierarchy]);

  return (
    <Table
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={pushSort}
      detailsPanel={InstrumentDetailsPanel}
      columns={columns}
    />
  );
};

export default ISISInstrumentsTable;
