import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'custom-event-polyfill';
import 'url-search-params-polyfill';
import './i18n';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as log from 'loglevel';
import singleSpaReact from 'single-spa-react';
import axios from 'axios';
import jsrsasign from 'jsrsasign';
import { SearchSettings, setSettings } from './settings';
import {
  MicroFrontendId,
  MicroFrontendToken,
  PluginRoute,
  RegisterRouteType,
} from 'datagateway-common';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';

const pluginName = 'datagateway-search';

function domElementGetter(): HTMLElement {
  // Make sure there is a div for us to render into
  let el = document.getElementById('datagateway-search');
  if (!el) {
    el = document.createElement('div');
  }

  return el;
}

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  domElementGetter,
});

const render = (): void => {
  const el = document.getElementById(pluginName);
  if (el) {
    ReactDOM.render(<App />, document.getElementById(pluginName));
  }
};

// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: unknown): Promise<void> {
  return reactLifecycles.bootstrap(props);
}

// only export this for testing
export const fetchSettings = (): Promise<SearchSettings | void> => {
  const settingsPath = process.env.REACT_APP_SEARCH_BUILD_DIRECTORY
    ? process.env.REACT_APP_SEARCH_BUILD_DIRECTORY +
      'datagateway-search-settings.json'
    : '/datagateway-search-settings.json';
  return axios
    .get<SearchSettings>(settingsPath)
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
          'downloadApiUrl' in settings &&
          'icatUrl' in settings
        )
      ) {
        throw new Error(
          'One of the URL options (idsUrl, apiUrl, downloadApiUrl, icatUrl) is undefined in settings'
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
                plugin: 'datagateway-search',
                displayName: route['displayName'],
                order: route['order'] ?? 0,
                hideFromMenu: route['hideFromMenu'] ?? false,
                admin: route['admin'] ?? false,
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

export function mount(props: unknown): Promise<void> {
  return reactLifecycles.mount(props);
}

export function unmount(props: unknown): Promise<void> {
  return reactLifecycles.unmount(props);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
if (
  process.env.NODE_ENV === `development` ||
  process.env.REACT_APP_E2E_TESTING
) {
  render();
  log.setDefaultLevel(log.levels.DEBUG);

  if (process.env.NODE_ENV === `development`) {
    settings.then((settingsResult) => {
      if (settingsResult) {
        const dataGatewayUrl = settingsResult.apiUrl;
        axios
          .post(`${dataGatewayUrl}/sessions`, {
            username: 'root',
            password: 'pw',
            mechanism: 'simple',
          })
          .then((response) => {
            const jwtHeader = { alg: 'HS256', typ: 'JWT' };
            const payload = {
              sessionID: response.data.sessionID,
              username: 'dev',
            };
            const jwt = jsrsasign.KJUR.jws.JWS.sign(
              'HS256',
              jwtHeader,
              payload,
              'shh'
            );

            window.localStorage.setItem(MicroFrontendToken, jwt);
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
