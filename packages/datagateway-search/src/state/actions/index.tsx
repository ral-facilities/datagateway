import { ActionType, ThunkResult } from '../app.types';
import {
  ConfigureSelectAllSettingPayload,
  ConfigureSelectAllSettingType,
  ConfigureSearchableEntitiesPayload,
  ConfigureSearchableEntitiesType,
  SettingsLoadedType,
  ConfigureMaxNumResultsPayload,
  ConfigureMaxNumResultsType,
} from './actions.types';
import { loadUrls, loadFacilityName } from 'datagateway-common';
import { Action } from 'redux';
import axios from 'axios';
import * as log from 'loglevel';
import jsrsasign from 'jsrsasign';
import { settings } from '../../settings';

export const settingsLoaded = (): Action => ({
  type: SettingsLoadedType,
});

export const loadSelectAllSetting = (
  selectAllSetting: boolean
): ActionType<ConfigureSelectAllSettingPayload> => ({
  type: ConfigureSelectAllSettingType,
  payload: {
    settings: selectAllSetting,
  },
});

export const loadSearchableEntitites = (
  entities: string[]
): ActionType<ConfigureSearchableEntitiesPayload> => ({
  type: ConfigureSearchableEntitiesType,
  payload: {
    entities: entities,
  },
});

export const loadMaxNumResults = (
  maxNumResults: number
): ActionType<ConfigureMaxNumResultsPayload> => ({
  type: ConfigureMaxNumResultsType,
  payload: {
    maxNumResults: maxNumResults,
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
          icatUrl: settings['icatUrl'],
        })
      );
    } else {
      throw new Error(
        'One of the URL options (idsUrl, apiUrl, downloadApiUrl, icatUrl) is undefined in settings'
      );
    }

    if ('selectAllSetting' in settings) {
      dispatch(loadSelectAllSetting(settings['selectAllSetting']));
    }

    if ('searchableEntities' in settings) {
      dispatch(loadSearchableEntitites(settings['searchableEntities']));
    }

    if ('maxNumResults' in settings) {
      dispatch(loadMaxNumResults(settings['maxNumResults']));
    }

    /* istanbul ignore if */
    if (process.env.NODE_ENV === `development`) {
      const apiUrl = settings.apiUrl;
      axios
        .post(
          `${settings.icatUrl}/session`,
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
