import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './i18n';
import App from './App';
import axios from 'axios';
import jsrsasign from 'jsrsasign';
import singleSpaReact from 'single-spa-react';
import {
  MicroFrontendId,
  MicroFrontendToken,
  PluginRoute,
  RegisterRouteType,
} from 'datagateway-common';
import log from 'loglevel';
import { DownloadSettings } from './ConfigProvider';
import { setSettings } from './settings';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';

function domElementGetter(): HTMLElement {
  // Make sure there is a div for us to render into
  let el = document.getElementById('datagateway-download');
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
  const el = document.getElementById('datagateway-download');
  if (el) {
    ReactDOM.render(<App />, document.getElementById('datagateway-download'));
  }
};

// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: unknown): Promise<void> {
  return reactLifecycles.bootstrap(props);
}

export function mount(props: unknown): Promise<void> {
  return reactLifecycles.mount(props);
}

export function unmount(props: unknown): Promise<void> {
  return reactLifecycles.unmount(props);
}

// only export this for testing
export const fetchSettings = (): Promise<DownloadSettings | void> => {
  const settingsPath = process.env.REACT_APP_DOWNLOAD_BUILD_DIRECTORY
    ? process.env.REACT_APP_DOWNLOAD_BUILD_DIRECTORY +
      'datagateway-download-settings.json'
    : '/datagateway-download-settings.json';
  return axios
    .get<DownloadSettings>(settingsPath)
    .then((res) => {
      const settings = res.data;

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

      // Ensure all fileCountMax and totalSizeMax are present.
      if (!('fileCountMax' in settings && 'totalSizeMax' in settings)) {
        throw new Error(
          'fileCountMax or totalSizeMax is undefined in settings'
        );
      }

      // Ensure access methods are present in the configuration.
      if (!('accessMethods' in settings)) {
        throw new Error('accessMethods is undefined in settings');
      } else {
        // Check to ensure at least one access method has been defined.
        if (Object.entries(settings['accessMethods']).length < 1) {
          throw new Error(
            'At least one access method should be defined under accessMethods in settings'
          );
        } else {
          // Check all defined access methods to ensure idsUrl has been stated.
          for (const method in settings['accessMethods']) {
            if (!settings['accessMethods'][method].idsUrl)
              throw new Error(
                `Access method ${method}, defined in settings, does not contain a idsUrl`
              );
          }
        }
      }

      if (!(Array.isArray(settings['routes']) && settings['routes'].length)) {
        throw new Error('No routes provided in the settings');
      } else {
        settings['routes'].forEach((route: PluginRoute) => {
          if (
            !('section' in route && 'link' in route && 'displayName' in route)
          ) {
            throw new Error(
              'Route provided does not have all the required entries (section, link, displayName)'
            );
          }
        });
      }

      settings['routes'].forEach((route: PluginRoute, index: number) => {
        const registerRouteAction = {
          type: RegisterRouteType,
          payload: {
            section: route['section'],
            link: route['link'],
            plugin: 'datagateway-download',
            displayName: route['displayName'],
            admin: route['admin'] ? route['admin'] : false,
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
          new CustomEvent(MicroFrontendId, { detail: registerRouteAction })
        );
      });

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
            console.error(`Can't log in to ICAT: ${error.message}`)
          );
      }
    });
  }
}
