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
  cy.request('POST', `http://scigateway-preprod.esc.rl.ac.uk:5000/sessions`, {
    username: username,
    password: password,
  }).then(response => {
    window.localStorage.setItem('daaas:token', response.body.sessionID);
  });

  // TODO: replace with getting from daaas:token when supported
  cy.request({
    method: 'POST',
    url: 'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/session',
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

Cypress.Commands.add('deleteTestDownload', fileName => {
  // Make sure to delete the downloaded file.
  console.log(Cypress.platform);
  if (Cypress.platform === 'win32') {
    cy.exec('echo %USERPROFILE%').then(result => {
      cy.readFile(`${result.stdout}\\Downloads\\LILS_2020-1-1_1-1-1.zip`);
      cy.exec(`del ${result.stdout}\\Downloads\\${fileName}`)
        .its('code')
        .should('eq', 0);
    });
  } else {
    // TODO: Find out what the default location files will download to on linux. ~/Downloads?
  }
});
