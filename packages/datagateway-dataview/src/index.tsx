import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'custom-event-polyfill';
import 'url-search-params-polyfill';
import './i18n';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import singleSpaReact from 'single-spa-react';
import * as log from 'loglevel';
import {
  MicroFrontendId,
  MicroFrontendToken,
  PluginRoute,
  RegisterRouteType,
} from 'datagateway-common';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import axios from 'axios';
import { DataviewSettings, setSettings } from './settings';

const pluginName = 'datagateway-dataview';

const render = (): void => {
  const el = document.getElementById(pluginName);
  if (el) {
    ReactDOM.render(<App />, document.getElementById(pluginName));
  }
};

function domElementGetter(): HTMLElement {
  // Make sure there is a div for us to render into
  let el = document.getElementById(pluginName);
  if (!el) el = document.createElement('div');

  return el;
}

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  domElementGetter,
});

// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: unknown): Promise<void> {
  return reactLifecycles
    .bootstrap(props)
    .then(() => {
      log.info(`${pluginName} has been successfully bootstrapped`);
    })
    .catch((error: Error) => {
      log.error(`${pluginName} failed whilst bootstrapping: ${error}`);
    });
}

export function mount(props: unknown): Promise<void> {
  return reactLifecycles
    .mount(props)
    .then(() => {
      log.info(`${pluginName} has been successfully mounted`);
    })
    .catch((error: Error) => {
      log.error(`${pluginName} failed whilst mounting: ${error}`);
    });
}

export function unmount(props: unknown): Promise<void> {
  return reactLifecycles
    .unmount(props)
    .then(() => {
      log.info(`${pluginName} has been successfully unmounted`);
    })
    .catch((error: Error) => {
      log.error(`${pluginName} failed whilst unmounting: ${error}`);
    });
}

// only export this for testing
export const fetchSettings = (): Promise<DataviewSettings | void> => {
  const settingsPath = process.env.REACT_APP_DATAVIEW_BUILD_DIRECTORY
    ? process.env.REACT_APP_DATAVIEW_BUILD_DIRECTORY +
      'datagateway-dataview-settings.json'
    : '/datagateway-dataview-settings.json';
  return axios
    .get<DataviewSettings>(settingsPath)
    .then((res) => {
      const settings = res.data;

      // invalid settings.json
      if (typeof settings !== 'object') {
        throw Error('Invalid format');
      }

      // Ensure the facility name exists.
      if (!('facilityName' in settings)) {
        throw new Error('facilityName is undefined in settings');
      }

      // Ensure all API related URLs are present.
      if (
        !(
          'idsUrl' in settings &&
          'apiUrl' in settings &&
          'downloadApiUrl' in settings
        )
      ) {
        throw new Error(
          'One of the URL options (idsUrl, apiUrl, downloadApiUrl) is undefined in settings'
        );
      }

      if (Array.isArray(settings['routes']) && settings['routes'].length) {
        settings['routes'].forEach((route: PluginRoute, index: number) => {
          if ('section' in route && 'link' in route && 'displayName' in route) {
            const registerRouteAction = {
              type: RegisterRouteType,
              payload: {
                section: route['section'],
                link: route['link'],
                plugin: 'datagateway-dataview',
                displayName: route['displayName'],
                order: route['order'] ? route['order'] : 0,
                helpSteps:
                  index === 0 && 'helpSteps' in settings
                    ? settings['helpSteps']
                    : [],
                logoLightMode: settings['pluginHost']
                  ? settings['pluginHost'] + LogoLight
                  : undefined,
                logoDarkMode: settings['pluginHost']
                  ? settings['pluginHost'] + LogoDark
                  : undefined,
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
      return settings;
    })
    .catch((error) => {
      log.error(`Error loading ${settingsPath}: ${error.message}`);
    });
};

const settings = fetchSettings();
setSettings(settings);

if (
  process.env.NODE_ENV === `development` ||
  process.env.REACT_APP_E2E_TESTING
) {
  render();
  log.setDefaultLevel(log.levels.DEBUG);

  if (process.env.NODE_ENV === `development`) {
    settings.then((settingsResult) => {
      if (settingsResult) {
        const splitUrl = settingsResult.downloadApiUrl.split('/');
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
              .get(`${settingsResult['apiUrl']}/sessions`, {
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
          .catch((error) =>
            log.error(`Can't log in to ICAT: ${error.message}`)
          );
      }
    });
  }
} else {
  log.setDefaultLevel(log.levels.ERROR);
}
