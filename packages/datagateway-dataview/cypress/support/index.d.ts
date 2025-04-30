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
    seedDownloadCart(cartItems: string[]): Cypress.Chainable<Cypress.Response>;
    seedUserGeneratedDataPublication(
      title?: string
    ): Cypress.Chainable<Cypress.Response>;
    clearUserGeneratedDataPublications(
      ids: string[]
    ): Cypress.Chainable<Cypress.Response>;
  }
}
