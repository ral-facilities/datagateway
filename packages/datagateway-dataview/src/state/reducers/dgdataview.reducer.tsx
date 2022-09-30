import { createReducer } from 'datagateway-common';
import {
  datafilePreviewerInitialState,
  datafilePreviewerReducer,
} from '../../views/datafilePreview/state/reducer';
import { DGDataViewState } from '../app.types';
import {
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  ConfigureBreadcrumbSettingsPayload,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
  ConfigureSelectAllSettingPayload,
  ConfigureSelectAllSettingType,
  ConfigurePluginHostSettingPayload,
  ConfigurePluginHostSettingType,
  ConfigureFacilityImageSettingPayload,
  ConfigureFacilityImageSettingType,
} from '../actions/actions.types';

export const initialState: DGDataViewState = {
  features: {},
  breadcrumbSettings: {},
  settingsLoaded: false,
  selectAllSetting: true,
  pluginHost: '',
  facilityImageURL: '',
  datafilePreviewer: datafilePreviewerInitialState,
};

export function handleSettingsLoaded(state: DGDataViewState): DGDataViewState {
  return {
    ...state,
    settingsLoaded: true,
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

export function handleConfigureSelectAllSetting(
  state: DGDataViewState,
  payload: ConfigureSelectAllSettingPayload
): DGDataViewState {
  return {
    ...state,
    selectAllSetting: payload.settings,
  };
}

export function handleConfigurePluginHostSetting(
  state: DGDataViewState,
  payload: ConfigurePluginHostSettingPayload
): DGDataViewState {
  return {
    ...state,
    pluginHost: payload.settings,
  };
}

export function handleConfigureFacilityImageSetting(
  state: DGDataViewState,
  payload: ConfigureFacilityImageSettingPayload
): DGDataViewState {
  return {
    ...state,
    facilityImageURL: payload.settings,
  };
}

const DGDataViewReducer = createReducer(initialState, {
  [SettingsLoadedType]: handleSettingsLoaded,
  [ConfigureFeatureSwitchesType]: handleConfigureFeatureSwitches,
  [ConfigureBreadcrumbSettingsType]: handleConfigureBreadcrumbSettings,
  [ConfigureSelectAllSettingType]: handleConfigureSelectAllSetting,
  [ConfigurePluginHostSettingType]: handleConfigurePluginHostSetting,
  [ConfigureFacilityImageSettingType]: handleConfigureFacilityImageSetting,
  ...datafilePreviewerReducer,
});

export default DGDataViewReducer;
