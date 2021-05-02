import React, { useCallback } from 'react';
import { Grid, IconButton, LinearProgress, Paper } from '@material-ui/core';

import {
  DateColumnFilter,
  Download,
  formatBytes,
  FormattedDownload,
  Order,
  Table,
  TableActionProps,
  TextColumnFilter,
} from 'datagateway-common';

import { useTranslation } from 'react-i18next';
import { IndexRange, TableCellProps } from 'react-virtualized';
import { DownloadSettingsContext } from '../ConfigProvider';
import {
  adminDownloadDeleted,
  adminDownloadStatus,
  fetchAdminDownloads,
} from '../downloadApi';
import {
  PauseCircleFilled,
  PlayCircleFilled,
  RemoveCircle,
  Restore,
} from '@material-ui/icons';

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
  const [dataCount, setDataCount] = React.useState<number>(-1);
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

  const formatDownloads = useCallback(
    (downloads: Download[]) => {
      return downloads.map((download) => {
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
    },
    [t]
  );

  const fetchInitialData = useCallback(() => {
    const queryOffset = buildQueryOffset() + ' LIMIT 0, 50';
    return fetchAdminDownloads(
      {
        facilityName: settings.facilityName,
        downloadApiUrl: settings.downloadApiUrl,
      },
      queryOffset
    ).then((downloads) => {
      const formattedDownloads = formatDownloads(downloads);
      setData([...formattedDownloads]);
    });
  }, [
    buildQueryOffset,
    formatDownloads,
    settings.downloadApiUrl,
    settings.facilityName,
  ]);

  const fetchMoreData = useCallback(
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
        const formattedDownloads = formatDownloads(downloads);
        setData([...data, ...formattedDownloads]);
        setDataLoaded(true);
      });
    },
    [
      buildQueryOffset,
      data,
      formatDownloads,
      settings.downloadApiUrl,
      settings.facilityName,
    ]
  );

  const fetchDataCount = useCallback(() => {
    const queryOffset = buildQueryOffset();
    fetchAdminDownloads(
      {
        facilityName: settings.facilityName,
        downloadApiUrl: settings.downloadApiUrl,
      },
      queryOffset
    ).then((downloads) => {
      setDataCount(downloads.length);
    });
  }, [buildQueryOffset, settings.downloadApiUrl, settings.facilityName]);

  React.useEffect(() => {
    // Clear the current contents, this will make sure
    // there is visually a refresh of the table
    setData([]);

    if (dgDownloadElement) {
      setDataLoaded(false);
      fetchDataCount();
      fetchInitialData();
      setDataLoaded(true);
    }
  }, [
    settings.facilityName,
    settings.downloadApiUrl,
    dgDownloadElement,
    filters,
    sort,
    fetchInitialData,
    fetchDataCount,
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
                cellContentRenderer: (props: TableCellProps) => {
                  if (props.cellData) {
                    const date = new Date(props.cellData).toISOString();
                    return `${date.slice(0, 10)} ${date.slice(11, 19)}`;
                  }
                },
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
            loadMoreRows={fetchMoreData}
            totalRowCount={dataCount}
            actionsWidth={100}
            actions={[
              function RestoreButton({ rowData }: TableActionProps) {
                const downloadItem = rowData as FormattedDownload;
                const [isRestoring, setIsRestoring] = React.useState(
                  downloadItem.status === t('downloadStatus.restoring')
                    ? true
                    : false
                );
                const [isDeleted] = React.useState(downloadItem.isDeleted);

                if (isRestoring && isDeleted === 'No') {
                  return (
                    <IconButton
                      aria-label={t('downloadStatus.pause', {
                        filename: downloadItem.fileName,
                      })}
                      key="pause"
                      size="small"
                      onClick={() => {
                        setIsRestoring(false);
                        setTimeout(
                          () =>
                            adminDownloadStatus(
                              downloadItem.id as number,
                              'PAUSED',
                              {
                                facilityName: settings.facilityName,
                                downloadApiUrl: settings.downloadApiUrl,
                              }
                            )
                              .then(() => {
                                downloadItem.status = t(
                                  'downloadStatus.paused'
                                );
                                setData([...data, downloadItem]);
                              })
                              .catch(() => {
                                setIsRestoring(true);
                              }),
                          100
                        );
                      }}
                    >
                      <PauseCircleFilled />
                    </IconButton>
                  );
                }

                if (
                  !isRestoring &&
                  downloadItem.status === t('downloadStatus.paused') &&
                  isDeleted === 'No'
                ) {
                  return (
                    <IconButton
                      aria-label={t('downloadStatus.resume', {
                        filename: downloadItem.fileName,
                      })}
                      key="resume"
                      size="small"
                      onClick={() => {
                        setIsRestoring(true);
                        setTimeout(
                          () =>
                            adminDownloadStatus(
                              downloadItem.id as number,
                              'RESTORING',
                              {
                                facilityName: settings.facilityName,
                                downloadApiUrl: settings.downloadApiUrl,
                              }
                            )
                              .then(() => {
                                downloadItem.status = t(
                                  'downloadStatus.restoring'
                                );
                                setData([...data, downloadItem]);
                              })
                              .catch(() => {
                                setIsRestoring(false);
                              }),
                          100
                        );
                      }}
                    >
                      <PlayCircleFilled />
                    </IconButton>
                  );
                }

                return (
                  <IconButton
                    aria-label={t('downloadStatus.restore', {
                      filename: downloadItem.fileName,
                    })}
                    key="restore"
                    size="small"
                    onClick={() => {
                      setIsRestoring(true);
                      setTimeout(
                        () =>
                          adminDownloadDeleted(
                            downloadItem.id as number,
                            false,
                            {
                              facilityName: settings.facilityName,
                              downloadApiUrl: settings.downloadApiUrl,
                            }
                          )
                            .then(() => {
                              // Get the new status and isDeleted state of the download item
                              fetchAdminDownloads(
                                {
                                  facilityName: settings.facilityName,
                                  downloadApiUrl: settings.downloadApiUrl,
                                },
                                `WHERE UPPER(download.id) = ${downloadItem.id}`
                              ).then((downloads) => {
                                const formattedDownload = formatDownloads(
                                  downloads
                                )[0];
                                downloadItem.status = formattedDownload.status;
                                downloadItem.isDeleted =
                                  formattedDownload.isDeleted;
                                setData([...data, downloadItem]);

                                if (
                                  downloadItem.status !==
                                  t('downloadStatus.restoring')
                                ) {
                                  setIsRestoring(false);
                                }
                              });
                            })
                            .catch(() => {
                              setIsRestoring(false);
                            }),
                        100
                      );
                    }}
                  >
                    <Restore />
                  </IconButton>
                );
              },

              function DeleteButton({ rowData }: TableActionProps) {
                const downloadItem = rowData as FormattedDownload;
                const [isDeleting, setIsDeleting] = React.useState(false);

                return (
                  <IconButton
                    aria-label={t('downloadStatus.delete', {
                      filename: downloadItem.fileName,
                    })}
                    key="delete"
                    size="small"
                    onClick={() => {
                      setIsDeleting(true);
                      setTimeout(
                        () =>
                          adminDownloadDeleted(
                            downloadItem.id as number,
                            true,
                            {
                              facilityName: settings.facilityName,
                              downloadApiUrl: settings.downloadApiUrl,
                            }
                          )
                            .then(() => {
                              downloadItem.isDeleted = 'Yes';
                              setData([...data, downloadItem]);
                            })
                            .finally(() => {
                              setIsDeleting(false);
                            }),
                        100
                      );
                    }}
                  >
                    <RemoveCircle color={isDeleting ? 'error' : 'inherit'} />
                  </IconButton>
                );
              },
            ]}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminDownloadStatusTable;
