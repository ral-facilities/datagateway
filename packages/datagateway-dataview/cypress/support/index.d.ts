declare namespace Cypress {
  interface Chainable {
    login(
      credentials?: {
        username: string;
        password: string;
        mechanism: string;
      },
      user?: string
    ): Cypress.Chainable<Cypress.Response>;
    clearDownloadCart(): Cypress.Chainable<Cypress.Response>;
  }
}
