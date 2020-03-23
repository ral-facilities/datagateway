import { DGDataViewState } from '../app.types';
import { createReducer } from 'datagateway-common';
import {
  FeatureSwitchesPayload,
  ConfigureStringsPayload,
  ConfigureStringsType,
  ConfigureFeatureSwitchesType,
  ConfigureBreadcrumbSettingsPayload,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
} from '../actions/actions.types';

export const initialState: DGDataViewState = {
  features: {},
  breadcrumbSettings: {},
  settingsLoaded: false,
};

export function handleSettingsLoaded(state: DGDataViewState): DGDataViewState {
  return {
    ...state,
    settingsLoaded: true,
  };
}

export function handleConfigureStrings(
  state: DGDataViewState,
  payload: ConfigureStringsPayload
): DGDataViewState {
  return {
    ...state,
    res: payload.res,
  };
}

export function handleConfigureFeatureSwitches(
  state: DGDataViewState,
  payload: FeatureSwitchesPayload
): DGDataViewState {
  return {
    ...state,
    features: payload.switches,
  };
}

// Reducer for the breadcrumb settings action,
// in order to add settings to the Redux state.
export function handleConfigureBreadcrumbSettings(
  state: DGDataViewState,
  payload: ConfigureBreadcrumbSettingsPayload
): DGDataViewState {
  return {
    ...state,
    breadcrumbSettings: payload.settings,
  };
}

const DGDataViewReducer = createReducer(initialState, {
  [SettingsLoadedType]: handleSettingsLoaded,
  [ConfigureStringsType]: handleConfigureStrings,
  [ConfigureFeatureSwitchesType]: handleConfigureFeatureSwitches,
  [ConfigureBreadcrumbSettingsType]: handleConfigureBreadcrumbSettings,
});

export default DGDataViewReducer;
