import axios from 'axios';
import {
  MicroFrontendId,
  MicroFrontendToken,
  PluginRoute,
  RegisterRouteType,
} from 'datagateway-common';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import jsrsasign from 'jsrsasign';
import log from 'loglevel';
import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './i18n';
import './index.css';
import { SearchSettings, setSettings } from './settings';

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
  ReactDOMClient,
  rootComponent: () => (document.getElementById(pluginName) ? <App /> : null),
  domElementGetter,
});

const render = (): void => {
  const el = document.getElementById(pluginName);
  if (el) {
    const root = ReactDOMClient.createRoot(el);
    root.render(<App />);
  }
};

// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: unknown): Promise<void> {
  return reactLifecycles.bootstrap(props);
}

// only export this for testing
export const fetchSettings = (): Promise<SearchSettings | void> => {
  const settingsPath = import.meta.env.VITE_SEARCH_BUILD_DIRECTORY
    ? import.meta.env.VITE_SEARCH_BUILD_DIRECTORY +
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
                // TODO: when vite 6, explore no-inline w/ pluginHost vs inline as we have to inline in vite 5
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

if (
  import.meta.env.MODE === 'development' ||
  import.meta.env.VITE_BUILD_STANDALONE
) {
  render();
  log.setDefaultLevel(log.levels.DEBUG);

  if (import.meta.env.MODE === 'development') {
    settings.then((settingsResult) => {
      if (settingsResult) {
        const apiUrl = settingsResult.icatUrl;
        axios
          .post(
            `${apiUrl}/session`,
            `json=${JSON.stringify({
              // plugin: 'db',
              // credentials: [{ username: 'dls_sysadmin' }, { password: 'pw' }],
              plugin: 'anon',
              credentials: [{ username: '' }, { password: '' }],
            })}`,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          )
          .then((response) => {
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
