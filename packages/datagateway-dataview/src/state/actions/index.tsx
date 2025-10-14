import {
  loadAccessMethods,
  loadAnonUserName,
  loadFacilityName,
  loadFeatureSwitches,
  loadQueryRetries,
  loadUrls,
} from 'datagateway-common';
import { Action } from 'redux';
import { settings } from '../../settings';
import { ActionType, ThunkResult } from '../app.types';
import {
  BreadcrumbSettings,
  ConfigureBreadcrumbSettingsPayload,
  ConfigureBreadcrumbSettingsType,
  ConfigureFacilityImageSettingPayload,
  ConfigureFacilityImageSettingType,
  ConfigurePluginHostSettingPayload,
  ConfigurePluginHostSettingType,
  SettingsLoadedType,
} from './actions.types';

export const settingsLoaded = (): Action => ({
  type: SettingsLoadedType,
});

export const loadBreadcrumbSettings = (
  breadcrumbSettings: BreadcrumbSettings[]
): ActionType<ConfigureBreadcrumbSettingsPayload> => ({
  type: ConfigureBreadcrumbSettingsType,
  payload: {
    settings: breadcrumbSettings,
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

      if (settingsResult?.['anonUserName'] !== undefined) {
        dispatch(loadAnonUserName(settingsResult['anonUserName']));
      }

      dispatch(
        loadUrls({
          idsUrl: settingsResult['idsUrl'],
          apiUrl: settingsResult['apiUrl'],
          downloadApiUrl: settingsResult['downloadApiUrl'],
          icatUrl: '', // we currently don't need icatUrl in dataview so just pass empty string for now
          doiMinterUrl: settingsResult['doiMinterUrl'],
          dataCiteUrl: settingsResult['dataCiteUrl'],
        })
      );

      if (settingsResult?.['queryRetries'] !== undefined) {
        dispatch(loadQueryRetries(settingsResult['queryRetries']));
      }

      if (settingsResult?.['accessMethods'] !== undefined) {
        dispatch(loadAccessMethods(settingsResult['accessMethods']));
      }

      // Dispatch the action to load the breadcrumb settings (optional settings).
      if (settingsResult?.['breadcrumbs'] !== undefined) {
        dispatch(loadBreadcrumbSettings(settingsResult['breadcrumbs']));
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
