import React from 'react';
import Table, { formatBytes } from './table.component';
import { Column, Query, QueryResult, Filter } from 'material-table';
import { Typography } from '@material-ui/core';
import { DatasetData, EntityType } from '../data/types';
import { Link } from 'react-router-dom';
import axios from 'axios';

// const data: DatasetData[] = [
//   {
//     name: 'Test 2-1',
//     size: 1,
//     createTime: new Date('2019-06-10 00:00:00'),
//     modTime: new Date('2019-06-10 00:00:00'),
//   },
//   {
//     name: 'Test 2-2',
//     size: 9999,
//     createTime: new Date('2019-06-10 00:00:00'),
//     modTime: new Date('2019-06-10 12:00:00'),
//   },
// ];

interface DatasetTableProps {
  investigationId: string;
}

const DatasetTable = ({
  investigationId,
}: DatasetTableProps): React.ReactElement => {
  const columns: Column[] = [
    {
      title: 'Name',
      field: 'NAME',
      /* eslint-disable-next-line react/display-name */
      render: (rowData: DatasetData) => (
        <Link
          to={`/browse/investigation/${investigationId}/dataset/${rowData.ID}/datafile`}
        >
          {rowData.NAME}
        </Link>
      ),
    },
    {
      title: 'Size',
      field: 'SIZE',
      type: 'numeric',
      render: (rowData: DatasetData) => formatBytes(rowData.SIZE),
      filtering: false,
    },
    { title: 'Create time', field: 'CREATE_TIME', type: 'datetime' },
    { title: 'Modified time', field: 'MOD_TIME', type: 'datetime' },
  ];

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
              `/datasets?filter={"where": {"INVESTIGATION_ID": "${investigationId}"}}`,
              {
                headers: {
                  Authorization: window.localStorage.getItem('daaas:token'),
                },
              }
            )
            .then(response => {
              let filteredData = response.data;
              filteredData.map((data: DatasetData) => ({
                ...data,
                MOD_TIME: new Date(data.MOD_TIME),
                CREATE_TIME: new Date(data.CREATE_TIME),
              }));
              if (query.filters) {
                query.filters.forEach((filter: Filter) => {
                  const { type, field } = filter.column;
                  if (type === 'numeric') {
                    filteredData = filteredData.filter((row: DatasetData) => {
                      // @ts-ignore
                      const value = row[field];
                      return value + '' === filter.value;
                    });
                  } else if (type === 'date' || type === 'datetime') {
                    filteredData = filteredData.filter((row: DatasetData) => {
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
                    filteredData = filteredData.filter((row: DatasetData) => {
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
      title="Dataset table"
      detailPanel={(rowData: EntityType) => {
        const datasetData = rowData as DatasetData;
        return (
          <div>
            <Typography>
              <b>Name: </b> {datasetData.NAME}
            </Typography>
            <Typography>
              <b>Description: </b> {datasetData.NAME}
            </Typography>
          </div>
        );
      }}
    />
  );
};

export default DatasetTable;
