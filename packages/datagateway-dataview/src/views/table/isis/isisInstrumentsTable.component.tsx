import {
  ColumnType,
  Instrument,
  parseSearchToQuery,
  parseQueryToSearch,
  Table,
  tableLink,
  useInstrumentCount,
  useInstrumentsInfinite,
  useSort,
  useTextFilter,
  ISISInstrumentDetailsPanel,
  SortType,
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

  const handleSort = useSort();

  // set default sort
  const defaultSort: SortType = {
    fullName: 'asc',
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

  const { data: totalDataCount } = useInstrumentCount();
  const { fetchNextPage, data } = useInstrumentsInfinite();

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
        // defaultSort: 'asc',
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
