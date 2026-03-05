import {
  AdditionalFilters,
  ColumnType,
  ContributorType,
  DOIRelationType,
  DataPublication,
  ConnectedTable as Table,
  externalSiteLink,
  parseSearchToQuery,
  readSciGatewayToken,
  tableLink,
  useDataPublicationCount,
  useDataPublicationsInfinite,
  useDateFilter,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';

import CalendarToday from '@mui/icons-material/CalendarToday';
import Fingerprint from '@mui/icons-material/Fingerprint';
import Lock from '@mui/icons-material/Lock';
import Public from '@mui/icons-material/Public';
import { Chip } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface DLSBaseDOIsTableProps {
  filterParams: AdditionalFilters;
}
const DLSBaseDOIsTable = (props: DLSBaseDOIsTableProps): React.ReactElement => {
  const { filterParams } = props;
  const location = useLocation();
  const [t] = useTranslation();

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  /** TODO do we want to display concept dois instead of latest version DOIs (like Zenodo does iirc?)
   * Is there a nicer way of checking for version vs concept? idk
   */
  const { data: totalDataCount } = useDataPublicationCount(filterParams);

  const { fetchNextPage, data } = useDataPublicationsInfinite(filterParams);

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
    (_offsetParams: IndexRange) => fetchNextPage(),
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
          ) ?? (
            <Chip
              icon={<Lock />}
              color="error"
              label={t('datapublications.closed')}
              size="small"
            />
          ),
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

export const DLSMyDOIsTable = (): React.ReactElement => {
  const location = useLocation();
  const username = readSciGatewayToken().username || '';

  const { doiType } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  /** TODO do we want to display concept dois instead of latest version DOIs (like Zenodo does iirc?)
   * Is there a nicer way of checking for version vs concept? idk
   */
  const params =
    doiType === 'session'
      ? [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'users.user.name': { eq: username },
            }),
          },
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'type.name': { eq: 'Investigation' },
            }),
          },
        ]
      : doiType === 'openSession'
        ? [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'users.user.name': { eq: username },
              }),
            },
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'type.name': { eq: 'Investigation' },
              }),
            },
            // TODO: add back in when we can query for is not null
            // {
            //   filterType: 'where',
            //   filterValue: JSON.stringify({
            //     publicationDate: { neq: null },
            //   }),
            // },
          ]
        : doiType === 'closedSession'
          ? [
              {
                filterType: 'where',
                filterValue: JSON.stringify({
                  'users.user.name': { eq: username },
                }),
              },
              {
                filterType: 'where',
                filterValue: JSON.stringify({
                  'type.name': { eq: 'Investigation' },
                }),
              },
              // TODO: add back in when we can query for is null
              // {
              //   filterType: 'where',
              //   filterValue: JSON.stringify({
              //     publicationDate: { eq: null },
              //   }),
              // },
            ]
          : doiType === 'user'
            ? [
                {
                  filterType: 'where',
                  filterValue: JSON.stringify({
                    'users.user.name': { eq: username },
                  }),
                },
                {
                  filterType: 'where',
                  filterValue: JSON.stringify({
                    'relatedItems.relationType': {
                      eq: DOIRelationType.HasVersion,
                    },
                  }),
                },
                {
                  filterType: 'distinct',
                  filterValue: JSON.stringify([
                    'id',
                    'title',
                    'pid',
                    'publicationDate',
                  ]),
                },
                {
                  filterType: 'where',
                  filterValue: JSON.stringify({
                    'type.name': { eq: 'User-defined' },
                  }),
                },
              ]
            : [
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
                    'relatedItems.relationType': {
                      eq: DOIRelationType.HasVersion,
                    },
                  }),
                },
                {
                  filterType: 'distinct',
                  filterValue: JSON.stringify([
                    'id',
                    'title',
                    'pid',
                    'publicationDate',
                  ]),
                },
                {
                  filterType: 'where',
                  filterValue: JSON.stringify({
                    'type.name': { eq: 'User-defined' },
                  }),
                },
              ];

  return <DLSBaseDOIsTable filterParams={params} />;
};

export const DLSAllDOIsTable = (): React.ReactElement => {
  const location = useLocation();

  const { doiType } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const params =
    doiType === 'user' || doiType === 'minter'
      ? [
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'relatedItems.relationType': { eq: DOIRelationType.HasVersion },
            }),
          },
          {
            filterType: 'distinct',
            filterValue: JSON.stringify([
              'id',
              'title',
              'pid',
              'publicationDate',
            ]),
          },
          {
            filterType: 'where',
            filterValue: JSON.stringify({
              'type.name': { eq: 'User-defined' },
            }),
          },
        ]
      : doiType === 'openSession'
        ? [
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'type.name': { eq: 'Investigation' },
              }),
            },
            // TODO: add back in when we can query for is not null
            // {
            //   filterType: 'where',
            //   filterValue: JSON.stringify({
            //     publicationDate: { neq: null },
            //   }),
            // },
          ]
        : doiType === 'closedSession'
          ? [
              {
                filterType: 'where',
                filterValue: JSON.stringify({
                  'type.name': { eq: 'Investigation' },
                }),
              },
              // TODO: add back in when we can query for is null
              // {
              //   filterType: 'where',
              //   filterValue: JSON.stringify({
              //     publicationDate: { eq: null },
              //   }),
              // },
            ]
          : [
              {
                filterType: 'where',
                filterValue: JSON.stringify({
                  'type.name': { eq: 'Investigation' },
                }),
              },
            ];
  return <DLSBaseDOIsTable filterParams={params} />;
};
