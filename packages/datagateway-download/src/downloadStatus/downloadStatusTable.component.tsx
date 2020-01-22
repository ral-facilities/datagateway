import React from 'react';
import {
  Grid,
  Paper,
  IconButton,
  // Icon
} from '@material-ui/core';

import {
  Table,
  Order,
  Download,
  TextColumnFilter,
  TableActionProps,
  // DownloadCartTableItem,
  // DateColumnFilter,
} from 'datagateway-common';
import { fetchDownloads, downloadDeleted } from './downloadApi';
import { TableCellProps } from 'react-virtualized';
import {
  RemoveCircle,
  // GetApp
} from '@material-ui/icons';

const DownloadStatusTable: React.FC = () => {
  // Sorting columns
  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{ [column: string]: string }>(
    {}
  );

  const [data, setData] = React.useState<Download[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  // TODO: No need for size, fileCount, totalSize?

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
            // TODO: Implement Download and Remove action buttons
            actions={[
              // function DownloadButton({ rowData }: TableActionProps) {
              //   const downloadItem = rowData as Download;
              //   return (
              //     <IconButton
              //       aria-label={`Download ${downloadItem.fileName}`}
              //       key="download"
              //       size="small"

              //       // Download the prepared cart.
              //       // onClick={() => {

              //       // }}
              //     >
              //       <GetApp />
              //     </IconButton>
              //   );
              // },
              function RemoveButton({ rowData }: TableActionProps) {
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
                            // TODO: get the facilityName from config
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
