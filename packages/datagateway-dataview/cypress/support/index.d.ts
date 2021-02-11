declare namespace Cypress {
  interface Chainable<Subject> {
    login(): Cypress.Chainable<Cypress.Response>;
    clearDownloadCart(): Cypress.Chainable<Cypress.Response>;
  }
}
