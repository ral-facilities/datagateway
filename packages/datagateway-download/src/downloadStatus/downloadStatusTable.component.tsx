import React from 'react';
import { Grid, Paper, IconButton } from '@material-ui/core';

import {
  Table,
  Order,
  Download,
  TextColumnFilter,
  TableActionProps,
  DateColumnFilter,
} from 'datagateway-common';
import { fetchDownloads, downloadDeleted } from '../downloadApi';
import { TableCellProps } from 'react-virtualized';
import { RemoveCircle, GetApp } from '@material-ui/icons';
import BlackTooltip from '../tooltip.component';
import { DownloadSettingsContext } from '../ConfigProvider';

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
  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{
    [column: string]: string | { startDate?: string; endDate?: string };
  }>({});
  const [data, setData] = React.useState<Download[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);

  const { refreshTable, setRefreshTable, setLastChecked } = props;

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
        }).then(downloads => {
          setData([...downloads].reverse());
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
  ]);

  const textFilter = (label: string, dataKey: string): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => {
        if (value) {
          setFilters({ ...filters, [dataKey]: value });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
    />
  );

  const availabilityFilter = (
    label: string,
    dataKey: string
  ): React.ReactElement => (
    <TextColumnFilter
      label={label}
      onChange={(value: string) => {
        if (value) {
          // We convert the input value to uppercase to match the table value.
          setFilters({ ...filters, [dataKey]: value.toUpperCase() });
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

  // Handle filtering for both text and date filters.
  const sortedAndFilteredData = React.useMemo(() => {
    const filteredData = data.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        const tableValue = item[key];
        if (tableValue !== undefined && typeof tableValue === 'string') {
          if (typeof value === 'string' && !tableValue.includes(value)) {
            return false;
          } else if (
            typeof value === 'object' &&
            'startDate' in value &&
            'endDate' in value &&
            value.startDate
          ) {
            // Check that the given date is in the range specified by the filter.
            const tableTimestamp = new Date(tableValue).getTime();
            const startTimestamp = new Date(value.startDate).getTime();
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

    function sortDownloadItems(a: Download, b: Download): number {
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

  const getDataUrl = (preparedId: string, fileName: string): string => {
    // Construct a link to download the prepared cart.
    return `${settings.idsUrl}/getData?sessionId=${window.localStorage.getItem(
      'icat:token'
    )}&preparedId=${preparedId}&outname=${fileName}`;
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <Paper style={{ height: 'calc(100vh - 110px)' }}>
          <Table
            columns={[
              {
                label: 'Download Name',
                dataKey: 'fileName',
                filterComponent: textFilter,
              },
              {
                label: 'Access Method',
                dataKey: 'transport',
                filterComponent: textFilter,
              },
              {
                label: 'Availability',
                dataKey: 'status',
                cellContentRenderer: (props: TableCellProps) => {
                  if (props.cellData) {
                    const status: string = props.cellData;
                    return (
                      status.substring(0, 1).toUpperCase() +
                      status.substring(1).toLowerCase()
                    );
                  }
                },
                filterComponent: availabilityFilter,
              },
              {
                label: 'Requested Date',
                dataKey: 'createdAt',
                cellContentRenderer: (props: TableCellProps) => {
                  if (props.cellData) {
                    const date = new Date(props.cellData).toISOString();
                    return `${date.slice(0, 10)} ${date.slice(11, 19)}`;
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
                const downloadItem = rowData as Download;
                const isDownloadable = downloadItem.transport.match(
                  /https|http/
                )
                  ? true
                  : false;

                const [clicked, setClicked] = React.useState(false);
                return (
                  <BlackTooltip
                    title={`Instant download not supported for ${downloadItem.transport} download type`}
                    enterDelay={500}
                    // Disable tooltip for access methods that are not http/https.
                    disableHoverListener={isDownloadable}
                  >
                    <div>
                      {/* Provide a download button and set disabled if instant download is not supported. */}
                      {isDownloadable ? (
                        <IconButton
                          component="a"
                          href={getDataUrl(
                            downloadItem.preparedId,
                            downloadItem.fileName
                          )}
                          target="_blank"
                          aria-label={`Download ${downloadItem.fileName}`}
                          key="download"
                          size="small"
                          onClick={() => {
                            setClicked(true);
                            setTimeout(() => {
                              setClicked(false);
                            }, 100);
                          }}
                        >
                          <GetApp color={clicked ? 'primary' : 'inherit'} />
                        </IconButton>
                      ) : (
                        <IconButton
                          aria-label={`Instant download not supported for ${downloadItem.fileName}`}
                          key="non-downloadable"
                          size="small"
                          // Set the button to be disabled if the transport type is not "https" (cover http?).
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
                const downloadItem = rowData as Download;
                const [isDeleting, setIsDeleting] = React.useState(false);

                return (
                  <IconButton
                    aria-label={`Remove ${downloadItem.fileName} from downloads`}
                    key="remove"
                    size="small"
                    onClick={() => {
                      setIsDeleting(true);
                      setTimeout(
                        () =>
                          downloadDeleted(downloadItem.id, true, {
                            facilityName: settings.facilityName,
                            downloadApiUrl: settings.downloadApiUrl,
                          }).then(() =>
                            setData(
                              data.filter(item => item.id !== downloadItem.id)
                            )
                          ),
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

export default DownloadStatusTable;
