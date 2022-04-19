import React from 'react';
import { Grid, Paper, IconButton, LinearProgress } from '@material-ui/core';

import {
  Table,
  Order,
  FormattedDownload,
  TextColumnFilter,
  TableActionProps,
  DateColumnFilter,
  DateFilter,
  TextFilter,
} from 'datagateway-common';
import { fetchDownloads, downloadDeleted, getDataUrl } from '../downloadApi';
import { TableCellProps } from 'react-virtualized';
import { RemoveCircle, GetApp } from '@material-ui/icons';
import BlackTooltip from '../tooltip.component';
import { DownloadSettingsContext } from '../ConfigProvider';
import { useTranslation } from 'react-i18next';
import { toDate } from 'date-fns-tz';
import { format } from 'date-fns';

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
  const [data, setData] = React.useState<FormattedDownload[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);

  const { refreshTable, setRefreshTable, setLastChecked } = props;
  const [t] = useTranslation();

  const dgDownloadElement = document.getElementById('datagateway-download');

  React.useEffect(() => {
    if (!dataLoaded || refreshTable) {
      // Clear the current contents, this will make sure
      // there is visually a refresh of the table.
      setData([]);

      // Handle a refresh of the table.
      if (refreshTable && dataLoaded) {
        setDataLoaded(false);
        setRefreshTable(false);
      }

      if (!dataLoaded && dgDownloadElement) {
        fetchDownloads({
          facilityName: settings.facilityName,
          downloadApiUrl: settings.downloadApiUrl,
        }).then((downloads) => {
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
              status: formattedStatus,
              isDeleted: formattedIsDeleted,
            };
          });
          setData([...formattedDownloads].reverse());
          setDataLoaded(true);

          // Set the time at which we set the download data.
          setLastChecked();
        });
      }
    }
  }, [
    dataLoaded,
    refreshTable,
    setRefreshTable,
    setLastChecked,
    settings.facilityName,
    settings.downloadApiUrl,
    dgDownloadElement,
    t,
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
    />
  );

  // Handle filtering for both text and date filters.
  const sortedAndFilteredData = React.useMemo(() => {
    const filteredData = data.filter((item) => {
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
              ? new Date(`${value.endDate} 23:59:59`).getTime()
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
  }, [data, sort, filters]);

  return (
    <Grid container direction="column">
      {/* Show loading progress if data is still being loaded */}
      {!dataLoaded && (
        <Grid item xs={12}>
          <LinearProgress color="secondary" />
        </Grid>
      )}
      <Grid item>
        {/* Table should take up page but leave room for: SG appbar, SG footer,
            tabs,table padding, and text above table (respectively). */}
        <Paper
          style={{
            height:
              'calc(100vh - 64px - 36px - 48px - 48px - (1.75rem + 40px))',
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
            loading={!dataLoaded}
            // Pass in a custom actions column width to fit both buttons.
            actionsWidth={100}
            actions={[
              function DownloadButton({ rowData }: TableActionProps) {
                const downloadItem = rowData as FormattedDownload;
                const isDownloadable = (downloadItem.transport as string).match(
                  /https|http/
                )
                  ? true
                  : false;

                return (
                  <BlackTooltip
                    title={
                      t('downloadStatus.download_disabled_tooltip', {
                        transport: downloadItem.transport,
                      }) as string
                    }
                    enterDelay={500}
                    // Disable tooltip for access methods that are not http(s).
                    disableHoverListener={isDownloadable}
                  >
                    <div>
                      {/* Provide a download button and set disabled if instant download is not supported. */}
                      {isDownloadable ? (
                        <IconButton
                          component="a"
                          href={getDataUrl(
                            downloadItem.preparedId as string,
                            downloadItem.fileName as string,
                            settings.idsUrl as string
                          )}
                          target="_blank"
                          aria-label={t('downloadStatus.download', {
                            filename: downloadItem.fileName,
                          })}
                          key="download"
                          size="small"
                        >
                          <GetApp />
                        </IconButton>
                      ) : (
                        <IconButton
                          aria-label={t(
                            'downloadStatus.download_disabled_button',
                            {
                              filename: downloadItem.fileName,
                            }
                          )}
                          key="non-downloadable"
                          size="small"
                          // Set the button to be disabled if the transport type is not http(s).
                          disabled={!isDownloadable}
                        >
                          <GetApp />
                        </IconButton>
                      )}
                    </div>
                  </BlackTooltip>
                );
              },

              function RemoveButton({
                rowData,
              }: TableActionProps): JSX.Element {
                const downloadItem = rowData as FormattedDownload;
                const [isDeleting, setIsDeleting] = React.useState(false);

                return (
                  <IconButton
                    aria-label={t('downloadStatus.remove', {
                      filename: downloadItem.fileName,
                    })}
                    key="remove"
                    size="small"
                    onClick={() => {
                      setIsDeleting(true);
                      downloadDeleted(downloadItem.id as number, true, {
                        facilityName: settings.facilityName,
                        downloadApiUrl: settings.downloadApiUrl,
                      }).then(() =>
                        setData(
                          data.filter((item) => item.id !== downloadItem.id)
                        )
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

export default DownloadStatusTable;
