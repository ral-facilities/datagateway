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
import { setSettings } from './settings';
import {
  MicroFrontendId,
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

// window.addEventListener('single-spa:routing-event', () => {
//   // attempt to re-render the plugin if the route has changed
//   console.log('single-spa:routing-event');
//   render();
// });

// document.addEventListener('scigateway', (e) => {
//   // attempt to re-render the plugin if scigateway tells us to
//   const action = (e as CustomEvent).detail;
//   if (action.type === 'scigateway:api:plugin_rerender') {
//     console.log('scigateway:api:plugin_rerender');
//     render();
//   }
// });

// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: unknown): Promise<void> {
  return reactLifecycles.bootstrap(props);
}

const fetchSettings = (): Promise<void> => {
  console.log('fetching settings');
  const settingsPath = process.env.REACT_APP_SEARCH_BUILD_DIRECTORY
    ? process.env.REACT_APP_SEARCH_BUILD_DIRECTORY +
      'datagateway-search-settings.json'
    : '/datagateway-search-settings.json';
  return axios
    .get(settingsPath)
    .then((res) => {
      const settings = res.data;
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
      setSettings(settings);
    })
    .catch((error) => {
      log.error(`Error loading ${settingsPath}: ${error.message}`);
    });
};

fetchSettings();

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
}
