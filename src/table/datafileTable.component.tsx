import React from 'react';
import Table, { formatBytes } from './table.component';
import { Column } from 'material-table';
import { Typography } from '@material-ui/core';
import GetApp from '@material-ui/icons/GetApp';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import RemoveShoppingCart from '@material-ui/icons/RemoveShoppingCart';
import { DatafileData, EntityType } from '../data/types';

const columns: Column[] = [
  { title: 'Name', field: 'name' },
  { title: 'Location', field: 'location' },
  {
    title: 'File Size',
    field: 'size',
    type: 'numeric',
    render: rowData => formatBytes(rowData.size),
    filtering: false,
  },
  { title: 'Modified time', field: 'modTime', type: 'datetime' },
];

const data: DatafileData[] = [
  {
    name: 'Test 2-2-1',
    location: '/test1',
    size: 500,
    modTime: new Date('2019-06-10 00:00:00'),
  },
  {
    name: 'Test 2-2-2',
    location: '/test2',
    size: 9499,
    modTime: new Date('2019-06-10 12:00:00'),
  },
];

const DatafileTable = (): React.ReactElement => {
  const [cart, setCart] = React.useState<string[]>([]);
  return (
    <Table
      columns={columns}
      data={data}
      title="Datafile table"
      detailPanel={(rowData: EntityType) => {
        const datafileData = rowData as DatafileData;
        return (
          <div>
            <Typography>
              <b>Name: </b> {datafileData.name}
            </Typography>
            <Typography>
              <b>File Size: </b> {formatBytes(datafileData.size)}
            </Typography>
            <Typography>
              <b>Location: </b> {datafileData.location}
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
            alert(`Downloading ${rowData.location}`);
          },
        },
        (rowData: EntityType) => {
          const datafileData = rowData as DatafileData;
          return {
            // eslint-disable-next-line react/display-name
            icon: () => <ShoppingCart />,
            tooltip: 'Add to download cart',
            onClick: (event, clickedRowData: DatafileData) => {
              setCart([...cart, clickedRowData.location]);
              alert(`Added ${clickedRowData.location} to download cart`);
            },
            hidden: cart.includes(datafileData.location),
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
                return value !== clickedRowData.location;
              });
              setCart(filtered);
              alert(`Removed ${clickedRowData.location} from download cart`);
            },
            hidden: !cart.includes(datafileData.location),
          };
        },
      ]}
    />
  );
};

export default DatafileTable;
