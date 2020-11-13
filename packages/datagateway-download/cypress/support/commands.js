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

const downloadsInfo = [
  {
    availability: 'COMPLETE',
    submitDetails: {
      transport: 'https',
      email: 'user1@test.com',
      fileName: 'test-file-1',
    },
  },
  {
    availability: 'RESTORING',
    submitDetails: {
      transport: 'globus',
      email: 'user2@test.com',
      fileName: 'test-file-2',
    },
  },
  {
    availability: 'PREPARING',
    submitDetails: {
      transport: 'http',
      email: '',
      fileName: 'test-file-3',
    },
  },
  {
    availability: 'EXPIRED',
    submitDetails: {
      transport: 'globus',
      email: '',
      fileName: 'test-file-4',
    },
  },
];

const parseJwt = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = decodeURIComponent(
    atob(base64).replace(/(.)/g, function (m, p) {
      var code = p.charCodeAt(0).toString(16).toUpperCase();
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
  cy.request({
    method: 'POST',
    url: 'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/session',
    body: {
      json: JSON.stringify({
        plugin: 'simple',
        credentials: [{ username: username }, { password: password }],
      }),
    },
    form: true,
  }).then((response) => {
    const jwtHeader = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sessionId: response.body.sessionId,
      username: 'test',
    };
    const jwt = jsrsasign.KJUR.jws.JWS.sign('HS256', jwtHeader, payload, 'shh');

    window.localStorage.setItem('scigateway:token', jwt);
  });
});

Cypress.Commands.add('clearDownloadCart', () => {
  // TODO: get url from settings
  // TODO: find facility from somewhere... (e2e settings?)
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
  // TODO: find facility from somewhere... (e2e settings?)

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

Cypress.Commands.add('addCartItem', (cartItem) => {
  // TODO: get url from settings
  // TODO: find facility from somewhere... (e2e settings?)

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

Cypress.Commands.add('seedDownloads', () => {
  let i = 1;
  for (var info of downloadsInfo) {
    // Seed a single cart item as items are cleared after each download.
    cy.request({
      method: 'POST',
      url:
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/cartItems',
      body: {
        sessionId: readSciGatewayToken().sessionId,
        items: `investigation ${i}`,
      },
      form: true,
    });

    // Submit each download request.
    cy.request({
      method: 'POST',
      url:
        'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/submit',
      body: {
        ...info.submitDetails,
        sessionId: readSciGatewayToken().sessionId,
        zipType: 'ZIP',
      },
      form: true,
    });
  }

  // Change the status of the download on the server for tests.
  cy.request({
    method: 'GET',
    url: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/downloads',
    qs: {
      sessionId: readSciGatewayToken().sessionId,
      facilityName: 'LILS',
      queryOffset: 'where download.isDeleted = false',
    },
  }).then((response) => {
    const downloads = response.body;
    for (let i in downloads) {
      const download = downloads[i];
      cy.request({
        method: 'PUT',
        url: `https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/download/${download.id}/status`,
        body: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: 'LILS',
          value: downloadsInfo[i].availability,
        },
        form: true,
      });
    }
  });
});

Cypress.Commands.add('clearDownloads', () => {
  // TODO: get url and facility from settings (e2e settings?)
  cy.request({
    method: 'GET',
    url: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/downloads',
    qs: {
      facilityName: 'LILS',
      sessionId: readSciGatewayToken().sessionId,
      queryOffset: 'where download.isDeleted = false',
    },
  }).then((response) => {
    const downloads = response.body;
    for (let i in downloads) {
      const download = downloads[i];

      cy.request({
        method: 'PUT',
        url: `https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/download/${download.id}/isDeleted`,
        body: {
          sessionId: readSciGatewayToken().sessionId,
          facilityName: 'LILS',
          value: 'true',
        },
        form: true,
      });
    }
  });
});
