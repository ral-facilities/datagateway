import React from 'react';
import {
  Table,
  formatBytes,
  TextColumnFilter,
  Order,
  TableActionProps,
} from 'datagateway-common';
import { IconButton, Grid, Paper, Typography, Button } from '@material-ui/core';
import { RemoveCircle } from '@material-ui/icons';

export interface DownloadCartTableItem {
  ID: number;
  NAME: string;
  ENTITY_TYPE: string;
  SIZE: number;
  [key: string]: string | number;
}

const DownloadCart: React.FC = () => {
  const [sort, setSort] = React.useState<{ [column: string]: Order }>({});
  const [filters, setFilters] = React.useState<{ [column: string]: string }>(
    {}
  );

  // TODO: work these out via API calls
  const [fileCount, setFileCount] = React.useState<number>(-1);
  const [fileCountMax, setFileCountMax] = React.useState<number>(-1);
  const [totalSize, setTotalSize] = React.useState<number>(-1);
  const [totalSizeMax, setTotalSizeMax] = React.useState<number>(-1);

  // TODO: get from API
  const data: DownloadCartTableItem[] = [
    {
      ID: 1,
      NAME: 'test1',
      ENTITY_TYPE: 'datafile',
      SIZE: 1,
    },
    {
      ID: 2,
      NAME: 'test2',
      ENTITY_TYPE: 'dataset',
      SIZE: 1024,
    },
    {
      ID: 3,
      NAME: 'test3',
      ENTITY_TYPE: 'dataset',
      SIZE: 2048,
    },
  ];

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

    function sortCartItems(
      a: DownloadCartTableItem,
      b: DownloadCartTableItem
    ): number {
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

    return filteredData.sort(sortCartItems);
  }, [data, sort, filters]);

  React.useEffect(() => {
    setFileCount(3);
    setFileCountMax(3);
    setTotalSize(2048 + 1024 + 1);
    setTotalSizeMax(5000);
  }, [setFileCount, setFileCountMax, setTotalSize, setTotalSizeMax]);

  return (
    <Grid container direction="column">
      <Grid item>
        <Paper style={{ height: 'calc(100vh - 150px)' }}>
          <Table
            columns={[
              {
                label: 'Name',
                dataKey: 'NAME',
                filterComponent: textFilter,
              },
              {
                label: 'Type',
                dataKey: 'ENTITY_TYPE',
                filterComponent: textFilter,
              },
              {
                label: 'Size',
                dataKey: 'SIZE',
                cellContentRenderer: props => {
                  return formatBytes(props.cellData);
                },
                disableSort: true,
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
            actions={[
              function removeButton({ rowData }: TableActionProps) {
                return (
                  <IconButton
                    aria-label={`Remove ${rowData.NAME} from cart`}
                    key="remove"
                    size="small"
                    onClick={() => {
                      console.log('remove item!');
                    }}
                  >
                    <RemoveCircle />
                  </IconButton>
                );
              },
            ]}
          />
        </Paper>
      </Grid>
      <Grid
        container
        item
        direction="column"
        alignItems="flex-end"
        justify="space-between"
      >
        <Grid container item direction="column" xs={3}>
          <Typography>
            Number of files: {fileCount !== -1 ? fileCount : 'Calculating...'}
            {fileCountMax !== -1 && ` / ${fileCountMax}`}
          </Typography>
          <Typography>
            Total size:{' '}
            {totalSize !== -1 ? formatBytes(totalSize) : 'Calculating...'}
            {totalSizeMax !== -1 && ` / ${formatBytes(totalSizeMax)}`}
          </Typography>
        </Grid>
        <Grid container item alignItems="center" justify="space-around" xs={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => console.log('remove all items!')}
          >
            Remove All
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => console.log('download the cart!')}
            disabled={
              fileCountMax !== -1 &&
              totalSizeMax !== -1 &&
              (fileCount > fileCountMax || totalSize > totalSizeMax)
            }
          >
            Download Cart
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DownloadCart;
