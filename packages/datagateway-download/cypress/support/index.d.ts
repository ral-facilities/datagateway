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

    seedDownloadCart(): Cypress.Chainable<Cypress.Response>;

    seedMintCart(): Cypress.Chainable<Cypress.Response>;

    clearDataPublications(): Cypress.Chainable<Cypress.Response>;

    addCartItem(cartItem: string): Cypress.Chainable<Cypress.Response>;

    seedDownloads(): Cypress.Chainable<Cypress.Response>;

    clearDownloads(): Cypress.Chainable<Cypress.Response>;
  }
}
