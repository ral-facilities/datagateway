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

Cypress.Commands.add('login', (username, password) => {
  return cy.readFile('server/e2e-settings.json').then(settings => {
    cy.request('POST', `${settings.apiUrl}/sessions`, {
      username: username,
      password: password,
    }).then(response => {
      window.localStorage.setItem('daaas:token', response.body.sessionID);
    });

    // TODO: replace with getting from daaas:token when supported
    const splitUrl = settings.downloadApiUrl.split('/');
    const icatUrl = `${splitUrl.slice(0, splitUrl.length - 1).join('/')}/icat`;
    cy.request({
      method: 'POST',
      url: `${icatUrl}/session`,
      body: {
        json: JSON.stringify({
          plugin: 'simple',
          credentials: [{ username: 'root' }, { password: 'pw' }],
        }),
      },
      form: true,
    }).then(response => {
      window.localStorage.setItem('icat:token', response.body.sessionId);
    });
  });
});

Cypress.Commands.add('clearDownloadCart', () => {
  return cy.readFile('server/e2e-settings.json').then(settings => {
    // TODO: find facility from somewhere...
    cy.request({
      method: 'DELETE',
      url: `${settings.downloadApiUrl}/user/cart/LILS/cartItems`,
      qs: {
        sessionId: window.localStorage.getItem('icat:token'),
        items: '*',
      },
    });
  });
});

// Cypress.Commands.add('clearDownloads', () => {
// });

// Cypress.Commands.add('seedDownloads', () => {
// });
