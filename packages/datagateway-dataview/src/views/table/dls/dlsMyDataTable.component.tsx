import {
  ColumnType,
  DLSVisitDetailsPanel,
  Investigation,
  ConnectedTable as Table,
  externalSiteLink,
  formatBytes,
  parseSearchToQuery,
  readSciGatewayToken,
  tableLink,
  useDateFilter,
  useInvestigationCount,
  useInvestigationsInfinite,
  useReplaceFilter,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';

import Assessment from '@mui/icons-material/Assessment';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Fingerprint from '@mui/icons-material/Fingerprint';
import Public from '@mui/icons-material/Public';
import Save from '@mui/icons-material/Save';
import Subject from '@mui/icons-material/Subject';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { StateType } from '../../../state/app.types';

const DLSMyDataTable = (): React.ReactElement => {
  const [t] = useTranslation();
  const location = useLocation();
  const username = readSciGatewayToken().username || '';
  const doiHandleUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.doiHandleUrl
  );

  const { filters, view, sort } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const { data: totalDataCount } = useInvestigationCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigationUsers.user.name': { eq: username },
      }),
    },
  ]);

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort/filter is set.
  // It is not needed for cards/tables that don't have default sort/filter.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { fetchNextPage, data } = useInvestigationsInfinite(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigationUsers.user.name': { eq: username },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify([
          {
            investigationInstruments: 'instrument',
          },
        ]),
      },
    ],
    undefined,
    isMounted
  );

  /* istanbul ignore next */
  const aggregatedData: Investigation[] = React.useMemo(() => {
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
  const handleDefaultFilter = useReplaceFilter();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage({ pageParam: offsetParams }),
    [fetchNextPage]
  );

  const [currentDate] = React.useState(() => new Date(Date.now()));

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        icon: Subject,
        label: t('investigations.title'),
        dataKey: 'title',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`,
            investigationData.title,
            view,
            'dls-mydata-table-name'
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: Fingerprint,
        label: t('investigations.visit_id'),
        dataKey: 'visitId',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          return tableLink(
            `/browse/proposal/${investigationData.name}/investigation/${investigationData.id}/dataset`,
            investigationData.visitId,
            view,
            'dls-mydata-table-visitId'
          );
        },
        filterComponent: textFilter,
      },
      {
        icon: Public,
        label: t('investigations.doi'),
        dataKey: 'doi',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;

          if (investigationData.doi) {
            return externalSiteLink(
              `${doiHandleUrl}/${investigationData.doi}`,
              investigationData.doi,
              'dls-mydata-table-doi-link'
            );
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: Save,
        label: t('investigations.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps: TableCellProps): number | string =>
          formatBytes(cellProps.rowData.fileSize),
      },
      {
        icon: Assessment,
        label: t('investigations.instrument'),
        dataKey: 'investigationInstruments.instrument.fullName',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const investigationData = cellProps.rowData as Investigation;
          if (investigationData?.investigationInstruments?.[0]?.instrument) {
            return investigationData.investigationInstruments[0].instrument
              .fullName;
          } else {
            return '';
          }
        },
        filterComponent: textFilter,
      },
      {
        icon: CalendarToday,
        label: t('investigations.start_date'),
        dataKey: 'startDate',
        filterComponent: dateFilter,
        defaultSort: 'desc',
        defaultFilter: {
          endDate: `${currentDate.toISOString().split('T')[0]}`,
        },
      },
      {
        icon: CalendarToday,
        label: t('investigations.end_date'),
        dataKey: 'endDate',
        filterComponent: dateFilter,
      },
    ],
    [t, textFilter, dateFilter, currentDate, view, doiHandleUrl]
  );

  return (
    <Table
      data={aggregatedData}
      loadMoreRows={loadMoreRows}
      totalRowCount={totalDataCount ?? 0}
      sort={sort}
      onSort={handleSort}
      onDefaultFilter={handleDefaultFilter}
      filters={filters}
      detailsPanel={DLSVisitDetailsPanel}
      columns={columns}
    />
  );
};

export default DLSMyDataTable;
