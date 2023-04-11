import {
  ColumnType,
  externalSiteLink,
  parseSearchToQuery,
  DataPublication,
  Table,
  tableLink,
  useDateFilter,
  useSort,
  useDataPublicationsInfinite,
  useTextFilter,
  useDataPublicationCount,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';

import {
  CalendarToday,
  Fingerprint,
  Public,
  Subject,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

interface ISISDataPublicationsTableProps {
  instrumentId: string;
}

const ISISDataPublicationsTable = (
  props: ISISDataPublicationsTableProps
): React.ReactElement => {
  const { instrumentId } = props;

  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useDataPublicationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
          {
            eq: instrumentId,
          },
      }),
    },
  ]);

  const { fetchNextPage, data } = useDataPublicationsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
          {
            eq: instrumentId,
          },
      }),
    },
  ]);

  /* istanbul ignore next */
  const aggregatedData: DataPublication[] = React.useMemo(() => {
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
  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const columns: ColumnType[] = React.useMemo(() => {
    const pathRoot = 'browseDataPublications';
    const instrumentChild = 'dataPublication';
    return [
      {
        icon: Fingerprint,
        label: t('datapublications.id'),
        dataKey: 'id',
        cellContentRenderer: (cellProps: TableCellProps) =>
          tableLink(
            `/${pathRoot}/instrument/${instrumentId}/${instrumentChild}/${cellProps.rowData.id}`,
            cellProps.rowData.id,
            view,
            'isis-datapublication-table-id'
          ),
        filterComponent: textFilter,
      },
      {
        icon: Subject,
        label: t('datapublications.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) =>
          cellProps.rowData.title ?? '',
        filterComponent: textFilter,
      },
      {
        icon: Public,
        label: t('datapublications.pid'),
        dataKey: 'pid',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const dataPublicationData = cellProps.rowData as DataPublication;
          if (dataPublicationData?.pid) {
            return externalSiteLink(
              `https://doi.org/${dataPublicationData.pid}`,
              dataPublicationData.pid,
              'isis-datapublication-table-doi-link'
            );
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: CalendarToday,
        label: t('datapublications.publication_date'),
        dataKey: 'publicationDate',
        cellContentRenderer: (cellProps: TableCellProps) =>
          cellProps.rowData?.content?.publicationDate?.slice(0, 10) ?? '',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
    ];
  }, [t, textFilter, dateFilter, instrumentId, view]);

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

export default ISISDataPublicationsTable;
