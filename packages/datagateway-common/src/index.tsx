// Uncomment to use App to test components
// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';
// import './index.css';

import { StateType } from './state/app.types';

export * from './app.types';
export * from './state/actions/actions.types';

export { default as Table } from './table/table.component';
export * from './table/table.component';
export { default as DetailsPanelRow } from './table/rowRenderers/detailsPanelRow.component';
export { default as DataHeader } from './table/headerRenderers/dataHeader.component';
export { default as TextColumnFilter } from './table/columnFilters/textColumnFilter.component';
export { default as DateColumnFilter } from './table/columnFilters/dateColumnFilter.component';
export { default as ActionCellComponent } from './table/cellRenderers/actionCell.component';
export { default as DataCellComponent } from './table/cellRenderers/dataCell.component';
export { default as ExpandCellComponent } from './table/cellRenderers/expandCell.component';
export * from './table/cellRenderers/cellContentRenderers';

export * from './state/actions/index';

export { default as DGCommonMiddleware } from './state/middleware/dgcommon.middleware';
export { default as createReducer } from './state/reducers/createReducer';
export * from './state/middleware/dgcommon.middleware';
export { default as Preloader } from './preloader/preloader.component';
export { initialState as dGCommonInitialState } from './state/reducers/dgcommon.reducer';
export { default as dGCommonReducer } from './state/reducers/dgcommon.reducer';

export type DGCommonState = StateType;

export * from './parseTokens';
export { default as handleICATError } from './handleICATError';

export { default as ArrowTooltip } from './arrowtooltip.component';

// ReactDOM.render(<App />, document.getElementById('root'));
