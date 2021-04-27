import React, { useCallback } from 'react';
import { Grid, LinearProgress, Paper } from '@material-ui/core';

import {
  DateColumnFilter,
  formatBytes,
  FormattedDownload,
  Order,
  Table,
  TextColumnFilter,
} from 'datagateway-common';

import { useTranslation } from 'react-i18next';
import { IndexRange } from 'react-virtualized';
import { DownloadSettingsContext } from '../ConfigProvider';
import { fetchAdminDownloads } from '../downloadApi';

const AdminDownloadStatusTable: React.FC = () => {
  // Load the settings for use
  const settings = React.useContext(DownloadSettingsContext);
  // Sorting columns
  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{
    [column: string]:
      | { value?: string | number; type: string }
      | { startDate?: string; endDate?: string };
  }>({});
  const [data, setData] = React.useState<FormattedDownload[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [t] = useTranslation();
  const dgDownloadElement = document.getElementById('datagateway-download');

  const buildQueryOffset = useCallback(() => {
    let queryOffset = `WHERE UPPER(download.facilityName) = '${settings.facilityName}'`;
    for (const [column, filter] of Object.entries(filters)) {
      if (typeof filter === 'object') {
        if (!Array.isArray(filter)) {
          if ('startDate' in filter || 'endDate' in filter) {
            const startDate = filter.startDate
              ? `${filter.startDate} 00:00:00`
              : '0000-01-01 00:00:00';
            const endDate = filter.endDate
              ? `${filter.endDate} 23:59:59`
              : '9999-12-31 23:59:59';

            queryOffset += ` AND UPPER(download.${column}) BETWEEN {ts '${startDate}'} AND {ts '${endDate}'}`;
          }

          if ('type' in filter && filter.type) {
            if (filter.type === 'include') {
              queryOffset += ` AND UPPER(download.${column}) LIKE CONCAT('%', '${filter.value}', '%')`;
            } else {
              queryOffset += ` AND UPPER(download.${column}) NOT LIKE CONCAT('%', '${filter.value}', '%')`;
            }
          }
        }
      }
    }

    queryOffset += ' ORDER BY';
    for (const [column, order] of Object.entries(sort)) {
      queryOffset += ` UPPER(download.${column}) ${order},`;
    }
    queryOffset += ' UPPER(download.id) ASC';

    return queryOffset;
  }, [filters, settings.facilityName, sort]);

  const fetchData = useCallback(
    (offsetParams: IndexRange) => {
      let queryOffset = buildQueryOffset();
      queryOffset += ` LIMIT ${offsetParams.startIndex}, ${
        offsetParams.stopIndex - offsetParams.startIndex + 1
      }`;

      setDataLoaded(false);
      return fetchAdminDownloads(
        {
          facilityName: settings.facilityName,
          downloadApiUrl: settings.downloadApiUrl,
        },
        queryOffset
      ).then((downloads) => {
        // Replace the status field here
        const formattedDownloads = downloads.map((download) => {
          const formattedIsDeleted = download.isDeleted ? 'Yes' : 'No';
          let formattedStatus = '';
          switch (download.status) {
            case 'COMPLETE':
              formattedStatus = t('downloadStatus.complete');
              break;
            case 'EXPIRED':
              formattedStatus = t('downloadStatus.expired');
              break;
            case 'PAUSED':
              formattedStatus = t('downloadStatus.paused');
              break;
            case 'PREPARING':
              formattedStatus = t('downloadStatus.preparing');
              break;
            case 'RESTORING':
              formattedStatus = t('downloadStatus.restoring');
              break;
          }

          return {
            ...download,
            isDeleted: formattedIsDeleted,
            status: formattedStatus,
          };
        });
        setData([...formattedDownloads]);
        setDataLoaded(true);
      });
    },
    [buildQueryOffset, settings.downloadApiUrl, settings.facilityName, t]
  );

  React.useEffect(() => {
    // Clear the current contents, this will make sure
    // there is visually a refresh of the table
    setData([]);

    if (dgDownloadElement) {
      fetchData({ startIndex: 0, stopIndex: 49 });
    }
  }, [
    settings.facilityName,
    settings.downloadApiUrl,
    dgDownloadElement,
    t,
    filters,
    sort,
    fetchData,
  ]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: { value?: string | number; type: string } | null) => {
        if (value) {
          setFilters({ ...filters, [dataKey]: value });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
    />
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      onChange={(value: { startDate?: string; endDate?: string } | null) => {
        if (value) {
          setFilters({ ...filters, [dataKey]: value });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
    />
  );

  return (
    <Grid container direction="column">
      {/* Show loading progress if data is still being loaded */}
      {!dataLoaded && (
        <Grid item xs={12}>
          <LinearProgress color="secondary" />
        </Grid>
      )}
      <Grid item>
        <Paper
          style={{
            height:
              'calc(100vh - 64px - 30px - 48px - 48px - (1.75rem + 40px))',
            minHeight: 230,
            overflowX: 'auto',
          }}
        >
          <Table
            columns={[
              {
                label: t('downloadStatus.username'),
                dataKey: 'userName',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.preparedId'),
                dataKey: 'preparedId',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.transport'),
                dataKey: 'transport',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.status'),
                dataKey: 'status',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.size'),
                dataKey: 'size',
                cellContentRenderer: (cellProps) => {
                  return formatBytes(cellProps.cellData);
                },
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.createdAt'),
                dataKey: 'createdAt',
                filterComponent: dateFilter,
                disableHeaderWrap: true,
              },
              {
                label: t('downloadStatus.deleted'),
                dataKey: 'isDeleted',
                filterComponent: textFilter,
              },
            ]}
            sort={sort}
            onSort={(column: string, order: 'desc' | 'asc' | null) => {
              if (order) {
                setSort({ ...sort, [column]: order });
              } else {
                const { [column]: order, ...restOfSort } = sort;
                setSort(restOfSort);
              }
            }}
            data={data}
            loading={!dataLoaded}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminDownloadStatusTable;
