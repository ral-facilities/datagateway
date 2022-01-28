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
import {
  loadUrls,
  loadFacilityName,
  MicroFrontendToken,
} from 'datagateway-common';
import { Action } from 'redux';
import axios from 'axios';
import * as log from 'loglevel';
import jsrsasign from 'jsrsasign';
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

export const configureApp = (): ThunkResult<void> => {
  return (dispatch) => {
    // invalid settings.json
    if (typeof settings !== 'object') {
      throw Error('Invalid format');
    }

    // Get the facility name from settings.
    if ('facilityName' in settings) {
      dispatch(loadFacilityName(settings['facilityName']));
    } else {
      throw new Error('facilityName is undefined in settings');
    }

    // features is an optional setting
    if ('features' in settings) {
      dispatch(loadFeatureSwitches(settings['features']));
    }

    if (
      'idsUrl' in settings &&
      'apiUrl' in settings &&
      'downloadApiUrl' in settings
    ) {
      dispatch(
        loadUrls({
          idsUrl: settings['idsUrl'],
          apiUrl: settings['apiUrl'],
          downloadApiUrl: settings['downloadApiUrl'],
          icatUrl: '', // we currently don't need icatUrl in dataview so just pass empty string for now
        })
      );
    } else {
      throw new Error(
        'One of the URL options (idsUrl, apiUrl, downloadApiUrl) is undefined in settings'
      );
    }

    // Dispatch the action to load the breadcrumb settings (optional settings).
    if ('breadcrumbs' in settings) {
      dispatch(loadBreadcrumbSettings(settings['breadcrumbs']));
    }

    if ('selectAllSetting' in settings) {
      dispatch(loadSelectAllSetting(settings['selectAllSetting']));
    }

    if ('pluginHost' in settings) {
      dispatch(loadPluginHostSetting(settings['pluginHost']));
    }

    if ('facilityImageURL' in settings) {
      dispatch(loadFacilityImageSetting(settings['facilityImageURL']));
    }

    /* istanbul ignore if */
    if (process.env.NODE_ENV === `development`) {
      const splitUrl = settings.downloadApiUrl.split('/');
      const icatUrl = `${splitUrl
        .slice(0, splitUrl.length - 1)
        .join('/')}/icat`;
      axios
        .post(
          `${icatUrl}/session`,
          `json=${JSON.stringify({
            plugin: 'simple',
            credentials: [{ username: 'root' }, { password: 'pw' }],
          })}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
        .then((response) => {
          axios
            .get(`${settings['apiUrl']}/sessions`, {
              headers: {
                Authorization: `Bearer ${response.data.sessionId}`,
              },
            })
            .then(() => {
              const jwtHeader = { alg: 'HS256', typ: 'JWT' };
              const payload = {
                sessionId: response.data.sessionId,
                username: 'Thomas409',
              };
              const jwt = jsrsasign.KJUR.jws.JWS.sign(
                'HS256',
                jwtHeader,
                payload,
                'shh'
              );

              window.localStorage.setItem(MicroFrontendToken, jwt);
            })
            .catch((error) => {
              log.error(
                `datagateway-api cannot verify ICAT session id: ${error.message}.
                     This is likely caused if datagateway-api is pointing to a
                     different ICAT than the one used by the IDS/TopCAT`
              );
            });
        })
        .catch((error) => log.error(`Can't log in to ICAT: ${error.message}`));
    }

    dispatch(settingsLoaded());
  };
};
