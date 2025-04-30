import {
  ColumnType,
  parseSearchToQuery,
  readSciGatewayToken,
  Table,
  tableLink,
  useDateFilter,
  useSort,
  useTextFilter,
  DataPublication,
  externalSiteLink,
  useDataPublicationCount,
  useDataPublicationsInfinite,
  DOIRelationType,
  ContributorType,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';

import { Fingerprint, CalendarToday, Public } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

const DLSMyDOIsTable = (): React.ReactElement => {
  const location = useLocation();
  const [t] = useTranslation();
  const username = readSciGatewayToken().username || '';

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  /** TODO do we want to display concept dois instead of latest version DOIs (like Zenodo does iirc?)
   * Is there a nicer way of checking for version vs concept? idk
   */
  const { data: totalDataCount } = useDataPublicationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'users.user.name': { eq: username },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'users.contributorType': {
          eq: ContributorType.Minter,
        },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'relatedItems.relationType': { eq: DOIRelationType.HasVersion },
      }),
    },
    {
      filterType: 'distinct',
      filterValue: JSON.stringify(['id', 'title', 'pid', 'publicationDate']),
    },
  ]);

  const { fetchNextPage, data } = useDataPublicationsInfinite([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'users.user.name': { eq: username },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'users.contributorType': {
          eq: ContributorType.Minter,
        },
      }),
    },
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'relatedItems.relationType': { eq: DOIRelationType.HasVersion },
      }),
    },
    {
      filterType: 'distinct',
      filterValue: JSON.stringify(['id', 'title', 'pid', 'publicationDate']),
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
    return [
      {
        icon: Fingerprint,
        label: t('datapublications.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) =>
          tableLink(
            `/browse/dataPublication/${cellProps.rowData.id}`,
            cellProps.rowData.title,
            view,
            'dls-datapublication-table-id'
          ),
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
              'dls-datapublication-table-doi-link'
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
          (cellProps.rowData as DataPublication).publicationDate?.slice(
            0,
            10
          ) ?? '',
        filterComponent: dateFilter,
        defaultSort: 'desc',
      },
    ];
  }, [t, textFilter, dateFilter, view]);

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

export default DLSMyDOIsTable;
