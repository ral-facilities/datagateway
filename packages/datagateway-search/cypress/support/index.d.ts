declare namespace Cypress {
  interface Chainable {
    login(): Cypress.Chainable<Cypress.Response>;
    clearDownloadCart(): Cypress.Chainable<Cypress.Response>;
  }
}
