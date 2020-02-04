import { DGTableState } from '../app.types';
import createReducer from './createReducer';
import {
  FeatureSwitchesPayload,
  ConfigureStringsPayload,
  ConfigureStringsType,
  ConfigureFeatureSwitchesType,
  ConfigureBreadcrumbSettingsPayload,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
} from '../actions/actions.types';

export const initialState: DGTableState = {
  facilityName: '',
  features: {},
  breadcrumbSettings: {},
  settingsLoaded: false,
};

export function handleSettingsLoaded(state: DGTableState): DGTableState {
  return {
    ...state,
    settingsLoaded: true,
  };
}

export function handleConfigureStrings(
  state: DGTableState,
  payload: ConfigureStringsPayload
): DGTableState {
  return {
    ...state,
    res: payload.res,
  };
}

export function handleConfigureFeatureSwitches(
  state: DGTableState,
  payload: FeatureSwitchesPayload
): DGTableState {
  return {
    ...state,
    features: payload.switches,
  };
}

// Reducer for the breadcrumb settings action,
// in order to add settings to the Redux state.
export function handleConfigureBreadcrumbSettings(
  state: DGTableState,
  payload: ConfigureBreadcrumbSettingsPayload
): DGTableState {
  return {
    ...state,
    breadcrumbSettings: payload.settings,
  };
}

const DGTableReducer = createReducer(initialState, {
  [SettingsLoadedType]: handleSettingsLoaded,
  [ConfigureStringsType]: handleConfigureStrings,
  [ConfigureFeatureSwitchesType]: handleConfigureFeatureSwitches,
  [ConfigureBreadcrumbSettingsType]: handleConfigureBreadcrumbSettings,
});

export default DGTableReducer;
