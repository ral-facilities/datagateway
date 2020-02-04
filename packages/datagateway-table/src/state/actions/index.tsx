import { ActionType, ThunkResult, ApplicationStrings } from '../app.types';
import {
  ConfigureStringsType,
  ConfigureStringsPayload,
  FeatureSwitches,
  FeatureSwitchesPayload,
  ConfigureFeatureSwitchesType,
  BreadcrumbSettings,
  ConfigureBreadcrumbSettingsPayload,
  ConfigureBreadcrumbSettingsType,
  SettingsLoadedType,
} from './actions.types';
import {
  ConfigureFacilityNamePayload,
  ConfigureFacilityNameType,
  URLs,
  ConfigureUrlsPayload,
  ConfigureURLsType,
} from 'datagateway-common';
import { fetchDownloadCart } from 'datagateway-common';
import { Action } from 'redux';
import axios from 'axios';
import * as log from 'loglevel';

export const settingsLoaded = (): Action => ({
  type: SettingsLoadedType,
});

export const configureStrings = (
  appStrings: ApplicationStrings
): ActionType<ConfigureStringsPayload> => ({
  type: ConfigureStringsType,
  payload: {
    res: appStrings,
  },
});

export const loadStrings = (path: string): ThunkResult<Promise<void>> => {
  return async dispatch => {
    await axios
      .get(path)
      .then(res => {
        dispatch(configureStrings(res.data));
      })
      .catch(error =>
        log.error(`Failed to read strings from ${path}: ${error}`)
      );
  };
};

export const loadFacilityName = (
  name: string
): ActionType<ConfigureFacilityNamePayload> => ({
  type: ConfigureFacilityNameType,
  payload: {
    facilityName: name,
  },
});

export const loadFeatureSwitches = (
  featureSwitches: FeatureSwitches
): ActionType<FeatureSwitchesPayload> => ({
  type: ConfigureFeatureSwitchesType,
  payload: {
    switches: featureSwitches,
  },
});

export const loadUrls = (urls: URLs): ActionType<ConfigureUrlsPayload> => ({
  type: ConfigureURLsType,
  payload: {
    urls,
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

export const configureApp = (): ThunkResult<Promise<void>> => {
  return async dispatch => {
    await axios
      .get('/datagateway-table-settings.json')
      .then(res => {
        const settings = res.data;

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

        /* istanbul ignore if */
        if (process.env.NODE_ENV === `development`) {
          // TODO: get info from correct places when authorisation is sorted out in parent app
          axios
            .post(`${settings['apiUrl']}/sessions`, {
              username: 'user',
              password: 'password',
            })
            .then(response => {
              window.localStorage.setItem(
                'daaas:token',
                response.data.sessionID
              );
            })
            .catch(error => {
              log.error(`Can't contact API: ${error.message}`);
            });

          // TODO: replace with getting from daaas:token when supported
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
            .then(response => {
              window.localStorage.setItem(
                'icat:token',
                response.data.sessionId
              );
            })
            .catch(error => log.error("Can't log in to ICAT"));
        }

        if ('ui-strings' in settings) {
          const uiStringResourcesPath = !settings['ui-strings'].startsWith('/')
            ? '/' + settings['ui-strings']
            : settings['ui-strings'];
          dispatch(loadStrings(uiStringResourcesPath));
        }

        // fetch initial download cart
        dispatch(fetchDownloadCart());

        dispatch(settingsLoaded());
      })
      .catch(error => {
        log.error(
          `Error loading datagateway-table-settings.json: ${error.message}`
        );
      });
  };
};
