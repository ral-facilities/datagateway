import { createReducer } from 'datagateway-common';
import {
  datafilePreviewerInitialState,
  datafilePreviewerReducer,
} from '../../views/datafilePreview/state/reducer';
import {
  ConfigureBreadcrumbSettingsPayload,
  ConfigureBreadcrumbSettingsType,
  ConfigureFacilityImageSettingPayload,
  ConfigureFacilityImageSettingType,
  ConfigurePIRoleSettingPayload,
  ConfigurePIRoleSettingType,
  ConfigurePluginHostSettingPayload,
  ConfigurePluginHostSettingType,
  SettingsLoadedType,
} from '../actions/actions.types';
import { DGDataViewState } from '../app.types';

export const initialState: DGDataViewState = {
  breadcrumbSettings: [],
  settingsLoaded: false,
  pluginHost: '',
  facilityImageURL: '',
  datafilePreviewer: datafilePreviewerInitialState,
  PIRole: 'PI',
};

export function handleSettingsLoaded(state: DGDataViewState): DGDataViewState {
  return {
    ...state,
    settingsLoaded: true,
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

export function handleConfigurePIRoleSetting(
  state: DGDataViewState,
  payload: ConfigurePIRoleSettingPayload
): DGDataViewState {
  return {
    ...state,
    PIRole: payload.settings,
  };
}

const DGDataViewReducer = createReducer(initialState, {
  [SettingsLoadedType]: handleSettingsLoaded,
  [ConfigureBreadcrumbSettingsType]: handleConfigureBreadcrumbSettings,
  [ConfigurePluginHostSettingType]: handleConfigurePluginHostSetting,
  [ConfigureFacilityImageSettingType]: handleConfigureFacilityImageSetting,
  [ConfigurePIRoleSettingType]: handleConfigurePIRoleSetting,
  ...datafilePreviewerReducer,
});

export default DGDataViewReducer;
