import React from 'react';
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
import { format } from 'date-fns';
import { useDeleteDownload, useDownloads } from '../downloadApiHooks';

interface DownloadStatusTableProps {
  refreshTable: boolean;
  setRefreshTable: (refresh: boolean) => void;
  setLastChecked: () => void;
}

const DownloadStatusTable: React.FC<DownloadStatusTableProps> = (
  props: DownloadStatusTableProps
) => {
  // Load the settings for use.
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
  const { data: downloads, isLoading, isFetched, refetch } = useDownloads();

  const {
    refreshTable: shouldRefreshTable,
    setRefreshTable,
    setLastChecked,
  } = props;
  const [t] = useTranslation();

  const refreshTable = React.useCallback(async () => {
    await refetch();
    setRefreshTable(false);
  }, [refetch, setRefreshTable]);

  // detect table refresh and refetch data if needed
  React.useEffect(() => {
    if (shouldRefreshTable && isFetched) {
      refreshTable();
    }
  }, [shouldRefreshTable, refreshTable, isFetched]);

  // set table last checked time after fetching downloads
  React.useEffect(() => {
    if (isFetched) {
      setLastChecked();
    }
  }, [isFetched, setLastChecked]);

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
      value={filters[dataKey] as TextFilter}
    />
  );

  const availabilityFilter = (
    label: string,
    dataKey: string
  ): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: { value?: string | number; type: string } | null) => {
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
      for (const [key, value] of Object.entries(filters)) {
        const tableValue = item[key];
        if (tableValue !== undefined && typeof tableValue === 'string') {
          if (
            typeof value === 'object' &&
            'value' in value &&
            typeof value.value === 'string' &&
            (value.type === 'include'
              ? !tableValue.toLowerCase().includes(value.value.toLowerCase())
              : tableValue.toLowerCase().includes(value.value.toLowerCase()))
          ) {
            return false;
          } else if (
            typeof value === 'object' &&
            'startDate' in value &&
            'endDate' in value &&
            value.startDate
          ) {
            // Check that the given date is in the range specified by the filter.
            const tableTimestamp = toDate(tableValue).getTime();
            const startTimestamp = toDate(value.startDate).getTime();
            const endTimestamp = value.endDate
              ? new Date(value.endDate).getTime()
              : Date.now();

            if (
              !(
                startTimestamp <= tableTimestamp &&
                tableTimestamp <= endTimestamp
              )
            )
              return false;
          }
        } else {
          return false;
        }
      }
      return true;
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
                dataKey: 'status',
                filterComponent: availabilityFilter,
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
            data={sortedAndFilteredData}
            loading={isLoading}
            // Pass in a custom actions column width to fit both buttons.
            actionsWidth={100}
            actions={[
              function DownloadButton({ rowData }: TableActionProps) {
                const downloadItem = rowData as FormattedDownload;
                const isHTTP = !!downloadItem.transport.match(/https|http/);

                const isComplete =
                  downloadItem.status === t('downloadStatus.complete');

                const isDownloadable = isHTTP && isComplete;

                return (
                  <BlackTooltip
                    title={
                      !isHTTP
                        ? (t(
                            'downloadStatus.non_https_download_disabled_tooltip',
                            { transport: downloadItem.transport }
                            // for some reason it can't infer these types on its own
                          ) as string)
                        : (t(
                            'downloadStatus.https_download_disabled_tooltip'
                          ) as string)
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
                              downloadItem.preparedId,
                              downloadItem.fileName,
                              settings.idsUrl
                            ),
                            target: '_blank',
                          }
                        : { component: 'button' })}
                      aria-label={t('downloadStatus.download', {
                        filename: downloadItem.fileName,
                      })}
                      key={`download-${downloadItem.id}`}
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
                const {
                  isLoading: isDeleting,
                  mutate: deleteDownload,
                } = useDeleteDownload();
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
                      deleteDownload(downloadItem.id);
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
