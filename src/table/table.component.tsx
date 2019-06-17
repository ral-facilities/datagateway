import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { ColDef } from 'ag-grid-community';
import { EntityType } from '../data/types';
import DateFilter from './dateFilter.component';

interface TableProps {
  columnDefs: ColDef[];
  rowData: EntityType[];
}

const Table = (props: TableProps): React.ReactElement => {
  return (
    <div
      className="ag-theme-material"
      style={{
        height: '500px',
        width: '100%',
      }}
    >
      <AgGridReact
        columnDefs={props.columnDefs}
        rowData={props.rowData}
        defaultColDef={{
          filter: 'agTextColumnFilter',
          filterParams: {
            clearButton: true,
            filterOptions: ['contains'],
          },
          sortable: true,
          icons: {
            menu:
              '<span class="ag-icon ag-icon-filter" unselectable="on"></span>',
          },
        }}
        frameworkComponents={{
          DateFilter: DateFilter,
        }}
      ></AgGridReact>
    </div>
  );
};

export default Table;
