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

Cypress.Commands.add('login', (username, password, noRootCredentials) => {
  // cy.request('POST', `http://scigateway-preprod.esc.rl.ac.uk:5000/sessions`, {
  //   username: username,
  //   password: password,
  // }).then(response => {
  //   window.localStorage.setItem('daaas:token', response.body.sessionID);
  // });

  let credentials = !noRootCredentials
    ? [{ username: 'root' }, { password: 'pw' }]
    : [{ username: username }, { password: password }];

  // TODO: replace with getting from daaas:token when supported
  cy.request({
    method: 'POST',
    url: 'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/session',
    body: {
      json: JSON.stringify({
        plugin: 'simple',
        credentials: credentials,
      }),
    },
    form: true,
  }).then(response => {
    window.localStorage.setItem('daaas:token', response.body.sessionId);
    window.localStorage.setItem('icat:token', response.body.sessionId);
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
      sessionId: window.localStorage.getItem('icat:token'),
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
      sessionId: window.localStorage.getItem('icat:token'),
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
      sessionId: window.localStorage.getItem('icat:token'),
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
        sessionId: window.localStorage.getItem('icat:token'),
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
        sessionId: window.localStorage.getItem('icat:token'),
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
      sessionId: window.localStorage.getItem('icat:token'),
      facilityName: 'LILS',
      queryOffset: 'where download.isDeleted = false',
    },
  }).then(response => {
    const downloads = response.body;
    for (let i in downloads) {
      const download = downloads[i];
      cy.request({
        method: 'PUT',
        url: `https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/download/${download.id}/status`,
        body: {
          sessionId: window.localStorage.getItem('icat:token'),
          facilityName: 'LILS',
          value: downloadsInfo[i].availability,
        },
        form: true,
      });
    }
  });
});

Cypress.Commands.add('clearDownloads', () => {
  // TODO: get url and facility from settings
  cy.request({
    method: 'GET',
    url: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/downloads',
    qs: {
      facilityName: 'LILS',
      sessionId: window.localStorage.getItem('icat:token'),
      queryOffset: 'where download.isDeleted = false',
    },
  }).then(response => {
    const downloads = response.body;
    for (let i in downloads) {
      const download = downloads[i];

      cy.request({
        method: 'PUT',
        url: `https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/download/${download.id}/isDeleted`,
        body: {
          sessionId: window.localStorage.getItem('icat:token'),
          facilityName: 'LILS',
          value: 'true',
        },
        form: true,
      });
    }
  });
});
