import '@h5web/app/dist/style-lib.css';
import '@h5web/app/dist/style.css';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './i18n';
import App from './App';
import axios from 'axios';
import jsrsasign from 'jsrsasign';

import singleSpaReact from 'single-spa-react';

import {
  RequestPluginRerenderType,
  MicroFrontendId,
  MicroFrontendToken,
} from 'datagateway-common';

function domElementGetter(): HTMLElement {
  // Make sure there is a div for us to render into
  let el = document.getElementById('datagateway-h5web');
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
  const el = document.getElementById('datagateway-h5web');
  if (el) {
    ReactDOM.render(<App />, document.getElementById('datagateway-h5web'));
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

  if (process.env.NODE_ENV === `development`) {
    axios.get('./datagateway-h5web-settings.json').then((settings) => {
      const icatUrl = `${settings.data.icatUrl}`;
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
    });
  }
}
