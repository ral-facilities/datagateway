import {
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  ConfigureUrlsPayload,
  ConfigureURLsType,
  DlsDatasetDetailsPanelChangeTabPayload,
  DlsDatasetDetailsPanelChangeTabType,
  DlsVisitDetailsPanelChangeTabPayload,
  DlsVisitDetailsPanelChangeTabType,
  IsisDatafileDetailsPanelChangeTabPayload,
  IsisDatafileDetailsPanelChangeTabType,
  IsisDatasetDetailsPanelChangeTabPayload,
  IsisDatasetDetailsPanelChangeTabType,
  IsisInstrumentDetailsPanelChangeTabPayload,
  IsisInstrumentDetailsPanelChangeTabType,
  IsisInvestigationDetailsPanelChangeTabPayload,
  IsisInvestigationDetailsPanelChangeTabType,
} from '../actions/actions.types';
import { DGCommonState } from '../app.types';
import createReducer from './createReducer';

export const initialState: DGCommonState = {
  urls: {
    idsUrl: '',
    apiUrl: '',
    downloadApiUrl: '',
    icatUrl: '',
  },
  facilityName: '',
  isisDatafileDetailsPanel: {},
  isisDatasetDetailsPanel: {},
  isisInstrumentDetailsPanel: {},
  isisInvestigationDetailsPanel: {},
  dlsVisitDetailsPanel: {},
  dlsDatasetDetailsPanel: {},
};

export function handleConfigureFacilityName(
  state: DGCommonState,
  payload: ConfigureFacilityNamePayload
): DGCommonState {
  return {
    ...state,
    facilityName: payload.facilityName,
  };
}

export function handleConfigureUrls(
  state: DGCommonState,
  payload: ConfigureUrlsPayload
): DGCommonState {
  return {
    ...state,
    urls: payload.urls,
  };
}

export function changeIsisDatafileDetailsPanelTab(
  state: DGCommonState,
  payload: IsisDatafileDetailsPanelChangeTabPayload
): DGCommonState {
  return {
    ...state,
    isisDatafileDetailsPanel: {
      ...state.isisDatafileDetailsPanel,
      [payload.datafileId]: {
        ...state.isisDatafileDetailsPanel[payload.datafileId],
        selectedTab: payload.newTab,
      },
    },
  };
}

export function changeIsisDatasetDetailsPanelTab(
  state: DGCommonState,
  payload: IsisDatasetDetailsPanelChangeTabPayload
): DGCommonState {
  return {
    ...state,
    isisDatasetDetailsPanel: {
      ...state.isisDatasetDetailsPanel,
      [payload.datasetId]: {
        ...state.isisDatasetDetailsPanel[payload.datasetId],
        selectedTab: payload.newTab,
      },
    },
  };
}

export function changeIsisInstrumentDetailsPanelTab(
  state: DGCommonState,
  payload: IsisInstrumentDetailsPanelChangeTabPayload
): DGCommonState {
  return {
    ...state,
    isisInstrumentDetailsPanel: {
      ...state.isisInstrumentDetailsPanel,
      [payload.instrumentId]: {
        ...state.isisInstrumentDetailsPanel[payload.instrumentId],
        selectedTab: payload.newTab,
      },
    },
  };
}

export function changeIsisInvestigationDetailsPanelTab(
  state: DGCommonState,
  payload: IsisInvestigationDetailsPanelChangeTabPayload
): DGCommonState {
  return {
    ...state,
    isisInvestigationDetailsPanel: {
      ...state.isisInvestigationDetailsPanel,
      [payload.investigationId]: {
        ...state.isisInvestigationDetailsPanel[payload.investigationId],
        selectedTab: payload.newTab,
      },
    },
  };
}

export function changeDlsDatasetDetailsPanelTab(
  state: DGCommonState,
  payload: DlsDatasetDetailsPanelChangeTabPayload
): DGCommonState {
  return {
    ...state,
    dlsDatasetDetailsPanel: {
      ...state.dlsDatasetDetailsPanel,
      [payload.datasetId]: {
        ...state.dlsDatasetDetailsPanel[payload.datasetId],
        selectedTab: payload.newTab,
      },
    },
  };
}

export function changeDlsVisitDetailsPanelTab(
  state: DGCommonState,
  payload: DlsVisitDetailsPanelChangeTabPayload
): DGCommonState {
  return {
    ...state,
    dlsVisitDetailsPanel: {
      ...state.dlsVisitDetailsPanel,
      [payload.investigationId]: {
        ...state.dlsVisitDetailsPanel[payload.investigationId],
        selectedTab: payload.newTab,
      },
    },
  };
}

const dGCommonReducer = createReducer(initialState, {
  [ConfigureFacilityNameType]: handleConfigureFacilityName,
  [ConfigureURLsType]: handleConfigureUrls,
  [IsisDatafileDetailsPanelChangeTabType]: changeIsisDatafileDetailsPanelTab,
  [IsisDatasetDetailsPanelChangeTabType]: changeIsisDatasetDetailsPanelTab,
  [IsisInstrumentDetailsPanelChangeTabType]:
    changeIsisInstrumentDetailsPanelTab,
  [IsisInvestigationDetailsPanelChangeTabType]:
    changeIsisInvestigationDetailsPanelTab,
  [DlsDatasetDetailsPanelChangeTabType]: changeDlsDatasetDetailsPanelTab,
  [DlsVisitDetailsPanelChangeTabType]: changeDlsVisitDetailsPanelTab,
});

export default dGCommonReducer;
