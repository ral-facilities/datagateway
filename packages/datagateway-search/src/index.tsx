import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'custom-event-polyfill';
import 'url-search-params-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as log from 'loglevel';
import axios from 'axios';
import jsrsasign from 'jsrsasign';
import singleSpaReact from 'single-spa-react';

import { MicroFrontendMessageId, RegisterRouteType } from 'datagateway-common';

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
  let el = document.getElementById(pluginName);
  if (el) {
    ReactDOM.render(<App />, document.getElementById(pluginName));
  }
};

window.addEventListener('single-spa:routing-event', () => {
  // attempt to re-render the plugin if the route has changed
  render();
});

document.addEventListener('scigateway', e => {
  // attempt to re-render the plugin if scigateway tells us to
  const action = (e as CustomEvent).detail;
  if (action.type === 'scigateway:api:plugin_rerender') {
    render();
  }
});

/* eslint-disable @typescript-eslint/no-explicit-any */
// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: any): Promise<void> {
  return reactLifecycles.bootstrap(props);
}

export function mount(props: any): Promise<void> {
  return reactLifecycles.mount(props);
}

export function unmount(props: any): Promise<void> {
  return reactLifecycles.unmount(props);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

if (process.env.NODE_ENV === `development`) {
  log.setDefaultLevel(log.levels.DEBUG);
  render();

  // TODO: get urls from settings file
  const icatUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/icat';
  const apiUrl = 'http://scigateway-preprod.esc.rl.ac.uk:5000';
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
    .then(response => {
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
        .catch(error => {
          log.error(
            `datagateway-api cannot verify ICAT session id: ${error.message}.
               This is likely caused if datagateway-api is pointing to a
               different ICAT than the one used by the IDS/TopCAT`
          );
        });
    })
    .catch(error => log.error(`Can't log in to ICAT: ${error.message}`));
}

document.dispatchEvent(
  new CustomEvent(MicroFrontendMessageId, {
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
