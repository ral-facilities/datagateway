import {
  AdditionalFilters,
  ColumnType,
  DataPublication,
  StateType,
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
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

interface DLSBaseDOIsTableProps {
  filterParams: AdditionalFilters;
}
const DLSBaseDOIsTable = (props: DLSBaseDOIsTableProps): React.ReactElement => {
  const { filterParams } = props;
  const location = useLocation();
  const [t] = useTranslation();
  const doiHandleUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiHandleUrl
  );

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
              `${doiHandleUrl}/${dataPublicationData.pid}`,
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
  }, [t, textFilter, dateFilter, view, doiHandleUrl]);

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

  const params: AdditionalFilters = [
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'users.user.name': { eq: username },
      }),
    },
  ];

  if (doiType === null || doiType.view === 'all')
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        'type.name': {
          in: ['Investigation', 'User-defined-concept'],
        },
      }),
    });
  else if (doiType.view === 'session')
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        'type.name': { eq: 'Investigation' },
      }),
    });
  else if (doiType.view === 'user')
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        'type.name': { eq: 'User-defined-concept' },
      }),
    });
  else if (doiType.view === 'minter')
    params.push(
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'users.orderKey': {
            eq: '0',
          },
        }),
      },
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'type.name': { eq: 'User-defined-concept' },
        }),
      }
    );

  if (doiType?.open === true)
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        publicationDate: { isnull: false },
      }),
    });
  else if (doiType?.open === false)
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        publicationDate: { isnull: true },
      }),
    });

  return <DLSBaseDOIsTable filterParams={params} />;
};

export const DLSAllDOIsTable = (): React.ReactElement => {
  const location = useLocation();

  const { doiType } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const params: AdditionalFilters = [];

  if (doiType === null || doiType.view === 'all')
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        'type.name': {
          in: ['Investigation', 'User-defined-concept'],
        },
      }),
    });
  else if (doiType.view === 'session')
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        'type.name': { eq: 'Investigation' },
      }),
    });
  else if (doiType.view === 'user')
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        'type.name': { eq: 'User-defined-concept' },
      }),
    });

  if (doiType?.open === true)
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        publicationDate: { isnull: false },
      }),
    });
  else if (doiType?.open === false)
    params.push({
      filterType: 'where',
      filterValue: JSON.stringify({
        publicationDate: { isnull: true },
      }),
    });

  return <DLSBaseDOIsTable filterParams={params} />;
};
