import React, { useCallback } from 'react';
import { Grid, IconButton, LinearProgress, Paper } from '@mui/material';

import {
  DateColumnFilter,
  DateFilter,
  FormattedDownload,
  Order,
  Table,
  TableActionProps,
  TextColumnFilter,
  TextFilter,
} from 'datagateway-common';
import { getDataUrl } from '../downloadApi';
import { TableCellProps } from 'react-virtualized';
import { GetApp, RemoveCircle } from '@mui/icons-material';
import BlackTooltip from '../tooltip.component';
import { DownloadSettingsContext } from '../ConfigProvider';
import { useTranslation } from 'react-i18next';
import { toDate } from 'date-fns-tz';
import { format, isAfter, isBefore, isEqual, isWithinInterval } from 'date-fns';
import DownloadProgressIndicator from './downloadProgressIndicator.component';
import { useQueryClient } from 'react-query';
import {
  QueryKey,
  useDownloadOrRestoreDownload,
  useDownloads,
} from '../downloadApiHooks';
import useDownloadFormatter from './hooks/useDownloadFormatter';

interface DownloadStatusTableProps {
  refreshTable: boolean;
  setRefreshTable: (refresh: boolean) => void;
  setLastCheckedTimestamp: (timestamp: number) => void;
}

const DownloadStatusTable: React.FC<DownloadStatusTableProps> = (
  props: DownloadStatusTableProps
) => {
  // Load the settings for use.
  const settings = React.useContext(DownloadSettingsContext);
  const [t] = useTranslation();
  const { formatDownload } = useDownloadFormatter();
  const queryClient = useQueryClient();

  // Sorting columns
  const [sort, setSort] = React.useState<{ [column: string]: Order }>({
    createdAt: 'desc',
  });
  const [filters, setFilters] = React.useState<{
    [column: string]: TextFilter | DateFilter;
  }>({});
  const {
    data: downloads,
    isLoading,
    isFetched,
    refetch: refetchDownloads,
    dataUpdatedAt,
  } = useDownloads({
    select: (data) => data.map(formatDownload),
  });

  const {
    refreshTable: shouldRefreshTable,
    setRefreshTable,
    setLastCheckedTimestamp,
  } = props;

  const refreshTable = useCallback(async () => {
    await Promise.all([
      // mark download progress queries as invalid so that react-query will refetch them as well.
      queryClient.invalidateQueries(QueryKey.DOWNLOAD_PROGRESS),
      refetchDownloads(),
    ]);
    setRefreshTable(false);
  }, [queryClient, refetchDownloads, setRefreshTable]);

  // detect table refresh and refetch data if needed
  React.useEffect(() => {
    if (shouldRefreshTable && isFetched) {
      refreshTable();
    }
  }, [shouldRefreshTable, refreshTable, isFetched]);

  // set table last checked time after fetching downloads
  React.useEffect(() => {
    if (dataUpdatedAt > 0) {
      setLastCheckedTimestamp(dataUpdatedAt);
    }
  }, [dataUpdatedAt, setLastCheckedTimestamp]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: TextFilter | null) => {
        if (value) {
          setFilters({ ...filters, [dataKey]: value });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
      value={filters[dataKey] as TextFilter}
    />
  );

  const availabilityFilter = (
    label: string,
    dataKey: string
  ): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: TextFilter | null) => {
        if (value && typeof value.value === 'string') {
          setFilters({
            ...filters,
            [dataKey]: { value: value.value, type: value.type },
          });
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

  // Handle filtering for both text and date filters.
  const sortedAndFilteredData = React.useMemo(() => {
    // if the list of downloads is unavailable, return an empty array
    if (!downloads) return [];

    const filteredData = downloads.filter((item) => {
      const filterEntries = Object.entries(filters);
      const satisfiedFilters: boolean[] = [];
      for (const [key, filter] of filterEntries) {
        const tableValue = item[key];

        const isTableValueAString =
          tableValue !== undefined && typeof tableValue === 'string';
        if (!isTableValueAString) {
          satisfiedFilters.push(false);
          continue;
        }

        const isTextFilter =
          typeof filter === 'object' &&
          'value' in filter &&
          typeof filter.value === 'string';
        if (isTextFilter) {
          const filterKeyword = (filter.value as string).toLowerCase();

          // use switch statement to ensure TS can detect we cover all cases
          switch (filter.type) {
            case 'include':
              satisfiedFilters.push(
                tableValue.toLowerCase().includes(filterKeyword)
              );
              break;
            case 'exclude':
              satisfiedFilters.push(
                !tableValue.toLowerCase().includes(filterKeyword)
              );
              break;
            case 'exact':
              satisfiedFilters.push(tableValue.toLowerCase() === filterKeyword);
              break;
            default:
              const exhaustiveCheck: never = filter.type;
              throw new Error(`Unhandled text filter type: ${exhaustiveCheck}`);
          }

          continue;
        }

        const isDateFilter =
          typeof filter === 'object' &&
          'startDate' in filter &&
          'endDate' in filter;
        if (isDateFilter) {
          const tableDate = toDate(tableValue.replace(/\[.*]/, ''));
          const startDateFilter = filter.startDate
            ? toDate(filter.startDate)
            : null;
          const endDateFilter = filter.endDate ? toDate(filter.endDate) : null;

          if (startDateFilter && endDateFilter) {
            try {
              satisfiedFilters.push(
                isWithinInterval(tableDate, {
                  start: startDateFilter,
                  end: endDateFilter,
                })
              );
            } catch (e) {
              if (e instanceof RangeError) {
                // isWithinInterval throws with RangeError if startDate > endDate
                // in the date filter we tell the user this is invalid,
                // so handle it there and do nothing here
              } else {
                throw e;
              }
            }

            continue;
          }
          if (startDateFilter) {
            satisfiedFilters.push(
              isEqual(tableDate, startDateFilter) ||
                isAfter(tableDate, startDateFilter)
            );

            continue;
          }
          if (endDateFilter) {
            satisfiedFilters.push(
              isEqual(tableDate, endDateFilter) ||
                isBefore(tableDate, endDateFilter)
            );

            continue;
          }
        }
        satisfiedFilters.push(false);
      }

      return satisfiedFilters.every((value) => value);
    });

    function sortDownloadItems(
      a: FormattedDownload,
      b: FormattedDownload
    ): number {
      for (const [sortColumn, sortDirection] of Object.entries(sort)) {
        const aColumnValue = a[sortColumn];
        const bColumnValue = b[sortColumn];
        if (!aColumnValue || !bColumnValue) return 0;

        if (sortDirection === 'asc') {
          if (aColumnValue > bColumnValue) {
            return 1;
          } else if (aColumnValue < bColumnValue) {
            return -1;
          }
        } else {
          if (aColumnValue > bColumnValue) {
            return -1;
          } else if (aColumnValue < bColumnValue) {
            return 1;
          }
        }
      }
      return 0;
    }

    return filteredData.sort(sortDownloadItems);
  }, [downloads, sort, filters]);

  return (
    <Grid container direction="column">
      {/* Show loading progress if data is still being loaded */}
      {isLoading && (
        <Grid item xs={12}>
          <LinearProgress color="secondary" />
        </Grid>
      )}
      <Grid item>
        {/* Table should take up page but leave room for: SG appbar, SG footer,
            tabs,table padding, loading bar and text above table (respectively). */}
        <Paper
          sx={{
            height: `calc(100vh - 64px - 36px - 48px - 48px${
              isLoading ? ' - 4px' : ''
            } - (1.75rem + 40px))`,
            minHeight: 230,
            overflowX: 'auto',
          }}
        >
          <Table
            columns={[
              {
                label: t('downloadStatus.filename'),
                dataKey: 'fileName',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.transport'),
                dataKey: 'transport',
                filterComponent: textFilter,
              },
              {
                label: t('downloadStatus.status'),
                dataKey: 'formattedStatus',
                filterComponent: availabilityFilter,
              },
              ...(settings.uiFeatures.downloadProgress
                ? [
                    {
                      label: t('downloadStatus.progress'),
                      dataKey: 'progress',
                      disableSort: true,
                      cellContentRenderer: ({ rowData }: TableCellProps) => (
                        <DownloadProgressIndicator
                          download={rowData as FormattedDownload}
                        />
                      ),
                    },
                  ]
                : []),
              {
                label: t('downloadStatus.createdAt'),
                dataKey: 'createdAt',
                cellContentRenderer: (props: TableCellProps) => {
                  if (props.cellData) {
                    const date = toDate(props.cellData.replace(/\[.*]/, ''));
                    return format(date, 'yyyy-MM-dd HH:mm:ss');
                  }
                },
                filterComponent: dateFilter,
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
                shiftDown
                  ? setSort({ ...sort, [column]: order })
                  : setSort({ [column]: order });
              } else {
                const { [column]: order, ...restOfSort } = sort;
                setSort(restOfSort);
              }
            }}
            data={sortedAndFilteredData}
            loading={isLoading}
            // Pass in a custom actions column width to fit both buttons.
            actionsWidth={100}
            actions={[
              function DownloadButton({ rowData }: TableActionProps) {
                const { transport, status, preparedId, fileName, id } =
                  rowData as FormattedDownload;
                const isHTTP = !!transport.match(/https|http/);

                const isComplete =
                  status === 'COMPLETE' && typeof preparedId !== 'undefined';

                const isDownloadable = isHTTP && isComplete;

                return (
                  <BlackTooltip
                    title={
                      !isHTTP
                        ? t<string, string>(
                            'downloadStatus.non_https_download_disabled_tooltip',
                            { transport }
                          )
                        : t<string, string>(
                            'downloadStatus.https_download_disabled_tooltip'
                          )
                    }
                    enterDelay={500}
                    // Disable error tooltip for downloadable HTTP(S) downloads.
                    disableHoverListener={isDownloadable}
                  >
                    {/* Provide a download button and set disabled if instant download is not supported. */}
                    <IconButton
                      {...(isDownloadable
                        ? {
                            component: 'a',
                            href: getDataUrl(
                              preparedId,
                              fileName,
                              settings.idsUrl
                            ),
                            target: '_blank',
                          }
                        : { component: 'button' })}
                      aria-label={t('downloadStatus.download', {
                        filename: fileName,
                      })}
                      key={`download-${id}`}
                      size="small"
                      disabled={!isDownloadable}
                    >
                      <GetApp />
                    </IconButton>
                  </BlackTooltip>
                );
              },

              function RemoveButton({
                rowData,
              }: TableActionProps): JSX.Element {
                const { isLoading: isDeleting, mutate: downloadDeleted } =
                  useDownloadOrRestoreDownload();
                const downloadItem = rowData as FormattedDownload;
                // const [isDeleting, setIsDeleting] = React.useState(false);

                return (
                  <IconButton
                    aria-label={t('downloadStatus.remove', {
                      filename: downloadItem.fileName,
                    })}
                    key="remove"
                    size="small"
                    onClick={() => {
                      downloadDeleted({
                        downloadId: downloadItem.id,
                        deleted: true,
                      });
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

export default DownloadStatusTable;
