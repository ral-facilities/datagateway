import React from 'react';
import { ColDef } from 'ag-grid-community';
import { datafileDemoData } from '../data/demo';
import Table from './table.component';
import { formatBytes } from '../data/helpers';

const datafileColumnDefs: ColDef[] = [
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

const rowData = datafileDemoData;

const DatafileTable = (): React.ReactElement => {
  return <Table columnDefs={datafileColumnDefs} rowData={rowData}></Table>;
};

export default DatafileTable;
