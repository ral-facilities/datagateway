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
import { Provider } from 'react-redux';

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
      window.localStorage.setItem('daaas:token', response.data.sessionID);
    })
    .catch((error: { message: any }) => {
      log.error(`Can't contact API.`);
    });
}
// TODO: if it's still needed, get icatUrl from settings file
const icatUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/session/';

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
  })
  .catch((error: { message: any }) => {
    log.error(`Token was not retrieved.`);
  });

console.log('test: daaas token retrieved =');
console.log(window.localStorage.getItem('daaas:token'));

console.log('test: icat token retrieved =');
console.log(window.localStorage.getItem('icat:token'));

console.log(JSON.stringify(icatCreds));

window.addEventListener('single-spa:routing-event', () => {
  render();
});
