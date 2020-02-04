import React from 'react';
import { Grid, Paper, IconButton } from '@material-ui/core';

import {
  Table,
  Order,
  Download,
  TextColumnFilter,
  TableActionProps,
  DateColumnFilter,
  // DateColumnFilter,
} from 'datagateway-common';
import { fetchDownloads, downloadDeleted } from '../downloadApi';
import { TableCellProps } from 'react-virtualized';
import { RemoveCircle, GetApp } from '@material-ui/icons';
import BlackTooltip from '../tooltip.component';

const idsUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids';

interface DownloadStatusTableProps {
  refreshTable: boolean;
  setRefreshTable: (refresh: boolean) => void;
  setLastChecked: () => void;
}

const DownloadStatusTable: React.FC<DownloadStatusTableProps> = (
  props: DownloadStatusTableProps
) => {
  // Sorting columns
  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{
    // [column: string]: string;
    [column: string]: string | { startDate?: string; endDate?: string };
  }>({});
  const [data, setData] = React.useState<Download[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);

  const { refreshTable, setRefreshTable, setLastChecked } = props;

  console.log('Data loaded: ', dataLoaded);

  React.useEffect(() => {
    if (!dataLoaded || refreshTable) {
      // Clear the current contents, this will make sure
      // there is visually a refresh of the table.
      setData([]);
      setDataLoaded(false);

      // NOTE: facilityName needs to be passed in from a configuration?
      fetchDownloads('LILS').then(downloads => {
        setData(downloads);
        setDataLoaded(true);

        // Set the refresh status to false, so does not refresh unless specified
        // via a click of the refresh button.
        setRefreshTable(false);
        setLastChecked();
      });
    }
  }, [refreshTable, dataLoaded, setLastChecked, setRefreshTable]);

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

  const dateFilter = (label: string, dataKey: string): React.ReactElement => (
    <DateColumnFilter
      label={label}
      onChange={(value: { startDate?: string; endDate?: string } | null) => {
        // filterTable(dataKey, value)
        if (value) {
          setFilters({ ...filters, [dataKey]: value });
        } else {
          const { [dataKey]: value, ...restOfFilters } = filters;
          setFilters(restOfFilters);
        }
      }}
    />
  );

  // TODO: Add in handling for both text and start/end date (for date filtering).
  console.log('Filters: ', filters);
  const sortedAndFilteredData = React.useMemo(() => {
    console.log(data.length);
    const filteredData = data.filter(item => {
      console.log('Current item: ', item);
      for (let [key, value] of Object.entries(filters)) {
        const tableValue = item[key];
        console.log('Current key: ', key);
        console.log('Current table value: ', tableValue);
        console.log('Current value: ', value);

        // Filter for both text and date filters
        if (tableValue !== undefined && typeof tableValue === 'string') {
          if (typeof value === 'string' && !tableValue.includes(value)) {
            return false;
          } else if (
            typeof value === 'object' &&
            'startDate' in value &&
            'endDate' in value &&
            value.startDate
          ) {
            // TODO: Check that the given date is in the range specified by the filter.
            console.log('Object value: ', value);

            const tableTimestamp = new Date(tableValue).getTime();
            console.log('Table timestamp: ', tableTimestamp);

            const startTimestamp = new Date(value.startDate).getTime();
            const endTimestamp = value.endDate
              ? new Date(`${value.endDate} 23:59:59`).getTime()
              : Date.now();
            console.log('Start timestamp: ', startTimestamp);
            console.log('End timestamp: ', endTimestamp);

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

    // TODO: Fix sorting so that the user does not have to click multiple times.
    function sortDownloadItems(a: Download, b: Download): number {
      for (let [sortColumn, sortDirection] of Object.entries(sort)) {
        if (sortDirection === 'asc') {
          if (a[sortColumn] > b[sortColumn]) {
            return 1;
          } else if (a[sortColumn] < b[sortColumn]) {
            return -1;
          }
        } else {
          if (a[sortColumn] > b[sortColumn]) {
            return -1;
          } else if (a[sortColumn] < b[sortColumn]) {
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
                  // TODO: Re-work so we can get the get status of each element?
                  if (props.cellData) {
                    switch (props.cellData) {
                      case 'COMPLETE':
                        return 'Available';

                      case 'RESTORING':
                        return 'Restoring from Tape';

                      case 'PREPARING':
                        return 'Preparing';

                      case 'EXPIRED':
                        return 'Expired';

                      default:
                        return 'N/A';
                    }
                  }
                },
                filterComponent: textFilter,
              },
              {
                label: 'Requested Date',
                dataKey: 'createdAt',
                cellContentRenderer: (props: TableCellProps) => {
                  if (props.cellData) {
                    // return props.cellData.toString().split(' ')[0];
                    const d = new Date(props.cellData);
                    return `${d.getFullYear()}-${(
                      '0' +
                      (d.getMonth() + 1)
                    ).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
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
                const downloadable = downloadItem.transport !== 'https';

                const [clicked, setClicked] = React.useState(false);
                return (
                  <BlackTooltip
                    title={`Instant download not supported for ${downloadItem.transport} download type`}
                    enterDelay={500}
                    disableHoverListener={!downloadable}
                  >
                    <IconButton
                      component="a"
                      // Construct a link to download the prepared cart.
                      href={`${idsUrl}/getData?sessionId=${window.localStorage.getItem(
                        'icat:token'
                      )}&preparedId=${downloadItem.preparedId}&outname=${
                        downloadItem.fileName
                      }`}
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
                      // Set the button to be disabled if the transport type is not "https" (cover http?).
                      disabled={downloadable}
                    >
                      <GetApp color={clicked ? 'primary' : 'inherit'} />
                    </IconButton>
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
                    aria-label={`Remove ${downloadItem.fileName} from cart`}
                    key="remove"
                    size="small"
                    onClick={() => {
                      setIsDeleting(true);
                      setTimeout(
                        () =>
                          downloadDeleted(
                            // TODO: get the facilityName from configuration file
                            'LILS',
                            downloadItem.id,
                            true
                          ).then(() =>
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
