import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'custom-event-polyfill';
import 'url-search-params-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import singleSpaReact from 'single-spa-react';
import * as log from 'loglevel';

import { RequestPluginRerenderType, MicroFrontendId } from 'datagateway-common';

const pluginName = 'datagateway-dataview';

const render = (): void => {
  const el = document.getElementById(pluginName);
  if (el) {
    ReactDOM.render(<App />, document.getElementById(pluginName));
  }
};

render();

if (process.env.NODE_ENV === `development`) {
  log.setDefaultLevel(log.levels.DEBUG);
} else {
  log.setDefaultLevel(log.levels.ERROR);
}

function domElementGetter(): HTMLElement {
  // Make sure there is a div for us to render into
  let el = document.getElementById(pluginName);
  if (!el) el = document.createElement('div');

  return el;
}

window.addEventListener('single-spa:routing-event', () => {
  render();
});

document.addEventListener(MicroFrontendId, e => {
  const action = (e as CustomEvent).detail;
  if (action.type === RequestPluginRerenderType) {
    render();
  }
});

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  domElementGetter,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: any): Promise<void> {
  return reactLifecycles
    .bootstrap(props)
    .then(() => {
      log.info(`${pluginName} has been successfully bootstrapped`);
    })
    .catch(error => {
      log.error(`${pluginName} failed whilst bootstrapping: ${error}`);
    });
}

export function mount(props: any): Promise<void> {
  return reactLifecycles
    .mount(props)
    .then(() => {
      log.info(`${pluginName} has been successfully mounted`);
    })
    .catch(error => {
      log.error(`${pluginName} failed whilst mounting: ${error}`);
    });
}

export function unmount(props: any): Promise<void> {
  return reactLifecycles
    .unmount(props)
    .then(() => {
      log.info(`${pluginName} has been successfully unmounted`);
    })
    .catch(error => {
      log.error(`${pluginName} failed whilst unmounting: ${error}`);
    });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
