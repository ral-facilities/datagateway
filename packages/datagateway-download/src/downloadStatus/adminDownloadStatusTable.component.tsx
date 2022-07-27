import React, { useCallback, useRef } from 'react';
import {
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  styled,
  Typography,
} from '@mui/material';

import {
  DateColumnFilter,
  DateFilter,
  DownloadStatus,
  formatBytes,
  FormattedDownload,
  Order,
  Table,
  TableActionProps,
  TextColumnFilter,
  TextFilter,
} from 'datagateway-common';

import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import {
  PauseCircleFilled,
  PlayCircleFilled,
  Refresh,
  RemoveCircle,
  Restore,
} from '@mui/icons-material';
import BlackTooltip from '../tooltip.component';
import { toDate } from 'date-fns-tz';
import { format } from 'date-fns';
import {
  useAdminDownloadDeleted,
  useAdminDownloads,
  useAdminUpdateDownloadStatus,
} from '../downloadApiHooks';
import { DownloadSettingsContext } from '../ConfigProvider';
import useDownloadFormatter from './hooks/useDownloadFormatter';
import DownloadProgressIndicator from './downloadProgressIndicator.component';

const StyledPaper = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
}));

const AdminDownloadStatusTable: React.FC = () => {
  // Load the settings for use
  const settings = React.useContext(DownloadSettingsContext);
  // Sorting columns
  const [sort, setSort] = React.useState<{ [column: string]: Order }>({
    createdAt: 'desc',
  });
  const [filters, setFilters] = React.useState<{
    [column: string]:
      | { value?: string | number; type: string }
      | { startDate?: string; endDate?: string };
  }>({});
  const [refreshDownloads, setRefreshDownloads] = React.useState(false);
  const [lastChecked, setLastChecked] = React.useState(
    new Date().toLocaleString()
  );
  const [t] = useTranslation();
  const { downloadStatusLabels: downloadStatuses } = useDownloadFormatter();
  const { mutate: adminDownloadDeleted } = useAdminDownloadDeleted();
  const { mutate: adminUpdateDownloadStatus } = useAdminUpdateDownloadStatus();
  // whether this is component's first render.
  const isFirstRender = useRef(true);

  const buildQueryOffset = useCallback(() => {
    let queryOffset = `WHERE download.facilityName = '${settings.facilityName}'`;
    for (const [column, filter] of Object.entries(filters)) {
      if (typeof filter === 'object') {
        if (!Array.isArray(filter)) {
          if ('startDate' in filter || 'endDate' in filter) {
            // TODO: remove :00 when #1227 is fixed
            const startDate = filter.startDate
              ? `${filter.startDate}:00`
              : '0001-01-01 00:00:00';
            const endDate = filter.endDate
              ? `${filter.endDate}:00`
              : '9999-12-31 23:59:00';

            queryOffset += ` AND download.${column} BETWEEN {ts '${startDate}'} AND {ts '${endDate}'}`;
          }

          if ('type' in filter && filter.type) {
            // As UPPER is used need to pass text filters in upper case to avoid case sensitivity
            const filterValue =
              typeof filter.value === 'string'
                ? (filter.value as string).toUpperCase()
                : filter.value;

            if (filter.type === 'include') {
              queryOffset += ` AND UPPER(download.${column}) LIKE CONCAT('%', '${filterValue}', '%')`;
            } else {
              queryOffset += ` AND UPPER(download.${column}) NOT LIKE CONCAT('%', '${filterValue}', '%')`;
            }
          }
        }
      }
    }

    queryOffset += ' ORDER BY';
    for (const [column, order] of Object.entries(sort)) {
      queryOffset += ` download.${column} ${order},`;
    }
    queryOffset += ' download.id ASC';

    return queryOffset;
  }, [filters, settings.facilityName, sort]);

  const {
    data,
    isLoading,
    isFetched,
    isRefetching,
    fetchNextPage,
    refetch,
  } = useAdminDownloads({
    initialQueryOffset: `${buildQueryOffset()} LIMIT 0, 50`,
  });

  const fetchMoreData = useCallback(
    (offsetParams: IndexRange) =>
      fetchNextPage({
        pageParam: `${buildQueryOffset()} LIMIT ${offsetParams.startIndex}, ${
          offsetParams.stopIndex - offsetParams.startIndex + 1
        }`,
      }),
    [buildQueryOffset, fetchNextPage]
  );

  const refreshTable = useCallback(async () => {
    await refetch();
    setRefreshDownloads(false);
  }, [refetch]);

  React.useEffect(() => {
    if (refreshDownloads && isFetched) {
      // user requested to refresh table
      refreshTable();
    }
  }, [isFetched, refreshDownloads, refreshTable]);

  React.useEffect(() => {
    if (isFetched) {
      setLastChecked(new Date().toLocaleString());
    }
  }, [isFetched]);

  React.useEffect(() => {
    // useEffect is always called on first render
    // we don't want to refetch when the initial fetch is already going
    // we only want to refetch when sort and filters changes
    //
    // here we use a ref that is true on first render
    // and we use that to check if this effect is run on first render
    // if it is true, set it to false,
    // so that subsequent calls of this effect due to sort and filters changes
    // will allow refetch.
    if (!isFirstRender.current) {
      refetch({ cancelRefetch: true });
    } else {
      isFirstRender.current = false;
    }
  }, [refetch, sort, filters]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: { value?: string | number; type: string } | null) => {
        if (value) {
          if (dataKey === 'status') {
            const downloadStatus = (Object.keys(
              downloadStatuses
            ) as DownloadStatus[]).find(
              (key) =>
                downloadStatuses[key].toLowerCase() ===
                (value.value as string).toLowerCase()
            );
            if (typeof downloadStatus !== 'undefined') {
              value.value = downloadStatus;
            }
          }
          setFilters({ ...filters, [dataKey]: value });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
      value={filters[dataKey] as TextFilter}
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
      value={filters[dataKey] as DateFilter}
      filterByTime
    />
  );

  const tableItems = React.useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data?.pages]
  );

  return (
    <StyledPaper square>
      <Grid container spacing={1}>
        {/* Place the last updated time above the table. */}
        <Grid
          item
          xs={12}
          aria-label={t('downloadTab.last_updated_time_arialabel')}
        >
          <Typography
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              float: 'right',
            }}
            variant="subtitle1"
            component="h3"
          >
            {/* Show refresh icon and re-populate the download status table. */}
            {!refreshDownloads ? (
              <BlackTooltip title="Refresh Downloads" enterDelay={500}>
                <IconButton
                  color="secondary"
                  aria-label={t(
                    'downloadTab.refresh_download_status_arialabel'
                  )}
                  onClick={() => setRefreshDownloads(true)}
                  size="large"
                >
                  <Refresh />
                </IconButton>
              </BlackTooltip>
            ) : (
              <CircularProgress size={20} />
            )}

            {!refreshDownloads ? (
              <p style={{ paddingLeft: '10px ' }}>
                <b>{t('downloadTab.last_checked')}: </b> {lastChecked}
              </p>
            ) : (
              <p style={{ paddingLeft: '20px ' }}>
                <i>{t('downloadTab.refreshing_downloads')}</i>
              </p>
            )}
          </Typography>
        </Grid>
        <Grid item xs>
          <Grid container direction="column">
            {/* Show loading progress if data is still being loaded */}
            {(isLoading || isRefetching) && (
              <Grid item xs={12}>
                <LinearProgress color="secondary" />
              </Grid>
            )}
            <Grid item>
              {/* Table should take up page but leave room for: SG appbar, SG footer,
            tabs, admin header, table padding, and text above table (respectively). */}
              <Paper
                style={{
                  height:
                    'calc(100vh - 64px - 36px - 48px - (3rem * 1.167) - 32px - (1.75rem + 40px))',
                  minHeight: 230,
                  overflowX: 'auto',
                }}
              >
                <Table
                  columns={[
                    {
                      label: t('downloadStatus.id'),
                      dataKey: 'id',
                      filterComponent: textFilter,
                    },
                    {
                      label: t('downloadStatus.fullname'),
                      dataKey: 'fullName',
                      filterComponent: textFilter,
                    },
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
                    ...(settings.uiFeatures.includes('DOWNLOAD_PROGRESS')
                      ? [
                          {
                            label: t('downloadStatus.progress'),
                            dataKey: 'progress',
                            disableSort: true,
                            cellContentRenderer: ({
                              rowData,
                            }: TableCellProps) => (
                              <DownloadProgressIndicator
                                download={rowData as FormattedDownload}
                              />
                            ),
                          },
                        ]
                      : []),
                    {
                      label: t('downloadStatus.size'),
                      dataKey: 'size',
                      cellContentRenderer: (cellProps) => {
                        return formatBytes(cellProps.cellData);
                      },
                      disableSort: true,
                    },
                    {
                      label: t('downloadStatus.createdAt'),
                      dataKey: 'createdAt',
                      cellContentRenderer: (props: TableCellProps) => {
                        if (props.cellData) {
                          const date = toDate(props.cellData);
                          return format(date, 'yyyy-MM-dd HH:mm:ss');
                        }
                      },
                      filterComponent: dateFilter,
                    },
                    {
                      label: t('downloadStatus.deleted'),
                      dataKey: 'isDeleted',
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
                  data={tableItems}
                  loading={isLoading}
                  loadMoreRows={fetchMoreData}
                  totalRowCount={Number.MAX_SAFE_INTEGER}
                  actionsWidth={100}
                  actions={[
                    function RestoreButton({ rowData }: TableActionProps) {
                      const downloadItem = rowData as FormattedDownload;
                      const [isDeleted] = React.useState(
                        downloadItem.isDeleted
                      );

                      if (isDeleted === 'No') {
                        return null;
                      }

                      return (
                        <IconButton
                          aria-label={t('downloadStatus.restore', {
                            filename: downloadItem.fileName,
                          })}
                          key="restore"
                          size="small"
                          onClick={() =>
                            adminDownloadDeleted({
                              downloadId: downloadItem.id,
                              deleted: false,
                            })
                          }
                        >
                          <Restore />
                        </IconButton>
                      );
                    },

                    function DeleteButton({ rowData }: TableActionProps) {
                      const downloadItem = rowData as FormattedDownload;
                      const [isDeleted] = React.useState(
                        downloadItem.isDeleted
                      );

                      if (isDeleted === 'Yes') {
                        return null;
                      }

                      return (
                        <IconButton
                          aria-label={t('downloadStatus.delete', {
                            filename: downloadItem.fileName,
                          })}
                          key="delete"
                          size="small"
                          onClick={() =>
                            adminDownloadDeleted({
                              downloadId: downloadItem.id,
                              deleted: true,
                            })
                          }
                        >
                          <RemoveCircle />
                        </IconButton>
                      );
                    },

                    function ResumeButton({ rowData }: TableActionProps) {
                      const downloadItem = rowData as FormattedDownload;
                      const [isDeleted] = React.useState(
                        downloadItem.isDeleted
                      );

                      if (
                        isDeleted === 'Yes' ||
                        downloadItem.status === t('downloadStatus.complete') ||
                        downloadItem.status === t('downloadStatus.expired') ||
                        downloadItem.status !== t('downloadStatus.paused')
                      ) {
                        return null;
                      }

                      return (
                        <IconButton
                          aria-label={t('downloadStatus.resume', {
                            filename: downloadItem.fileName,
                          })}
                          key="resume"
                          size="small"
                          onClick={() =>
                            adminUpdateDownloadStatus({
                              downloadId: downloadItem.id,
                              status: 'RESTORING',
                            })
                          }
                        >
                          <PlayCircleFilled />
                        </IconButton>
                      );
                    },

                    function PauseButton({ rowData }: TableActionProps) {
                      const downloadItem = rowData as FormattedDownload;
                      const [isDeleted] = React.useState(
                        downloadItem.isDeleted
                      );

                      if (
                        isDeleted === 'Yes' ||
                        downloadItem.status === t('downloadStatus.complete') ||
                        downloadItem.status === t('downloadStatus.expired') ||
                        downloadItem.status === t('downloadStatus.paused')
                      ) {
                        return null;
                      }

                      return (
                        <IconButton
                          aria-label={t('downloadStatus.pause', {
                            filename: downloadItem.fileName,
                          })}
                          key="pause"
                          size="small"
                          onClick={() =>
                            adminUpdateDownloadStatus({
                              downloadId: downloadItem.id,
                              status: 'PAUSED',
                            })
                          }
                        >
                          <PauseCircleFilled />
                        </IconButton>
                      );
                    },
                  ]}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default AdminDownloadStatusTable;
