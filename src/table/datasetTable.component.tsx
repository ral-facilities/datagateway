import React from 'react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import Table from './table.component';
import { formatBytes } from '../data/helpers';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DatasetData } from '../data/types';

interface DatasetTableProps {
  investigationId: string;
}

const DatasetTable = (props: DatasetTableProps): React.ReactElement => {
  const datasetColumnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'NAME',
      /* eslint-disable-next-line react/display-name */
      cellRendererFramework: (params: ICellRendererParams) => (
        <Link
          /* eslint-disable-next-line react/prop-types */
          to={`/browse/investigation/${props.investigationId}/dataset/${params.data.ID}/datafile`}
        >
          {params.value}
        </Link>
      ),
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

  const [data, setData] = React.useState<DatasetData[]>([]);

  React.useEffect(() => {
    axios
      .get(
        `/datasets?filter={"where": {"INVESTIGATION_ID": "${props.investigationId}"}}`,
        {
          headers: {
            Authorization: window.localStorage.getItem('daaas:token'),
          },
        }
      )
      .then(response => {
        let formattedData = response.data.map((data: DatasetData) => ({
          ...data,
          MOD_TIME: new Date(data.MOD_TIME),
          CREATE_TIME: new Date(data.CREATE_TIME),
        }));
        setData(formattedData);
      });
  }, [props.investigationId]);

  return <Table columnDefs={datasetColumnDefs} rowData={data}></Table>;
};

export default DatasetTable;
