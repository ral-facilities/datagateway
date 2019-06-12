import React from 'react';
import Table, { formatBytes } from './table.component';
import { Column } from 'material-table';
import { Typography } from '@material-ui/core';
import { InvestigationData, EntityType } from '../data/types';

const columns: Column[] = [
  { title: 'Title', field: 'title' },
  { title: 'Visit Id', field: 'visitId', type: 'numeric' },
  { title: 'RB Number', field: 'rBNumber' },
  { title: 'DOI', field: 'doi' },
  {
    title: 'Size',
    field: 'size',
    type: 'numeric',
    render: rowData => formatBytes(rowData.size),
    filtering: false,
  },
  { title: 'Instrument', field: 'instrument' },
  { title: 'Start Date', field: 'startDate', type: 'date' },
  { title: 'End Date', field: 'endDate', type: 'date' },
];

const data: InvestigationData[] = [
  {
    title: 'Test 1',
    visitId: 1,
    rBNumber: '1',
    doi: 'doi 1',
    size: 1,
    instrument: 'LARMOR',
    startDate: new Date('2019-06-10'),
    endDate: new Date('2019-06-11'),
  },
  {
    title: 'Test 2',
    visitId: 2,
    rBNumber: '2',
    doi: 'doi 2',
    size: 10000,
    instrument: 'LARMOR',
    startDate: new Date('2019-06-10'),
    endDate: new Date('2019-06-12'),
  },
];

const InvestigationTable = (): React.ReactElement => {
  return (
    <Table
      columns={columns}
      data={data}
      title="Investigations table"
      detailPanel={(rowData: EntityType) => {
        const investigationData = rowData as InvestigationData;
        return (
          <div>
            <Typography>
              <b>Proposal: </b> {investigationData.rBNumber}
            </Typography>
            <Typography>
              <b>Title: </b> {investigationData.title}
            </Typography>
            <Typography>
              <b>Start Date: </b> {investigationData.startDate.toDateString()}
            </Typography>
            <Typography>
              <b>End Date: </b> {investigationData.endDate.toDateString()}
            </Typography>
          </div>
        );
      }}
    />
  );
};

export default InvestigationTable;
