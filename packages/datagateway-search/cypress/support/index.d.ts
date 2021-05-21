declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    login(): Cypress.Chainable<Cypress.Response>;
    clearDownloadCart(): Cypress.Chainable<Cypress.Response>;
  }
}
