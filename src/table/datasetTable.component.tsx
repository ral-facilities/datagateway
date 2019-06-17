import React from 'react';
import { ColDef } from 'ag-grid-community';
import { datasetDemoData } from '../data/demo';
import Table from './table.component';
import { formatBytes } from '../data/helpers';

const datasetColumnDefs: ColDef[] = [
  {
    headerName: 'Name',
    field: 'NAME',
  },
  {
    headerName: 'Size',
    field: 'SIZE',
    type: 'numericColumn',
    cellRenderer: params => formatBytes(params.value),
  },
  {
    headerName: 'Create Time',
    field: 'CREATE_TIME',
    filter: 'DateFilter',
  },
  {
    headerName: 'Modified Time',
    field: 'MOD_TIME',
    filter: 'DateFilter',
  },
];

const rowData = datasetDemoData;

const DatasetTable = (): React.ReactElement => {
  return <Table columnDefs={datasetColumnDefs} rowData={rowData}></Table>;
};

export default DatasetTable;
