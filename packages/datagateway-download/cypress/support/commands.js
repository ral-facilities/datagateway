// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import jsrsasign from 'jsrsasign';

const parseJwt = token => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = decodeURIComponent(
    atob(base64).replace(/(.)/g, function(m, p) {
      var code = p
        .charCodeAt(0)
        .toString(16)
        .toUpperCase();
      return '%' + ('00' + code).slice(-2);
    })
  );
  return payload;
};

export const readSciGatewayToken = () => {
  const token = window.localStorage.getItem('scigateway:token');
  let sessionId = null;
  let username = null;
  if (token) {
    const parsedToken = JSON.parse(parseJwt(token));
    if (parsedToken.sessionId) sessionId = parsedToken.sessionId;
    if (parsedToken.username) username = parsedToken.username;
  }

  return {
    sessionId,
    username,
  };
};

Cypress.Commands.add('login', (username, password) => {
  cy.request('POST', `http://scigateway-preprod.esc.rl.ac.uk:5000/sessions`, {
    username: username,
    password: password,
  }).then(response => {
    const jwtHeader = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sessionId: response.body.sessionID,
      username: 'test',
    };
    const jwt = jsrsasign.KJUR.jws.JWS.sign('HS256', jwtHeader, payload, 'shh');

    window.localStorage.setItem('scigateway:token', jwt);
  });
});

Cypress.Commands.add('clearDownloadCart', () => {
  // TODO: get url from settings
  // TODO: find facility from somewhere...
  cy.request({
    method: 'DELETE',
    url:
      'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/cartItems',
    qs: {
      sessionId: readSciGatewayToken().sessionId,
      items: '*',
    },
  });
});

Cypress.Commands.add('seedDownloadCart', () => {
  // TODO: get url from settings
  // TODO: find facility from somewhere...

  const entities = ['investigation', 'dataset', 'datafile'];
  const items = Array(60)
    .fill()
    .map((value, index) => `${entities[index % 2]} ${index}`)
    .join(', ');

  cy.request({
    method: 'POST',
    url:
      'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/cartItems',
    body: {
      sessionId: readSciGatewayToken().sessionId,
      items,
    },
    form: true,
  });
});

Cypress.Commands.add('addCartItem', cartItem => {
  // TODO: get url from settings
  // TODO: find facility from somewhere...

  cy.request({
    method: 'POST',
    url:
      'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/cartItems',
    body: {
      sessionId: readSciGatewayToken().sessionId,
      items: cartItem,
    },
    form: true,
  });
});

// Delete a test download file in the Windows download
// folder given the file name.
Cypress.Commands.add('deleteTestDownload', fileName => {
  if (Cypress.platform === 'win32') {
    cy.exec('echo %USERPROFILE%').then(result => {
      cy.readFile(`${result.stdout}\\Downloads\\${fileName}`);
      cy.exec(`del ${result.stdout}\\Downloads\\${fileName}`)
        .its('code')
        .should('eq', 0);
    });
  }
});
