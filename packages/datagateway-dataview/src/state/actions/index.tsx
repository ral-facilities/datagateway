import { ActionType, ThunkResult } from '../app.types';
import {
  FeatureSwitches,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  BreadcrumbSettings,
  ConfigureBreadcrumbSettingsPayload,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
  ConfigureSelectAllSettingPayload,
  ConfigureSelectAllSettingType,
  ConfigurePluginHostSettingPayload,
  ConfigurePluginHostSettingType,
  ConfigureFacilityImageSettingPayload,
  ConfigureFacilityImageSettingType,
} from './actions.types';
import { loadUrls, loadFacilityName } from 'datagateway-common';
import { Action } from 'redux';
import { settings } from '../../settings';

export const settingsLoaded = (): Action => ({
  type: SettingsLoadedType,
});

export const loadFeatureSwitches = (
  featureSwitches: FeatureSwitches
): ActionType<FeatureSwitchesPayload> => ({
  type: ConfigureFeatureSwitchesType,
  payload: {
    switches: featureSwitches,
  },
});

export const loadBreadcrumbSettings = (
  breadcrumbSettings: BreadcrumbSettings
): ActionType<ConfigureBreadcrumbSettingsPayload> => ({
  type: ConfigureBreadcrumbSettingsType,
  payload: {
    settings: breadcrumbSettings,
  },
});

export const loadSelectAllSetting = (
  selectAllSetting: boolean
): ActionType<ConfigureSelectAllSettingPayload> => ({
  type: ConfigureSelectAllSettingType,
  payload: {
    settings: selectAllSetting,
  },
});

export const loadPluginHostSetting = (
  pluginHostSetting: string
): ActionType<ConfigurePluginHostSettingPayload> => ({
  type: ConfigurePluginHostSettingType,
  payload: {
    settings: pluginHostSetting,
  },
});

export const loadFacilityImageSetting = (
  facilityImageSetting: string
): ActionType<ConfigureFacilityImageSettingPayload> => ({
  type: ConfigureFacilityImageSettingType,
  payload: {
    settings: facilityImageSetting,
  },
});

export const configureApp = (): ThunkResult<Promise<void>> => {
  return async (dispatch) => {
    const settingsResult = await settings;
    if (settingsResult) {
      dispatch(loadFacilityName(settingsResult['facilityName']));

      // features is an optional setting
      if (settingsResult?.['features'] !== undefined) {
        dispatch(loadFeatureSwitches(settingsResult['features']));
      }

      dispatch(
        loadUrls({
          idsUrl: settingsResult['idsUrl'],
          apiUrl: settingsResult['apiUrl'],
          downloadApiUrl: settingsResult['downloadApiUrl'],
          icatUrl: '', // we currently don't need icatUrl in dataview so just pass empty string for now
        })
      );

      // Dispatch the action to load the breadcrumb settings (optional settings).
      if (settingsResult?.['breadcrumbs'] !== undefined) {
        dispatch(loadBreadcrumbSettings(settingsResult['breadcrumbs']));
      }

      if (settingsResult?.['selectAllSetting'] !== undefined) {
        dispatch(loadSelectAllSetting(settingsResult['selectAllSetting']));
      }

      if (settingsResult?.['pluginHost'] !== undefined) {
        dispatch(loadPluginHostSetting(settingsResult['pluginHost']));
      }

      if (settingsResult?.['facilityImageURL'] !== undefined) {
        dispatch(loadFacilityImageSetting(settingsResult['facilityImageURL']));
      }

      dispatch(settingsLoaded());
    }
  };
};
