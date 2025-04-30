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

Cypress.Commands.add('login', (credentials, user) => {
  cy.session([credentials, user], () => {
    cy.request('datagateway-dataview-settings.json').then((response) => {
      const settings = response.body;
      let body = {
        username: '',
        password: '',
        mechanism: 'anon',
      };
      if (credentials) {
        body = credentials;
      }
      cy.request('POST', `${settings.apiUrl}/sessions`, body).then(
        (response) => {
          const jwtHeader = { alg: 'HS256', typ: 'JWT' };
          const payload = {
            sessionId: response.body.sessionID,
            username:
              body.mechanism === 'anon'
                ? 'anon/anon'
                : user
                ? user
                : 'Michael222',
          };
          const jwt = jsrsasign.KJUR.jws.JWS.sign(
            'HS256',
            jwtHeader,
            payload,
            'shh'
          );
          window.localStorage.setItem('scigateway:token', jwt);
        }
      );
    });
  });
});

Cypress.Commands.add('clearDownloadCart', () => {
  return cy.request('datagateway-dataview-settings.json').then((response) => {
    const settings = response.body;
    cy.request({
      method: 'DELETE',
      url: `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/cartItems`,
      qs: {
        sessionId: readSciGatewayToken().sessionId,
        items: '*',
      },
    });
  });
});

// https://github.com/cypress-io/cypress/issues/877
Cypress.Commands.add('isScrolledTo', { prevSubject: true }, (element) => {
  cy.get(element).should(($el) => {
    const bottom = Cypress.$(cy.state('window')).height();
    const rect = $el[0].getBoundingClientRect();

    expect(rect.top).not.to.be.greaterThan(
      bottom,
      `Expected element not to be below the visible scrolled area`
    );
    expect(rect.top).to.be.greaterThan(
      0 - rect.height,
      `Expected element not to be above the visible scrolled area`
    );
  });
});

Cypress.Commands.add('seedUserGeneratedDataPublication', (title) => {
  return cy.request('datagateway-dataview-settings.json').then((response) => {
    const settings = response.body;
    return cy.request({
      method: 'POST',
      url: `${settings.doiMinterUrl}/mint`,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
      body: {
        metadata: {
          title: title ?? 'Test DOI title',
          description: 'Test DOI description',
          // creators: [],
          related_items: [],
          resource_type: 'Collection',
        },
        // these ids are specifically mintable by the Chris481 user
        investigation_ids: [],
        dataset_ids: [15],
        datafile_ids: [74, 193],
      },
    });
  });
});

Cypress.Commands.add('clearUserGeneratedDataPublications', (ids) => {
  return cy.request('datagateway-dataview-settings.json').then((response) => {
    const settings = response.body;
    ids.forEach((id) => {
      cy.request({
        method: 'DELETE',
        url: `${settings.apiUrl}/datapublications/${id}`,
        headers: {
          Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
        },
      });
    });
  });
});

Cypress.Commands.add('seedDownloadCart', (cartItems) => {
  let items = '';

  if (!cartItems) {
    const entities = ['investigation', 'dataset', 'datafile'];
    items = Array(60)
      .fill()
      .map((value, index) => `${entities[index % 2]} ${index}`)
      .join(', ');
  } else {
    items = cartItems.join(', ');
  }

  return cy.request('datagateway-dataview-settings.json').then((response) => {
    const settings = response.body;
    cy.request({
      method: 'POST',
      url: `${settings.downloadApiUrl}/user/cart/${settings.facilityName}/cartItems`,
      body: {
        sessionId: readSciGatewayToken().sessionId,
        items,
      },
      form: true,
    });
  });
});
