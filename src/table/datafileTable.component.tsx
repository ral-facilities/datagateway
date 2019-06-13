import React from 'react';
import Table, { formatBytes } from './table.component';
import { Column, Filter, Query, QueryResult } from 'material-table';
import { Typography } from '@material-ui/core';
import GetApp from '@material-ui/icons/GetApp';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import RemoveShoppingCart from '@material-ui/icons/RemoveShoppingCart';
import { DatafileData, EntityType } from '../data/types';
import axios from 'axios';

const columns: Column[] = [
  { title: 'Name', field: 'NAME' },
  { title: 'Location', field: 'LOCATION' },
  {
    title: 'File Size',
    field: 'SIZE',
    type: 'numeric',
    render: (rowData: DatafileData) => formatBytes(rowData.SIZE),
    filtering: false,
  },
  { title: 'Modified time', field: 'MOD_TIME', type: 'datetime' },
];

// const data: DatafileData[] = [
//   {
//     name: 'Test 2-2-1',
//     location: '/test1',
//     size: 500,
//     modTime: new Date('2019-06-10 00:00:00'),
//   },
//   {
//     name: 'Test 2-2-2',
//     location: '/test2',
//     size: 9499,
//     modTime: new Date('2019-06-10 12:00:00'),
//   },
// ];

interface DatafileTableProps {
  datasetId: string;
}

const DatafileTable = ({
  datasetId,
}: DatafileTableProps): React.ReactElement => {
  const [cart, setCart] = React.useState<string[]>([]);
  return (
    <Table
      columns={columns}
      data={(query: Query): Promise<QueryResult> =>
        // normally we would pass filtering parameters to the server for it to do
        // but for demo purposes we do it manually so we can show off our between
        // date filter
        new Promise((resolve, reject) => {
          axios
            .get(
              `/datafiles?filter={"where": {"DATASET_ID": "${datasetId}"}}`,
              {
                headers: {
                  Authorization: window.localStorage.getItem('daaas:token'),
                },
              }
            )
            .then(response => {
              let filteredData = response.data;
              filteredData.map((data: DatafileData) => ({
                ...data,
                MOD_TIME: new Date(data.MOD_TIME),
              }));
              if (query.filters) {
                query.filters.forEach((filter: Filter) => {
                  const { type, field } = filter.column;
                  if (type === 'numeric') {
                    filteredData = filteredData.filter((row: DatafileData) => {
                      // @ts-ignore
                      const value = row[field];
                      return value + '' === filter.value;
                    });
                  } else if (type === 'date' || type === 'datetime') {
                    filteredData = filteredData.filter((row: DatafileData) => {
                      // @ts-ignore
                      const value = row[field];
                      const startDate = filter.value.startDate;
                      const endDate = filter.value.endDate;

                      if (
                        startDate === 'Invalid Date' ||
                        endDate === 'Invalid Date'
                      ) {
                        return true;
                      }

                      if (startDate & endDate) {
                        return value >= startDate && value <= endDate;
                      } else if (startDate) {
                        return value >= startDate;
                      } else if (endDate) {
                        return value <= endDate;
                      } else {
                        return true;
                      }
                    });
                  } else {
                    filteredData = filteredData.filter((row: DatafileData) => {
                      // @ts-ignore
                      const value = row[field];
                      return (
                        value &&
                        value
                          .toString()
                          .toUpperCase()
                          .includes(filter.value.toUpperCase())
                      );
                    });
                  }
                });
              }
              return filteredData;
            })
            .then(result => {
              resolve({
                data: result,
                page: 1,
                totalCount: result.length,
              });
            });
        })
      }
      title="Datafile table"
      detailPanel={(rowData: EntityType) => {
        const datafileData = rowData as DatafileData;
        return (
          <div>
            <Typography>
              <b>Name: </b> {datafileData.NAME}
            </Typography>
            <Typography>
              <b>File Size: </b> {formatBytes(datafileData.SIZE)}
            </Typography>
            <Typography>
              <b>Location: </b> {datafileData.LOCATION}
            </Typography>
          </div>
        );
      }}
      actions={[
        {
          // eslint-disable-next-line react/display-name
          icon: () => <GetApp />,
          tooltip: 'Download file',
          onClick: (event, rowData) => {
            alert(`Downloading ${rowData.LOCATION}`);
          },
        },
        (rowData: EntityType) => {
          const datafileData = rowData as DatafileData;
          return {
            // eslint-disable-next-line react/display-name
            icon: () => <ShoppingCart />,
            tooltip: 'Add to download cart',
            onClick: (event, clickedRowData: DatafileData) => {
              setCart([...cart, clickedRowData.LOCATION]);
              alert(`Added ${clickedRowData.LOCATION} to download cart`);
            },
            hidden: cart.includes(datafileData.LOCATION),
          };
        },
        (rowData: EntityType) => {
          const datafileData = rowData as DatafileData;
          return {
            // eslint-disable-next-line react/display-name
            icon: () => <RemoveShoppingCart />,
            tooltip: 'Remove from download cart',
            onClick: (event, clickedRowData: DatafileData) => {
              const filtered = cart.filter(value => {
                return value !== clickedRowData.LOCATION;
              });
              setCart(filtered);
              alert(`Removed ${clickedRowData.LOCATION} from download cart`);
            },
            hidden: !cart.includes(datafileData.LOCATION),
          };
        },
      ]}
    />
  );
};

export default DatafileTable;
