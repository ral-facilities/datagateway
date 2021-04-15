declare namespace Cypress {
  interface Chainable {
    login(credentials?: {
      username: string;
      password: string;
      mechanism: string;
    }): Cypress.Chainable<Cypress.Response>;
    clearDownloadCart(): Cypress.Chainable<Cypress.Response>;
  }
}
