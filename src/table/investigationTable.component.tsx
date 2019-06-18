import React from 'react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import Table from './table.component';
import { formatBytes } from '../data/helpers';
import { InvestigationData } from '../data/types';
import axios from 'axios';
import { Link } from 'react-router-dom';

const investigationColumnDefs: ColDef[] = [
  {
    headerName: 'Title',
    field: 'TITLE',
    /* eslint-disable-next-line react/display-name */
    cellRendererFramework: (params: ICellRendererParams) => (
      <Link to={`/browse/investigation/${params.data.ID}/dataset`}>
        {params.value}
      </Link>
    ),
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
    valueFormatter: params => formatBytes(params.value),
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

const InvestigationTable = (): React.ReactElement => {
  const [data, setData] = React.useState<InvestigationData[]>([]);

  React.useEffect(() => {
    axios
      .get('/investigations', {
        headers: {
          Authorization: window.localStorage.getItem('daaas:token'),
        },
      })
      .then(response => {
        let formattedData = response.data.map((data: InvestigationData) => ({
          ...data,
          STARTDATE: new Date(data.STARTDATE),
          ENDDATE: new Date(data.ENDDATE),
        }));
        setData(formattedData);
      });
  }, []);

  return <Table columnDefs={investigationColumnDefs} rowData={data}></Table>;
};

export default InvestigationTable;
