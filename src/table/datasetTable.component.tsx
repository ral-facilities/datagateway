import React from 'react';
import Table, { formatBytes } from './table.component';
import { Column } from 'material-table';
import { Typography } from '@material-ui/core';
import { DatasetData, EntityType } from '../data/types';

const columns: Column[] = [
  { title: 'Name', field: 'name' },
  {
    title: 'Size',
    field: 'size',
    type: 'numeric',
    render: rowData => formatBytes(rowData.size),
    filtering: false,
  },
  { title: 'Create time', field: 'createTime', type: 'datetime' },
  { title: 'Modified time', field: 'modTime', type: 'datetime' },
];

const data: DatasetData[] = [
  {
    name: 'Test 2-1',
    size: 1,
    createTime: new Date('2019-06-10 00:00:00'),
    modTime: new Date('2019-06-10 00:00:00'),
  },
  {
    name: 'Test 2-2',
    size: 9999,
    createTime: new Date('2019-06-10 00:00:00'),
    modTime: new Date('2019-06-10 12:00:00'),
  },
];

const DatasetTable = (): React.ReactElement => {
  return (
    <Table
      columns={columns}
      data={data}
      title="Dataset table"
      detailPanel={(rowData: EntityType) => {
        const datasetData = rowData as DatasetData;
        return (
          <div>
            <Typography>
              <b>Name: </b> {datasetData.name}
            </Typography>
            <Typography>
              <b>Description: </b> {datasetData.name}
            </Typography>
          </div>
        );
      }}
    />
  );
};

export default DatasetTable;
