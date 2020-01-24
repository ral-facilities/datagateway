import React from 'react';
import {
  Grid,
  Paper,
  IconButton,
  Tooltip,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core';

import {
  Table,
  Order,
  Download,
  TextColumnFilter,
  TableActionProps,
  // DateColumnFilter,
} from 'datagateway-common';
import { fetchDownloads, downloadDeleted } from './downloadApi';
import { TableCellProps } from 'react-virtualized';
import { RemoveCircle, GetApp } from '@material-ui/icons';

const idsUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids';

const useStylesTooltip = makeStyles((theme: Theme) =>
  createStyles({
    tooltip: {
      backgroundColor: theme.palette.common.black,
      fontSize: '0.875rem',
    },
  })
);

const DownloadStatusTable: React.FC = () => {
  const classes = useStylesTooltip();

  // Sorting columns
  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{ [column: string]: string }>(
    {}
  );
  const [data, setData] = React.useState<Download[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);

  React.useEffect(() => {
    // TODO: Fetch downloads for the user.
    // NOTE: facilityName needs to be passed in from a configuration?
    fetchDownloads('LILS').then(downloads => {
      // TODO: Add in availability and a custom DownloadStatusTableItem
      setData(downloads);
      setDataLoaded(true);
    });
  }, []);

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

  // const dateFilter = (label: string, dataKey: string): React.ReactElement => (
  //   <DateColumnFilter
  //     label={label}
  //     onChange={(value: { startDate?: string; endDate?: string } | null) =>
  //       filterTable(dataKey, value)
  //     }
  //   />
  // );

  const sortedAndFilteredData = React.useMemo(() => {
    const filteredData = data.filter(item => {
      for (let [key, value] of Object.entries(filters)) {
        const tableValue = item[key];
        if (
          tableValue === undefined ||
          (typeof tableValue === 'string' && !tableValue.includes(value))
        ) {
          return false;
        }
      }
      return true;
    });

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

  // const getActionButtons = (): React.ComponentType<TableActionProps>[] => {

  //   let statusButtons: React.ComponentType<TableActionProps>[] = [];
  //   // if (downloadItem.transport === 'https') statusButtons.push(DownloadButton);
  //   statusButtons.push(RemoveButton);

  //   return statusButtons;
  // };

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
                // cellContentRenderer: (props: TableCellProps) => {
                //   if (props.cellData)
                //     return new Date(props.cellData).toDateString();
                // },
                // filterComponent: dateFilter,
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
                  <Tooltip
                    title={`Instant download not supported for ${downloadItem.transport} download type`}
                    classes={classes}
                    enterDelay={500}
                    disableHoverListener={!downloadable}
                  >
                    <span>
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
                    </span>
                  </Tooltip>
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
                            // TODO: get the facilityName from config.
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
