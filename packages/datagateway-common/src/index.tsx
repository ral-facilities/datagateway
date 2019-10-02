// Uncomment to use App to test components
// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';

export * from './app.types';

export { default as Table } from './table/table.component';
export * from './table/table.component';
export {
  default as DetailsPanelRow,
} from './table/rowRenderers/detailsPanelRow.component';
export {
  default as DataHeader,
} from './table/headerRenderers/dataHeader.component';
export {
  default as TextColumnFilter,
} from './table/columnFilters/textColumnFilter.component';
export {
  default as ActionCellComponent,
} from './table/cellRenderers/actionCell.component';
export {
  default as DataCellComponent,
} from './table/cellRenderers/dataCell.component';
export {
  default as ExpandCellComponent,
} from './table/cellRenderers/expandCell.component';
export * from './table/cellRenderers/cellContentRenderers';

// ReactDOM.render(<App />, document.getElementById('root'));
