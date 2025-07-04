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
import App, { ErrorFallback } from './App';
import { DownloadSettings } from './ConfigProvider';
import './i18n';
import './index.css';
import { setSettings } from './settings';

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
  ReactDOMClient,
  rootComponent: () =>
    document.getElementById('datagateway-download') ? <App /> : null,
  domElementGetter,
  errorBoundary(error) {
    log.error(`datagateway-download failed with error: ${error}`);
    return <ErrorFallback />;
  },
});

const render = (): void => {
  const el = document.getElementById('datagateway-download');
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

export function mount(props: unknown): Promise<void> {
  return reactLifecycles.mount(props);
}

export function unmount(props: unknown): Promise<void> {
  return reactLifecycles.unmount(props);
}

// only export this for testing
export const fetchSettings = (): Promise<DownloadSettings | void> => {
  const settingsPath = import.meta.env.VITE_DOWNLOAD_BUILD_DIRECTORY
    ? import.meta.env.VITE_DOWNLOAD_BUILD_DIRECTORY +
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
            hideFromMenu: route['hideFromMenu'] ?? false,
            admin: route['admin'] ?? false,
            order: route['order'] ?? 0,
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
  import.meta.env.MODE === 'development' ||
  import.meta.env.VITE_BUILD_STANDALONE
) {
  render();

  if (import.meta.env.MODE === 'development') {
    settings.then((settingsResult) => {
      if (settingsResult) {
        const apiUrl = settingsResult.apiUrl;
        axios
          .post(`${apiUrl}/sessions`, {
            username: 'root',
            password: 'pw',
            mechanism: 'simple',
          })
          .then((response) => {
            const jwtHeader = { alg: 'HS256', typ: 'JWT' };
            const payload = {
              sessionId: response.data.sessionID,
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
}
