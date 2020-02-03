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

const pluginName = 'datagateway-search';

const render = (): void => {
  let el = document.getElementById(pluginName);
  if (el) {
    ReactDOM.render(<App />, document.getElementById(pluginName));
  }
};

render();

if (process.env.NODE_ENV === `development`) {
  log.setDefaultLevel(log.levels.DEBUG);
  axios
    .post('/sessions', { username: 'user', password: 'password' })
    .then(response => {
      window.localStorage.setItem('icat:token', response.data.sessionID);
    });

  // TODO: if it's still needed, get icatUrl from settings file
  const icatUrl = '';

  // TODO: get ICAT session ID from daaas:token
  const icatCreds = {
    plugin: 'simple',
    credentials: [{ username: 'root' }, { password: 'pw' }],
  };

  axios
    .post(icatUrl, `json=${JSON.stringify(icatCreds)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(response => {
      window.localStorage.setItem('icat:token', response.data.sessionId);
    });
} else {
  log.setDefaultLevel(log.levels.ERROR);
}

window.addEventListener('single-spa:routing-event', () => {
  render();
});
