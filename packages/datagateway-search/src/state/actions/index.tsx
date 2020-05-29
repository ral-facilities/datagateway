import { ActionType, ThunkResult } from '../app.types';
import { ApplicationStrings } from 'datagateway-common/lib/state/app.types';
import {
  ConfigureStringsType,
  ConfigureStringsPayload,
  SettingsLoadedType,
} from './actions.types';
import { loadUrls, loadFacilityName } from 'datagateway-common';
import { Action } from 'redux';
import axios from 'axios';
import * as loglevel from 'loglevel';
import jsrsasign from 'jsrsasign';

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
        loglevel.error(`Failed to read strings from ${path}: ${error}`)
      );
  };
};

export const configureApp = (): ThunkResult<Promise<void>> => {
  return async dispatch => {
    axios
      .get('/datagateway-search-settings.json')
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
        if ('ui-strings' in settings) {
          const uiStringResourcesPath = !settings['ui-strings'].startsWith('/')
            ? '/' + settings['ui-strings']
            : settings['ui-strings'];
          dispatch(loadStrings(uiStringResourcesPath));
        }
        if (process.env.NODE_ENV === `development`) {
          const apiUrl = settings.apiUrl;
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
              axios
                .get(`${apiUrl}/sessions`, {
                  headers: {
                    Authorization: `Bearer ${response.data.sessionId}`,
                  },
                })
                .then(() => {
                  const jwtHeader = { alg: 'HS256', typ: 'JWT' };
                  const payload = {
                    sessionId: response.data.sessionId,
                    username: 'dev',
                  };
                  const jwt = jsrsasign.KJUR.jws.JWS.sign(
                    'HS256',
                    jwtHeader,
                    payload,
                    'shh'
                  );

                  window.localStorage.setItem('scigateway:token', jwt);
                })
                .catch(error => {
                  loglevel.error(
                    `datagateway-api cannot verify ICAT session id: ${error.message}.
                   This is likely caused if datagateway-api is pointing to a
                   different ICAT than the one used by the IDS/TopCAT`
                  );
                });
            })
            .catch(error =>
              loglevel.error(`Can't log in to ICAT: ${error.message}`)
            );
        }
        dispatch(settingsLoaded());
      })
      .catch(error => {
        loglevel.error(
          `Error loading datagateway-search-settings.json: ${error.message}`
        );
      });
  };
};
