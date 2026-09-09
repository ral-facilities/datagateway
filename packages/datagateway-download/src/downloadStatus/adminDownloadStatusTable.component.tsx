import {
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import React, { useCallback, useRef } from 'react';

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
  useDownloadTypes,
} from 'datagateway-common';

import PauseCircleFilled from '@mui/icons-material/PauseCircleFilled';
import PlayCircleFilled from '@mui/icons-material/PlayCircleFilled';
import Refresh from '@mui/icons-material/Refresh';
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import Restore from '@mui/icons-material/Restore';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toDate } from 'date-fns-tz';
import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { DownloadSettingsContext } from '../ConfigProvider';
import {
  QueryKeys,
  useAdminDownloadDeleted,
  useAdminDownloads,
  useAdminUpdateDownloadStatus,
} from '../downloadApiHooks';
import BlackTooltip from '../tooltip.component';
import DownloadProgressIndicator from './downloadProgressIndicator.component';
import useDownloadFormatter from './hooks/useDownloadFormatter';

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
    [column: string]: TextFilter | DateFilter;
  }>({});
  const [refreshDownloads, setRefreshDownloads] = React.useState(false);
  const [t] = useTranslation();
  const { formatDownload } = useDownloadFormatter();
  const { downloadStatusLabels: downloadStatuses } = useDownloadFormatter();
  const { mutate: adminDownloadDeleted } = useAdminDownloadDeleted();
  const { mutate: adminUpdateDownloadStatus } = useAdminUpdateDownloadStatus();
  const queryClient = useQueryClient();
  // whether this is component's first render.
  const isFirstRender = useRef(true);

  const {
    data,
    isPending,
    isFetched,
    isRefetching,
    fetchNextPage,
    refetch: refetchDownloads,
    dataUpdatedAt,
  } = useAdminDownloads({
    sort,
    filters,
  });

  const { data: accessMethods } = useDownloadTypes(
    settings.facilityName,
    settings.downloadApiUrl
  );

  const fetchMoreData = useCallback(
    (_offsetParams: IndexRange) => fetchNextPage(),
    [fetchNextPage]
  );

  const refreshTable = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.DOWNLOAD_PROGRESS],
      }),
      refetchDownloads(),
    ]);
    setRefreshDownloads(false);
  }, [queryClient, refetchDownloads]);

  React.useEffect(() => {
    if (refreshDownloads && isFetched) {
      // user requested to refresh table
      refreshTable();
    }
  }, [isFetched, refreshDownloads, refreshTable]);

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
      refetchDownloads({ cancelRefetch: true });
    } else {
      isFirstRender.current = false;
    }
  }, [refetchDownloads, sort, filters]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: TextFilter | null) => {
        if (value) {
          if (dataKey === 'status') {
            const downloadStatus = (
              Object.keys(downloadStatuses) as DownloadStatus[]
            ).find(
              (key) =>
                downloadStatuses[key].toLowerCase() ===
                (value.value as string).toLowerCase()
            );
            if (typeof downloadStatus !== 'undefined') {
              value.value = downloadStatus;
            }

            setFilters({ ...filters, status: value });
          } else {
            setFilters({ ...filters, [dataKey]: value });
          }
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
      value={filters[dataKey] as TextFilter}
    />
  );

  const downloadFilter = (
    label: string,
    dataKey: string
  ): React.ReactElement => (
    <TextField
      fullWidth
      variant="standard"
      color="secondary"
      select
      id={`${dataKey}-filter`}
      label={`${label}?`}
      InputLabelProps={{ 'aria-label': `Filter by ${label}` }}
      value={(filters[dataKey] as TextFilter | null)?.value ?? ''}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 0) {
          setFilters({
            ...filters,
            [dataKey]: { type: 'exact', value: event.target.value },
          });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
    >
      <MenuItem value="">
        <em>Either</em>
      </MenuItem>
      <MenuItem value="true">Yes</MenuItem>
      <MenuItem value="false">No</MenuItem>
    </TextField>
  );

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      onChange={(value: DateFilter | null) => {
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
    () => data?.pages.flatMap((page) => page.map(formatDownload)) ?? [],
    [data?.pages, formatDownload]
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

            {!refreshDownloads && dataUpdatedAt > 0 ? (
              <p style={{ paddingLeft: '10px ' }}>
                <b>{t('downloadTab.last_checked')}: </b>{' '}
                {new Date(dataUpdatedAt).toLocaleString()}
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
            {(isPending || isRefetching) && (
              <Grid item xs={12}>
                <LinearProgress color="secondary" />
              </Grid>
            )}
            <Grid item>
              {/* Table should take up page but leave room for: SG appbar, SG footer,
            tabs, admin header, table padding, text above table, and the LinearProgress above (respectively). */}
              <Paper
                style={{
                  height: `calc(100vh - 64px - 36px - 48px - (3rem * 1.167) - 32px - (1.75rem + 40px)${
                    isPending || isRefetching ? '' : ' - 4px'
                  })`,
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
                      cellContentRenderer: ({ rowData }) =>
                        (rowData as FormattedDownload).formattedStatus,
                    },
                    ...(settings.uiFeatures.downloadProgress
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
                                idsUrl={
                                  accessMethods?.[
                                    (rowData as FormattedDownload).transport
                                  ]?.idsUrl ?? ''
                                }
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
                    },
                    {
                      label: t('downloadStatus.createdAt'),
                      dataKey: 'createdAt',
                      cellContentRenderer: (props: TableCellProps) => {
                        if (props.cellData) {
                          const date = toDate(
                            props.cellData.replace(/\[.*]/, '')
                          );
                          return format(date, 'yyyy-MM-dd HH:mm:ss');
                        }
                      },
                      filterComponent: dateFilter,
                    },
                    {
                      label: t('downloadStatus.deleted'),
                      dataKey: 'isDeleted',
                      filterComponent: downloadFilter,
                      cellContentRenderer: ({ rowData }) =>
                        (rowData as FormattedDownload).formattedIsDeleted,
                    },
                  ]}
                  sort={sort}
                  onSort={(
                    column: string,
                    order: 'desc' | 'asc' | null,
                    _,
                    shiftDown?: boolean
                  ) => {
                    if (order) {
                      if (shiftDown) setSort({ ...sort, [column]: order });
                      else setSort({ [column]: order });
                    } else {
                      const { [column]: order, ...restOfSort } = sort;
                      setSort(restOfSort);
                    }
                  }}
                  data={tableItems}
                  loading={isPending}
                  loadMoreRows={fetchMoreData}
                  totalRowCount={Number.MAX_SAFE_INTEGER}
                  actionsWidth={100}
                  actions={[
                    function RestoreButton({ rowData }: TableActionProps) {
                      const downloadItem = rowData as FormattedDownload;
                      const [isDeleted] = React.useState(
                        downloadItem.isDeleted
                      );

                      if (!isDeleted) {
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

                      if (isDeleted) {
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
                        isDeleted ||
                        downloadItem.status === 'COMPLETE' ||
                        downloadItem.status === 'EXPIRED' ||
                        downloadItem.status !== 'PAUSED'
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
                        isDeleted ||
                        downloadItem.status === 'COMPLETE' ||
                        downloadItem.status === 'EXPIRED' ||
                        downloadItem.status === 'PAUSED'
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
