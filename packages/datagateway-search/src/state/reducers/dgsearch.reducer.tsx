import { createReducer } from 'datagateway-common';
import {
  ConfigureMaxNumResultsPayload,
  ConfigureMaxNumResultsType,
  ConfigureMinNumResultsPayload,
  ConfigureMinNumResultsType,
  ConfigureSearchableEntitiesPayload,
  ConfigureSearchableEntitiesType,
  SetDatafileTabType,
  SetDatasetTabType,
  SetInvestigationTabType,
  SettingsLoadedType,
  TogglePayload,
} from '../actions/actions.types';
import { DGSearchState } from '../app.types';

export const initialState: DGSearchState = {
  tabs: {
    datasetTab: false,
    datafileTab: false,
    investigationTab: false,
  },
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

export function handleConfigureMinNumResults(
  state: DGSearchState,
  payload: ConfigureMinNumResultsPayload
): DGSearchState {
  return {
    ...state,
    minNumResults: payload.minNumResults,
  };
}

const DGSearchReducer = createReducer(initialState, {
  [SetDatasetTabType]: handleSetDatasetTab,
  [SetDatafileTabType]: handleSetDatafileTab,
  [SetInvestigationTabType]: handleSetInvestigationTab,
  [SettingsLoadedType]: handleSettingsLoaded,
  [ConfigureSearchableEntitiesType]: handleConfigureSearchableEntities,
  [ConfigureMaxNumResultsType]: handleConfigureMaxNumResults,
  [ConfigureMinNumResultsType]: handleConfigureMinNumResults,
});

export default DGSearchReducer;
