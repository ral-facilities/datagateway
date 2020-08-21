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

import { MicroFrontendId, RegisterRouteType } from 'datagateway-common';

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

window.addEventListener('single-spa:routing-event', () => {
  // attempt to re-render the plugin if the route has changed
  render();
});

document.addEventListener('scigateway', (e) => {
  // attempt to re-render the plugin if scigateway tells us to
  const action = (e as CustomEvent).detail;
  if (action.type === 'scigateway:api:plugin_rerender') {
    render();
  }
});

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
/* eslint-enable @typescript-eslint/no-explicit-any */
if (
  process.env.NODE_ENV === `development` ||
  process.env.REACT_APP_E2E_TESTING
) {
  render();
  log.setDefaultLevel(log.levels.DEBUG);
}

document.dispatchEvent(
  new CustomEvent(MicroFrontendId, {
    detail: {
      type: RegisterRouteType,
      payload: {
        section: 'Test',
        link: '/search/data',
        plugin: 'datagateway-search',
        displayName: 'DataGateway Search',
        order: 0,
        helpText:
          'DataGateway Search allows you to search for specific datasets, datafiles or investigations using date and text filters.',
      },
    },
  })
);
