// Uncomment to use App to test components
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';

import { StateType } from './state/app.types';

export * from './app.types';
export { default as Preloader } from './preloader/preloader.component';
export * from './state/actions/actions.types';

export { default as Table } from './table/table.component';
export * from './table/table.component';
export { default as DetailsPanelRow } from './table/rowRenderers/detailsPanelRow.component';
export { default as DataHeader } from './table/headerRenderers/dataHeader.component';
export {
  default as TextColumnFilter,
  useTextFilter,
  usePrincipalExperimenterFilter,
} from './table/columnFilters/textColumnFilter.component';
export {
  default as DateColumnFilter,
  useDateFilter,
} from './table/columnFilters/dateColumnFilter.component';
export { default as ActionCell } from './table/cellRenderers/actionCell.component';
export { default as DataCell } from './table/cellRenderers/dataCell.component';
export { default as ExpandCell } from './table/cellRenderers/expandCell.component';
export * from './table/cellRenderers/cellContentRenderers';

export { default as CardView } from './card/cardView.component';
export type {
  CardViewDetails,
  CVFilterInfo,
  CVSelectedFilter,
  CVCustomFilters,
} from './card/cardView.component';
export { default as AdvancedFilter } from './card/advancedFilter.component';

export * from './state/actions/index';
export * from './state/middleware/dgcommon.middleware';
export * from './state/app.types';
export * from './api/index';

export { default as DGCommonMiddleware } from './state/middleware/dgcommon.middleware';
export { default as createReducer } from './state/reducers/createReducer';
export {
  default as dGCommonReducer,
  initialState as dGCommonInitialState,
} from './state/reducers/dgcommon.reducer';

export type DGCommonState = StateType;

export * from './parseTokens';
export { default as handleICATError } from './handleICATError';
export * from './api/retryICATErrors';

export {
  default as ArrowTooltip,
  getTooltipText,
} from './arrowtooltip.component';
export { default as Sticky } from './sticky.component';
export { default as DGThemeProvider } from './dgThemeProvider.component';
export { default as Mark } from './mark.component';
export * from './queryClientSettingsUpdater.component';

export { default as HomePage } from './homePage/homePage.component';

export { default as AddToCartButton } from './views/addToCartButton.component';
export { default as ViewCartButton } from './views/viewCartButton.component';
export type { CartProps } from './views/viewCartButton.component';
export { default as ViewButton } from './views/viewButton.component';
export { default as ClearFiltersButton } from './views/clearFiltersButton.component';
export { default as DownloadButton } from './views/downloadButton.component';
export { default as SelectionAlert } from './views/selectionAlert.component';

export { default as DialogContent } from './downloadConfirmation/dialogContent.component';
export { default as DialogTitle } from './downloadConfirmation/dialogTitle.component';
export { default as DownloadConfirmDialog } from './downloadConfirmation/downloadConfirmDialog.component';

export { default as ISISDatafileDetailsPanel } from './detailsPanels/isis/datafileDetailsPanel.component';
export { default as ISISDatasetDetailsPanel } from './detailsPanels/isis/datasetDetailsPanel.component';
export { default as ISISInstrumentDetailsPanel } from './detailsPanels/isis/instrumentDetailsPanel.component';
export { default as ISISInvestigationDetailsPanel } from './detailsPanels/isis/investigationDetailsPanel.component';
export { default as DLSDatafileDetailsPanel } from './detailsPanels/dls/datafileDetailsPanel.component';
export { default as DLSDatasetDetailsPanel } from './detailsPanels/dls/datasetDetailsPanel.component';
export { default as DLSVisitDetailsPanel } from './detailsPanels/dls/visitDetailsPanel.component';
export { default as InvestigationDetailsPanel } from './detailsPanels/investigationDetailsPanel.component';
export { default as DatasetDetailsPanel } from './detailsPanels/datasetDetailsPanel.component';
export { default as DatafileDetailsPanel } from './detailsPanels/datafileDetailsPanel.component';

export * from './urlBuilders';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<App />);
