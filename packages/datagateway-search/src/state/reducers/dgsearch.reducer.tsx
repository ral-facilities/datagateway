import { DGSearchState } from '../app.types';
import { createReducer } from 'datagateway-common';
import {
  TogglePayload,
  SetDatasetTabType,
  SetDatafileTabType,
  SetInvestigationTabType,
  SettingsLoadedType,
  ConfigureSelectAllSettingType,
  ConfigureSelectAllSettingPayload,
  ConfigureSearchableEntitiesPayload,
  ConfigureSearchableEntitiesType,
  ConfigureMaxNumResultsPayload,
  ConfigureMaxNumResultsType,
} from '../actions/actions.types';

export const initialState: DGSearchState = {
  tabs: {
    datasetTab: false,
    datafileTab: false,
    investigationTab: false,
  },
  selectAllSetting: true,
  settingsLoaded: false,
  sideLayout: false,
  searchableEntities: ['investigation', 'dataset', 'datafile'],
  minNumResults: 10,
  maxNumResults: 100,
};

export function handleSettingsLoaded(state: DGSearchState): DGSearchState {
  return {
    ...state,
    settingsLoaded: true,
  };
}

export function handleSetDatasetTab(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    tabs: {
      ...state.tabs,
      datasetTab: payload.toggleOption,
    },
  };
}

export function handleSetDatafileTab(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    tabs: {
      ...state.tabs,
      datafileTab: payload.toggleOption,
    },
  };
}

export function handleSetInvestigationTab(
  state: DGSearchState,
  payload: TogglePayload
): DGSearchState {
  return {
    ...state,
    tabs: {
      ...state.tabs,
      investigationTab: payload.toggleOption,
    },
  };
}

export function handleConfigureSelectAllSetting(
  state: DGSearchState,
  payload: ConfigureSelectAllSettingPayload
): DGSearchState {
  return {
    ...state,
    selectAllSetting: payload.settings,
  };
}

export function handleConfigureSearchableEntities(
  state: DGSearchState,
  payload: ConfigureSearchableEntitiesPayload
): DGSearchState {
  return {
    ...state,
    searchableEntities: payload.entities,
  };
}

export function handleConfigureMaxNumResults(
  state: DGSearchState,
  payload: ConfigureMaxNumResultsPayload
): DGSearchState {
  return {
    ...state,
    maxNumResults: payload.maxNumResults,
  };
}

const DGSearchReducer = createReducer(initialState, {
  [SetDatasetTabType]: handleSetDatasetTab,
  [SetDatafileTabType]: handleSetDatafileTab,
  [SetInvestigationTabType]: handleSetInvestigationTab,
  [SettingsLoadedType]: handleSettingsLoaded,
  [ConfigureSelectAllSettingType]: handleConfigureSelectAllSetting,
  [ConfigureSearchableEntitiesType]: handleConfigureSearchableEntities,
  [ConfigureMaxNumResultsType]: handleConfigureMaxNumResults,
});

export default DGSearchReducer;
