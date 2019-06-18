import React from 'react';
import { ColDef } from 'ag-grid-community';
import Table from './table.component';
import { formatBytes } from '../data/helpers';
import axios from 'axios';
import { DatafileData } from '../data/types';

const datafileColumnDefs: ColDef[] = [
  {
    headerName: 'Name',
    field: 'NAME',
  },
  {
    headerName: 'Size',
    field: 'SIZE',
    type: 'numericColumn',
    valueFormatter: params => formatBytes(params.value),
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

interface DatafileTableProps {
  datasetId: string;
}

const DatafileTable = (props: DatafileTableProps): React.ReactElement => {
  const [data, setData] = React.useState<DatafileData[]>([]);

  React.useEffect(() => {
    axios
      .get(
        `/datafiles?filter={"where": {"DATASET_ID": "${props.datasetId}"}}`,
        {
          headers: {
            Authorization: window.localStorage.getItem('daaas:token'),
          },
        }
      )
      .then(response => {
        let formattedData = response.data.map((data: DatafileData) => ({
          ...data,
          MOD_TIME: new Date(data.MOD_TIME),
        }));
        setData(formattedData);
      });
  }, [props.datasetId]);

  return <Table columnDefs={datafileColumnDefs} rowData={data}></Table>;
};

export default DatafileTable;
