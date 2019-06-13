import React from 'react';
import Table, { formatBytes } from './table.component';
import { Column, Query, QueryResult, Filter } from 'material-table';
import { Typography } from '@material-ui/core';
import { InvestigationData, EntityType } from '../data/types';
import { Link } from 'react-router-dom';
import axios from 'axios';

const columns: Column[] = [
  {
    title: 'Title',
    field: 'TITLE',
    /* eslint-disable-next-line react/display-name */
    render: (rowData: InvestigationData) => (
      <Link to={`/browse/investigation/${rowData.ID}/dataset`}>
        {rowData.TITLE}
      </Link>
    ),
  },
  { title: 'Visit Id', field: 'VISIT_ID', type: 'numeric' },
  { title: 'RB Number', field: 'RB_NUMBER' },
  { title: 'DOI', field: 'DOI' },
  {
    title: 'Size',
    field: 'SIZE',
    type: 'numeric',
    render: (rowData: InvestigationData) => formatBytes(rowData.SIZE),
    filtering: false,
  },
  { title: 'Instrument', field: 'INSTRUMENT' },
  { title: 'Start Date', field: 'STARTDATE', type: 'date' },
  { title: 'End Date', field: 'STARTDATE', type: 'date' },
];

// const data: InvestigationData[] = [
//   {
//     title: 'Test 1',
//     visitId: 1,
//     rBNumber: '1',
//     doi: 'doi 1',
//     size: 1,
//     instrument: 'LARMOR',
//     startDate: new Date('2019-06-10'),
//     endDate: new Date('2019-06-11'),
//   },
//   {
//     title: 'Test 2',
//     visitId: 2,
//     rBNumber: '2',
//     doi: 'doi 2',
//     size: 10000,
//     instrument: 'LARMOR',
//     startDate: new Date('2019-06-10'),
//     endDate: new Date('2019-06-12'),
//   },
// ];

const InvestigationTable = (): React.ReactElement => {
  return (
    <Table
      columns={columns}
      data={(query: Query): Promise<QueryResult> =>
        // normally we would pass filtering parameters to the server for it to do
        // but for demo purposes we do it manually so we can show off our between
        // date filter
        new Promise((resolve, reject) => {
          axios
            .get('/investigations', {
              headers: {
                Authorization: window.localStorage.getItem('daaas:token'),
              },
            })
            .then(response => {
              let filteredData = response.data;
              filteredData.map((data: InvestigationData) => ({
                ...data,
                STARTDATE: new Date(data.STARTDATE),
                ENDDATE: new Date(data.ENDDATE),
              }));
              if (query.filters) {
                query.filters.forEach((filter: Filter) => {
                  const { type, field } = filter.column;
                  if (type === 'numeric') {
                    filteredData = filteredData.filter(
                      (row: InvestigationData) => {
                        // @ts-ignore
                        const value = row[field];
                        return value + '' === filter.value;
                      }
                    );
                  } else if (type === 'date' || type === 'datetime') {
                    filteredData = filteredData.filter(
                      (row: InvestigationData) => {
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
                      }
                    );
                  } else {
                    filteredData = filteredData.filter(
                      (row: InvestigationData) => {
                        // @ts-ignore
                        const value = row[field];
                        return (
                          value &&
                          value
                            .toString()
                            .toUpperCase()
                            .includes(filter.value.toUpperCase())
                        );
                      }
                    );
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
            })
            .catch(error => reject(error));
        })
      }
      title="Investigations table"
      detailPanel={(rowData: EntityType) => {
        const investigationData = rowData as InvestigationData;
        return (
          <div>
            <Typography>
              <b>Proposal: </b> {investigationData.RB_NUMBER}
            </Typography>
            <Typography>
              <b>Title: </b> {investigationData.TITLE}
            </Typography>
            <Typography>
              <b>Start Date: </b> {investigationData.STARTDATE.toDateString()}
            </Typography>
            <Typography>
              <b>End Date: </b> {investigationData.ENDDATE.toDateString()}
            </Typography>
          </div>
        );
      }}
    />
  );
};

export default InvestigationTable;
