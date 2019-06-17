import React from 'react';
import { ColDef } from 'ag-grid-community';
import { investigationDemoData } from '../data/demo';
import Table from './table.component';
import { formatBytes } from '../data/helpers';

const investifationColumnDefs: ColDef[] = [
  {
    headerName: 'Title',
    field: 'TITLE',
  },
  {
    headerName: 'Visit ID',
    field: 'VISIT_ID',
    type: 'numericColumn',
  },
  {
    headerName: 'RB Number',
    field: 'RB_NUMBER',
  },
  {
    headerName: 'DOI',
    field: 'DOI',
  },
  {
    headerName: 'Size',
    field: 'SIZE',
    type: 'numericColumn',
    cellRenderer: params => formatBytes(params.value),
  },
  {
    headerName: 'Instrument',
    field: 'INSTRUMENT.NAME',
  },
  {
    headerName: 'Start Date',
    field: 'STARTDATE',
    filter: 'DateFilter',
  },
  {
    headerName: 'End Date',
    field: 'ENDDATE',
    filter: 'DateFilter',
  },
];

const rowData = investigationDemoData;

const InvestigationTable = (): React.ReactElement => {
  return <Table columnDefs={investifationColumnDefs} rowData={rowData}></Table>;
};

export default InvestigationTable;
