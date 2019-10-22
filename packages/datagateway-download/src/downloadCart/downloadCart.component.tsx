import React from 'react';
import {
  Table,
  formatBytes,
  TextColumnFilter,
  Order,
  TableActionProps,
} from 'datagateway-common';
import { IconButton } from '@material-ui/core';
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

  return (
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
  );
};

export default DownloadCart;
