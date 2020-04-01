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
import { MicroFrontendToken } from 'datagateway-common';

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

  // TODO: get urls from settings file
  const icatUrl = 'https://scigateway-preprod.esc.rl.ac.uk:8181/icat';
  const apiUrl = 'https://scigateway-preprod.esc.rl.ac.uk:5000/';
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

          window.localStorage.setItem(MicroFrontendToken, jwt);
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

window.addEventListener('single-spa:routing-event', () => {
  render();
});
