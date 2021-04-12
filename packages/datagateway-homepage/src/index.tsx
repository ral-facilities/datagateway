import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import singleSpaReact from 'single-spa-react';

import {
  RequestPluginRerenderType,
  MicroFrontendId,
} from 'datagateway-common';

const pluginName = 'datagateway-homepage';

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

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById(pluginName)
);

const render = (): void => {
  const el = document.getElementById(pluginName);
  if (el) {
    ReactDOM.render(<App />, document.getElementById(pluginName));
  }
};

window.addEventListener('single-spa:routing-event', () => {
  // attempt to re-render the plugin if the corresponding div is present
  render();
});

document.addEventListener(MicroFrontendId, (e) => {
  // attempt to re-render the plugin if the corresponding div is present
  const action = (e as CustomEvent).detail;
  if (action.type === RequestPluginRerenderType) {
    // This is a temporary fix for the current issue with the tab indicator
    // not updating after the size of the page has been altered.
    // This is issue is being tracked by material-ui (https://github.com/mui-org/material-ui/issues/9337).
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('resize'));
    }, 125);
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

if (
  process.env.NODE_ENV === `development` ||
  process.env.REACT_APP_E2E_TESTING
) {
  render();
}

document.dispatchEvent(
  new CustomEvent(MicroFrontendId, { 
      detail: {
          type: 'scigateway:api:register_route',
          payload: {
              section: 'DataGateway Homepage',
              link: '/datagateway',
              plugin: 'datagateway-homepage',
              displayName: 'DataGateway Homepage',
              order: 0,
              helpText: 'New DataGateway Homepage',
          }
      }
  })
);
