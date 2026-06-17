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
  ConfigureLandingPageLogoSettingPayload,
  ConfigureLandingPageLogoSettingType,
  ConfigureLocalContactRoleSettingPayload,
  ConfigureLocalContactRoleSettingType,
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
  localContactRole: 'local_contact|DataCollector',
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

export function handleConfigureLandingPageLogoSetting(
  state: DGDataViewState,
  payload: ConfigureLandingPageLogoSettingPayload
): DGDataViewState {
  return {
    ...state,
    landingPageLogo: payload.settings,
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

export function handleConfigureLocalContactRoleSetting(
  state: DGDataViewState,
  payload: ConfigureLocalContactRoleSettingPayload
): DGDataViewState {
  return {
    ...state,
    localContactRole: payload.settings,
  };
}

const DGDataViewReducer = createReducer(initialState, {
  [SettingsLoadedType]: handleSettingsLoaded,
  [ConfigureBreadcrumbSettingsType]: handleConfigureBreadcrumbSettings,
  [ConfigurePluginHostSettingType]: handleConfigurePluginHostSetting,
  [ConfigureFacilityImageSettingType]: handleConfigureFacilityImageSetting,
  [ConfigureLandingPageLogoSettingType]: handleConfigureLandingPageLogoSetting,
  [ConfigurePIRoleSettingType]: handleConfigurePIRoleSetting,
  [ConfigureLocalContactRoleSettingType]:
    handleConfigureLocalContactRoleSetting,
  ...datafilePreviewerReducer,
});

export default DGDataViewReducer;
