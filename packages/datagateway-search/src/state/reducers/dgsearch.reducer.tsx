import { DGSearchState } from '../app.types';
import { createReducer } from 'datagateway-common';
import {
  TogglePayload,
  SetDatasetTabType,
  SetDatafileTabType,
  SetInvestigationTabType,
  SettingsLoadedType,
  CurrentTabPayload,
  SetCurrentTabType,
  ConfigureSelectAllSettingType,
  ConfigureSelectAllSettingPayload,
  ConfigureSearchableEntitiesPayload,
  ConfigureSearchableEntitiesType,
} from '../actions/actions.types';

export const initialState: DGSearchState = {
  tabs: {
    datasetTab: false,
    datafileTab: false,
    investigationTab: false,
    currentTab: 'investigation',
  },
  selectAllSetting: true,
  settingsLoaded: false,
  sideLayout: false,
  searchableEntities: ['investigation', 'dataset', 'datafile'],
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

export function handleSetCurrentTab(
  state: DGSearchState,
  payload: CurrentTabPayload
): DGSearchState {
  return {
    ...state,
    tabs: {
      ...state.tabs,
      currentTab: payload.currentTab,
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

const DGSearchReducer = createReducer(initialState, {
  [SetDatasetTabType]: handleSetDatasetTab,
  [SetDatafileTabType]: handleSetDatafileTab,
  [SetInvestigationTabType]: handleSetInvestigationTab,
  [SettingsLoadedType]: handleSettingsLoaded,
  [SetCurrentTabType]: handleSetCurrentTab,
  [ConfigureSelectAllSettingType]: handleConfigureSelectAllSetting,
  [ConfigureSearchableEntitiesType]: handleConfigureSearchableEntities,
});

export default DGSearchReducer;
