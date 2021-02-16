import { ThunkResult } from '../app.types';
import { SettingsLoadedType } from './actions.types';
import {
  loadUrls,
  loadFacilityName,
  RegisterRouteType,
  PluginRoute,
  MicroFrontendId,
} from 'datagateway-common';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import { Action } from 'redux';
import axios from 'axios';
import * as log from 'loglevel';
import jsrsasign from 'jsrsasign';

export const settingsLoaded = (): Action => ({
  type: SettingsLoadedType,
});

export const configureApp = (): ThunkResult<Promise<void>> => {
  return async (dispatch) => {
    await axios
      .get('/datagateway-search-settings.json')
      .then((res) => {
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

        if (Array.isArray(settings['routes']) && settings['routes'].length) {
          settings['routes'].forEach((route: PluginRoute, index: number) => {
            if (
              'section' in route &&
              'link' in route &&
              'displayName' in route
            ) {
              const registerRouteAction = {
                type: RegisterRouteType,
                payload: {
                  section: route['section'],
                  link: route['link'],
                  plugin: 'datagateway-search',
                  displayName: '\xa0' + route['displayName'],
                  order: route['order'] ? route['order'] : 0,
                  helpSteps:
                    index === 0 && 'helpSteps' in settings
                      ? settings['helpSteps']
                      : [],
                  logoLightMode: LogoLight,
                  logoDarkMode: LogoDark,
                  logoAltText: 'DataGateway',
                },
              };
              document.dispatchEvent(
                new CustomEvent(MicroFrontendId, {
                  detail: registerRouteAction,
                })
              );
            } else {
              throw new Error(
                'Route provided does not have all the required entries (section, link, displayName)'
              );
            }
          });
        } else {
          throw new Error('No routes provided in the settings');
        }

        /* istanbul ignore if */
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
            .catch((error) =>
              log.error(`Can't log in to ICAT: ${error.message}`)
            );
        }
        dispatch(settingsLoaded());
      })
      .catch((error) => {
        log.error(
          `Error loading datagateway-search-settings.json: ${error.message}`
        );
      });
  };
};
